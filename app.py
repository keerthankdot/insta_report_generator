"""ReportEngine by Ascnd — main entry point.

Login gate routes to AM dashboard or Creative dashboard based on role.
Role is set by the login system via st.session_state.user["role"].
"""

import base64
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import streamlit as st
import streamlit.components.v1 as components
from dotenv import load_dotenv

load_dotenv()

from src.auth import create_session, delete_session, get_session, verify_user

st.set_page_config(
    page_title="ReportEngine by Ascnd",
    page_icon="\U0001F4CA",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Hide Deploy button and 3-dot toolbar globally
st.markdown(
    """
    <style>
        #MainMenu { visibility: hidden; }
        [data-testid="stToolbar"] { display: none !important; }
        [data-testid="stAppDeployButton"] { display: none !important; }
        [data-testid="stDecoration"] { display: none !important; }
    </style>
    """,
    unsafe_allow_html=True,
)

# --- Session state defaults ---
if "authenticated" not in st.session_state:
    st.session_state.authenticated = False
if "user" not in st.session_state:
    st.session_state.user = None

# --- Restore session from URL token (survives refresh) ---
if not st.session_state.authenticated:
    tok = st.query_params.get("tok")
    if tok:
        user = get_session(tok)
        if user:
            st.session_state.authenticated = True
            st.session_state.user = user
            st.session_state.session_token = tok

# --- Login gate ---
if not st.session_state.authenticated:
    video_path = Path(__file__).resolve().parent / "landing.mp4"
    if video_path.exists():
        video_b64 = base64.b64encode(video_path.read_bytes()).decode()
        components.html(
            f"""
            <script>
            (function() {{
                var p = window.parent.document;
                ['tnt-bg-style','tnt-bg-wrap','tnt-bg-overlay'].forEach(function(id) {{
                    var el = p.getElementById(id);
                    if (el) el.remove();
                }});
                var style = p.createElement('style');
                style.id = 'tnt-bg-style';
                style.textContent = `
                    #tnt-bg-wrap {{
                        position: fixed; inset: 0; z-index: -2;
                        overflow: hidden; background: #000;
                    }}
                    #tnt-bg-wrap video {{
                        position: absolute; top: 50%; left: 50%;
                        width: 100vh; height: 100vw;
                        transform: translate(-50%, -50%) rotate(90deg);
                        object-fit: cover;
                    }}
                    #tnt-bg-overlay {{
                        position: fixed; inset: 0; z-index: -1;
                        background: rgba(0,0,0,0.52);
                    }}
                `;
                p.head.appendChild(style);
                var wrap = p.createElement('div');
                wrap.id = 'tnt-bg-wrap';
                var vid = p.createElement('video');
                vid.autoplay = true; vid.muted = true; vid.loop = true;
                vid.setAttribute('playsinline', '');
                var src = p.createElement('source');
                src.src = 'data:video/mp4;base64,{video_b64}';
                src.type = 'video/mp4';
                vid.appendChild(src);
                wrap.appendChild(vid);
                p.body.insertBefore(wrap, p.body.firstChild);
                vid.play();
                var overlay = p.createElement('div');
                overlay.id = 'tnt-bg-overlay';
                p.body.insertBefore(overlay, wrap.nextSibling);
            }})();
            </script>
            """,
            height=0,
        )

    st.markdown(
        """
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@700,900&display=swap" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" />
        <style>
            #MainMenu, header, footer { visibility: hidden; }
            .block-container { padding: 0 !important; max-width: 100% !important; }
            body { background: #000 !important; font-family: 'Inter', system-ui, sans-serif !important; }
            .stApp, .stAppViewContainer,
            [data-testid="stAppViewBlockContainer"],
            [data-testid="stMain"] { background: transparent !important; }

            /* Title — single line, spans full column width edge to edge */
            .login-title {
                width: 100%;
                font-size: clamp(1rem, 4.2vw, 2.75rem);
                font-weight: 900;
                color: #fff;
                font-family: 'Satoshi', sans-serif;
                white-space: nowrap;
                text-align: justify;
                text-align-last: justify;
                text-justify: inter-word;
                margin-bottom: 20px;
                line-height: 1;
            }

            /* Match input width exactly to button width */
            [data-testid="stTextInput"] {
                width: 100% !important;
            }
            [data-testid="stTextInput"] > div {
                width: 100% !important;
                padding-left: 0 !important;
                padding-right: 0 !important;
            }
            [data-baseweb="input"] {
                width: 100% !important;
            }

            /* Strip dark background from every nested div inside the input */
            [data-baseweb="input"] > div,
            [data-baseweb="input"] > div > div,
            [data-baseweb="input"] > div > div > div {
                background: transparent !important;
                background-color: transparent !important;
            }

            /* Input shell — matches reference exactly */
            [data-baseweb="input"] {
                background: rgba(255,255,255,0.08) !important;
                background-color: rgba(255,255,255,0.08) !important;
                border: 1px solid rgba(255,255,255,0.20) !important;
                border-radius: 9999px !important;
                backdrop-filter: blur(20px) !important;
                -webkit-backdrop-filter: blur(20px) !important;
                box-shadow:
                    inset 0 1px 0 rgba(255,255,255,0.12),
                    inset 0 -1px 0 rgba(0,0,0,0.15) !important;
                overflow: hidden !important;
                min-height: 48px !important;
                height: 48px !important;
            }

            [data-baseweb="input"]:focus-within {
                border-color: rgba(255,255,255,0.40) !important;
                background: rgba(255,255,255,0.12) !important;
            }

            /* Eye button — same gap from right edge as text starts from left (24px) */
            [data-baseweb="input"] button {
                margin-right: 16px !important;
                background: transparent !important;
                border: none !important;
                color: rgba(255,255,255,0.35) !important;
                padding: 0 !important;
                flex-shrink: 0 !important;
            }
            [data-baseweb="input"] button:hover {
                color: rgba(255,255,255,0.65) !important;
            }
            /* Extra padding-right on input so text never slides under the eye */
            [data-baseweb="input"] input {
                padding-right: 52px !important;
            }

            /* Input text + padding — Inter body */
            [data-baseweb="input"] input {
                background: transparent !important;
                background-color: transparent !important;
                color: #fff !important;
                caret-color: #fff !important;
                font-size: 1rem !important;
                font-family: 'Inter', system-ui, sans-serif !important;
                padding: 12px 24px !important;
            }
            [data-baseweb="input"] input::placeholder {
                color: rgba(255,255,255,0.30) !important;
            }

            /* Hide "Press Enter to apply" */
            [data-testid="InputInstructions"] { display: none !important; }

            /* Labels — JetBrains Mono */
            [data-testid="stTextInput"] label,
            [data-testid="stTextInput"] label p {
                color: rgba(255,255,255,0.95) !important;
                font-size: 0.875rem !important;
                font-weight: 500 !important;
                font-family: 'Inter', system-ui, sans-serif !important;
            }

            /* Strip child bg so gradient on outer element shows through */
            [data-testid="stBaseButton-primary"] *,
            [data-testid="stButton"] > button * {
                background: transparent !important;
                background-color: transparent !important;
            }

            /* Sign in button — exact frosted glass pill */
            [data-testid="stBaseButton-primary"],
            [data-testid="stButton"] > button {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 12px 20px !important;
                border-radius: 9999px !important;
                font-size: 1rem !important;
                font-weight: 500 !important;
                color: rgba(255,255,255,0.95) !important;
                font-family: 'Inter', system-ui, sans-serif !important;
                background: linear-gradient(to bottom, rgba(255,255,255,0.22), rgba(255,255,255,0.06)) !important;
                backdrop-filter: blur(20px) !important;
                -webkit-backdrop-filter: blur(20px) !important;
                border: 1px solid rgba(255,255,255,0.30) !important;
                box-shadow:
                    0 8px 32px rgba(0,0,0,0.45),
                    inset 0 1.5px 0 rgba(255,255,255,0.45),
                    inset 0 -1px 0 rgba(0,0,0,0.20) !important;
                min-height: 48px !important;
                height: 48px !important;
                transition: all 0.2s !important;
            }
            [data-testid="stBaseButton-primary"]:hover,
            [data-testid="stButton"] > button:hover {
                transform: translateY(-1px) !important;
                background: linear-gradient(to bottom, rgba(255,255,255,0.28), rgba(255,255,255,0.10)) !important;
                border-color: rgba(255,255,255,0.40) !important;
            }
            [data-testid="stBaseButton-primary"]:disabled,
            [data-testid="stButton"] > button:disabled {
                opacity: 0.50 !important;
                cursor: wait !important;
            }

            /* Error */
            [data-testid="stAlert"] {
                background: rgba(255,60,60,0.1) !important;
                border: 1px solid rgba(255,80,80,0.25) !important;
                border-radius: 14px !important;
                backdrop-filter: blur(10px) !important;
            }
        </style>
        """,
        unsafe_allow_html=True,
    )

    # Narrow centre column so inputs match reference width (~360px)
    col_l, col_m, col_r = st.columns([3, 2, 3])
    with col_m:
        st.markdown("<div style='height:30vh'></div>", unsafe_allow_html=True)
        st.markdown("<div class='login-title'>THE NEW THING</div>", unsafe_allow_html=True)
        with st.form("login_form", border=False):
            email = st.text_input("Email", key="login_email", placeholder="you@domain.com")
            password = st.text_input("Password", type="password", key="login_password", placeholder="••••••••")
            submitted = st.form_submit_button("Sign in", type="primary", use_container_width=True)
        if submitted:
            if not email or not password:
                st.error("Enter email and password.")
            else:
                user = verify_user(email, password)
                if user:
                    tok = create_session(user)
                    st.session_state.authenticated = True
                    st.session_state.user = user
                    st.session_state.session_token = tok
                    st.query_params["tok"] = tok
                    components.html(
                        f"<script>localStorage.setItem('tnt_tok','{tok}');</script>",
                        height=0,
                    )
                    st.rerun()
                else:
                    st.error("Invalid email or password.")
    st.stop()

# --- Dashboard ---
user = st.session_state.user

from src.am_dashboard import render
render(user)
