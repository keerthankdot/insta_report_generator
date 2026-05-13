"""User authentication for ReportEngine.

Loads users from config/users.json and verifies email/password credentials.
"""

import json
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

USERS_PATH = Path(__file__).parent.parent / "config" / "users.json"


def verify_user(email: str, password: str) -> Optional[dict]:
    """Verify email and password against users.json.

    Args:
        email: User email (case-insensitive).
        password: Plain-text password.

    Returns:
        User dict {email, name, role} on success, None on failure.
    """
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
            logger.warning("Wrong password for %s", email)
            return None

    logger.warning("No user found: %s", email)
    return None
