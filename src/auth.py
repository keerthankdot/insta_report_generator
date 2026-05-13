"""User authentication and session management for ReportEngine."""

import json
import logging
import uuid
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

USERS_PATH = Path(__file__).parent.parent / "config" / "users.json"
# File-based sessions survive Streamlit auto-reloads and server restarts
SESSIONS_PATH = Path(__file__).parent.parent / ".sessions.json"


def _load_sessions() -> dict:
    try:
        if SESSIONS_PATH.exists():
            return json.loads(SESSIONS_PATH.read_text())
    except Exception:
        pass
    return {}


def _save_sessions(sessions: dict) -> None:
    try:
        SESSIONS_PATH.write_text(json.dumps(sessions))
    except Exception as e:
        logger.error("Could not save sessions: %s", e)


def verify_user(email: str, password: str) -> Optional[dict]:
    try:
        with open(USERS_PATH) as f:
            users = json.load(f).get("users", [])
    except FileNotFoundError:
        logger.error("users.json not found at %s", USERS_PATH)
        return None

    email_lower = email.strip().lower()
    for user in users:
        if user.get("email", "").lower() == email_lower:
            if user.get("password") == password:
                return {"email": user["email"], "name": user["name"], "role": user["role"]}
            return None
    return None


def create_session(user: dict) -> str:
    """Create a persistent session token for a verified user."""
    token = str(uuid.uuid4())
    sessions = _load_sessions()
    sessions[token] = user
    _save_sessions(sessions)
    return token


def get_session(token: str) -> Optional[dict]:
    """Return the user dict for a valid token, or None."""
    return _load_sessions().get(token)


def delete_session(token: str) -> None:
    sessions = _load_sessions()
    sessions.pop(token, None)
    _save_sessions(sessions)
