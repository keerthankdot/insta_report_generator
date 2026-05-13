"""Account Manager dashboard for ReportEngine.

Landing: brand-by-brand overview grid.
Detail: click a brand to see metrics, upload CSVs, generate reports.
"""

import json
import os
import tempfile
from pathlib import Path
from typing import Optional

import pandas as pd
import streamlit as st

from src import ig_processor, x_processor
from src.analytics import compute_deltas, compute_goals_actuals, compute_health_score, split_by_period
from src.pptx_generator import generate_report
from src.sheets_writer import SheetsWriter

BRANDS_PATH = Path(__file__).parent.parent / "config" / "brands.json"


def _load_brands() -> list[dict]:
    try:
        with open(BRANDS_PATH) as f:
            return json.load(f).get("brands", [])
    except FileNotFoundError:
        return []


def _brand_data(brand_name: str) -> dict:
    """Get cached session data for a brand."""
    return st.session_state.get("brand_data", {}).get(brand_name, {})


def _save_brand_data(brand_name: str, ig_df=None, x_df=None) -> None:
    if "brand_data" not in st.session_state:
        st.session_state.brand_data = {}
    existing = st.session_state.brand_data.get(brand_name, {})
    if ig_df is not None:
        existing["ig_df"] = ig_df
    if x_df is not None:
        existing["x_df"] = x_df
    st.session_state.brand_data[brand_name] = existing


def _delta_label(delta: Optional[dict]) -> tuple[Optional[float], Optional[str]]:
    if delta is None or delta.get("delta_pct") is None:
        return None, None
    pct = delta["delta_pct"]
    return pct, f"{'+' if pct > 0 else ''}{pct}% vs prior"


# ─── Overview ────────────────────────────────────────────────────────────────

def _render_overview(user: dict, brands: list[dict]) -> None:
    st.markdown(
        f"<h1 style='margin-bottom:4px'>Brand Overview</h1>"
        f"<p style='color:rgba(255,255,255,0.5);margin-bottom:32px'>"
        f"Logged in as {user['name']}. Select a brand to view or upload data.</p>",
        unsafe_allow_html=True,
    )

    if not brands:
        st.info("No brands configured. Add brands to config/brands.json.")
        return

    cols_per_row = 3
    rows = [brands[i:i+cols_per_row] for i in range(0, len(brands), cols_per_row)]

    for row in rows:
        cols = st.columns(cols_per_row)
        for col, brand in zip(cols, row):
            with col:
                _render_brand_card(brand)


def _render_brand_card(brand: dict) -> None:
    name = brand["name"]
    color = brand.get("color", "#1E3C73")
    data = _brand_data(name)
    ig_df = data.get("ig_df")
    x_df = data.get("x_df")

    has_data = ig_df is not None or x_df is not None

    # Build metric lines
    ig_line = ""
    x_line = ""
    if ig_df is not None and len(ig_df) > 0:
        reach = f"{int(ig_df['reach'].sum()):,}"
        eng = f"{round(ig_df['engagement_rate'].mean(), 2)}%"
        ig_line = f"<div style='font-size:0.78rem;color:rgba(255,255,255,0.6);margin-top:6px'>IG &nbsp; Reach {reach} &nbsp;·&nbsp; Eng {eng}</div>"
    if x_df is not None and len(x_df) > 0:
        imp = f"{int(x_df['impressions'].sum()):,}"
        eng = f"{round(x_df['engagement_rate'].mean(), 2)}%"
        x_line = f"<div style='font-size:0.78rem;color:rgba(255,255,255,0.6);margin-top:2px'>X &nbsp;&nbsp;&nbsp; Imp {imp} &nbsp;·&nbsp; Eng {eng}</div>"

    status_dot = f"<span style='width:8px;height:8px;border-radius:50%;background:{'#27AE60' if has_data else '#555'};display:inline-block;margin-right:6px'></span>"
    status_label = "Data loaded" if has_data else "No data"

    st.markdown(
        f"""
        <div style="
            border:1px solid rgba(255,255,255,0.10);
            border-top: 3px solid {color};
            border-radius:12px;
            padding:20px 20px 14px;
            background:rgba(255,255,255,0.04);
            min-height:130px;
            margin-bottom:16px;
        ">
            <div style="font-size:1.1rem;font-weight:700;color:#fff">{name}</div>
            <div style="font-size:0.72rem;color:rgba(255,255,255,0.4);margin-top:4px;margin-bottom:8px">
                {status_dot}{status_label}
            </div>
            {ig_line}{x_line}
        </div>
        """,
        unsafe_allow_html=True,
    )
    # Invisible open trigger — styled as a small text link
    st.markdown(
        f"<style>div[data-testid='stButton']:has(button[key='card_open_{name}']) button"
        f"{{background:transparent!important;border:none!important;color:rgba(255,255,255,0.35)!important;"
        f"font-size:0.75rem!important;padding:0 0 10px 4px!important;text-align:left!important;"
        f"width:auto!important;margin-top:-18px!important;}}"
        f"div[data-testid='stButton']:has(button[key='card_open_{name}']) button:hover"
        f"{{color:#fff!important;}}</style>",
        unsafe_allow_html=True,
    )
    if st.button(f"Open →", key=f"card_open_{name}"):
        st.session_state.selected_brand = name
        st.session_state.nav = "brand_detail"
        st.rerun()


# ─── Brand detail ─────────────────────────────────────────────────────────────

def _render_am_notes_form(brand_name: str) -> dict:
    col1, col2 = st.columns(2)
    with col1:
        sentiment = st.selectbox(
            "Client Sentiment",
            options=["Positive", "Neutral", "Negative", "At Risk"],
            key=f"{brand_name}_sentiment",
        )
        wins = st.text_area(
            "Strategic Wins",
            placeholder="e.g. Reel hit 50k reach",
            key=f"{brand_name}_wins",
            height=90,
        )
        risks = st.text_area(
            "Upcoming Risks",
            placeholder="e.g. Approval delayed",
            key=f"{brand_name}_risks",
            height=90,
        )
    with col2:
        relationship_note = st.text_area(
            "Relationship Note",
            placeholder="e.g. Client very responsive this month",
            key=f"{brand_name}_relationship",
            height=75,
        )
        losses = st.text_area(
            "Misses / Focus Areas",
            placeholder="e.g. Story reach down 20%",
            key=f"{brand_name}_losses",
            height=90,
        )
        client_feedback = st.text_area(
            "Client Verbatim",
            placeholder="Direct quotes from call or email",
            key=f"{brand_name}_feedback",
            height=75,
        )
    return {
        "sentiment": sentiment, "wins": wins, "losses": losses,
        "risks": risks, "relationship_note": relationship_note,
        "client_feedback": client_feedback,
    }


def _render_brand_detail(user: dict, brand: dict) -> None:
    brand_name = brand["name"]
    color = brand.get("color", "#1E3C73")
    goals = brand.get("goals", {})

    # Back button
    if st.button("← Back to all brands"):
        st.session_state.selected_brand = None
        st.rerun()

    st.markdown(
        f"<h1 style='margin-top:8px;border-left:4px solid {color};padding-left:14px'>{brand_name}</h1>",
        unsafe_allow_html=True,
    )

    # Report type
    report_type = st.radio(
        "Report period",
        options=["Weekly", "Monthly"],
        horizontal=True,
        key=f"{brand_name}_report_type",
    ).lower()
    period_label = report_type.capitalize()

    st.divider()

    # ── Upload ──────────────────────────────────────────────────────────────
    st.subheader("Upload Data")
    cached = _brand_data(brand_name)
    ig_df: Optional[pd.DataFrame] = cached.get("ig_df")
    x_df: Optional[pd.DataFrame] = cached.get("x_df")

    up_col1, up_col2 = st.columns(2)
    with up_col1:
        ig_file = st.file_uploader(
            "Instagram CSV (Meta Business Suite)",
            type=["csv"],
            key=f"{brand_name}_ig_file",
        )
        if ig_file:
            try:
                with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
                    tmp.write(ig_file.getvalue())
                    tmp_path = tmp.name
                ig_df = ig_processor.process(tmp_path, brand_name)
                os.unlink(tmp_path)
                _save_brand_data(brand_name, ig_df=ig_df)
                dates = pd.to_datetime(ig_df["date"])
                st.success(
                    f"{len(ig_df)} posts · "
                    f"{dates.min().strftime('%b %-d')} – {dates.max().strftime('%b %-d, %Y')}"
                )
            except Exception as e:
                st.error(f"Instagram error: {e}")

    with up_col2:
        x_file = st.file_uploader(
            "X CSV (X Analytics)",
            type=["csv"],
            key=f"{brand_name}_x_file",
        )
        if x_file:
            try:
                with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
                    tmp.write(x_file.getvalue())
                    tmp_path = tmp.name
                x_df = x_processor.process(tmp_path, brand_name)
                os.unlink(tmp_path)
                _save_brand_data(brand_name, x_df=x_df)
                dates = pd.to_datetime(x_df["date"])
                st.success(
                    f"{len(x_df)} tweets · "
                    f"{dates.min().strftime('%b %-d')} – {dates.max().strftime('%b %-d, %Y')}"
                )
            except Exception as e:
                st.error(f"X error: {e}")

    if ig_df is None and x_df is None:
        st.info("Upload at least one CSV to see metrics.")
        return

    st.divider()

    # ── Performance overview ─────────────────────────────────────────────────
    st.subheader("Performance Overview")

    ig_current, ig_prior = split_by_period(ig_df, report_type) if ig_df is not None else (None, None)
    x_current, x_prior = split_by_period(x_df, report_type) if x_df is not None else (None, None)
    deltas = compute_deltas(ig_current, ig_prior, x_current, x_prior)
    goals_actuals = compute_goals_actuals(ig_df, x_df, goals, report_type)

    am_notes_pre = {
        "sentiment": st.session_state.get(f"{brand_name}_sentiment", "Neutral"),
    }
    health = compute_health_score(ig_df, x_df, goals, am_notes_pre, report_type)

    # Health score banner
    band_colors = {"Thriving": "#27AE60", "Healthy": "#3498DB", "At Risk": "#E67E22", "Critical": "#E74C3C"}
    hc = band_colors.get(health["band"], "#555")
    st.markdown(
        f"""<div style="background:{hc};border-radius:10px;padding:12px 20px;
            display:flex;align-items:center;gap:16px;margin-bottom:16px">
            <span style="font-size:2rem;font-weight:900;color:#fff">{health['score']}</span>
            <div>
                <div style="font-weight:700;color:#fff">{health['band']}</div>
                <div style="font-size:0.75rem;color:rgba(255,255,255,0.8)">
                    Campaign {health['breakdown']['campaign']} · Delivery {health['breakdown']['delivery']} · Sentiment {health['breakdown']['sentiment']}
                </div>
            </div>
            <span style="margin-left:auto;font-size:0.78rem;color:rgba(255,255,255,0.7)">Client Health Score</span>
        </div>""",
        unsafe_allow_html=True,
    )

    # Scorecards
    scorecard_data = []
    if ig_df is not None and len(ig_df) > 0:
        scorecard_data += [
            ("IG Posts", str(len(ig_df)), deltas.get("ig_posts")),
            ("IG Reach", f"{int(ig_df['reach'].sum()):,}", deltas.get("ig_reach")),
            ("IG Eng. Rate", f"{round(ig_df['engagement_rate'].mean(), 2)}%", deltas.get("ig_engagement_rate")),
        ]
    if x_df is not None and len(x_df) > 0:
        scorecard_data += [
            ("X Tweets", str(len(x_df)), deltas.get("x_posts")),
            ("X Impressions", f"{int(x_df['impressions'].sum()):,}", deltas.get("x_impressions")),
            ("X Eng. Rate", f"{round(x_df['engagement_rate'].mean(), 2)}%", deltas.get("x_engagement_rate")),
        ]

    if scorecard_data:
        cols = st.columns(len(scorecard_data))
        for i, (label, value, delta) in enumerate(scorecard_data):
            with cols[i]:
                pct, dlabel = _delta_label(delta)
                st.metric(label, value, dlabel,
                          delta_color="normal" if pct and pct >= 0 else "inverse")

    # Goals vs actuals
    if goals_actuals:
        st.subheader(f"Goals vs Actuals ({period_label})")
        gcols = st.columns(len(goals_actuals))
        for i, (label, data) in enumerate(goals_actuals.items()):
            with gcols[i]:
                pct = data["pct"]
                val = data["actual"]
                display_val = f"{val:,.0f}" if isinstance(val, (int, float)) and val >= 10 else f"{val}%"
                st.metric(label, display_val, f"{pct}% of goal ({data['goal']:,})",
                          delta_color="normal" if data["met"] else "inverse")

    # IG content breakdown
    if ig_df is not None and len(ig_df) > 0:
        st.subheader("Instagram: Content Type Breakdown")
        breakdown = (
            ig_df.groupby("content_type")
            .agg(posts=("post_id", "count"), avg_reach=("reach", "mean"), avg_eng=("engagement_rate", "mean"))
            .round(2).sort_values("avg_eng", ascending=False).reset_index()
        )
        breakdown.columns = ["Type", "Posts", "Avg Reach", "Avg Eng. Rate (%)"]
        breakdown["Avg Reach"] = breakdown["Avg Reach"].apply(lambda x: f"{int(x):,}")
        st.dataframe(breakdown, use_container_width=True, hide_index=True)

    st.divider()

    # ── AM Notes ────────────────────────────────────────────────────────────
    st.subheader("AM Notes")
    st.caption("These feed directly into the generated report.")
    am_notes = _render_am_notes_form(brand_name)

    st.divider()

    # ── Generate ─────────────────────────────────────────────────────────────
    st.subheader("Generate Report")
    gen_col1, gen_col2 = st.columns(2)

    with gen_col1:
        if st.button(f"Generate {period_label} PPTX", type="primary", use_container_width=True,
                     key=f"{brand_name}_gen_pptx"):
            try:
                with tempfile.NamedTemporaryFile(suffix=".pptx", delete=False) as tmp:
                    tmp_path = tmp.name
                generate_report(
                    ig_df, x_df, brand_name, tmp_path,
                    report_type=report_type, am_notes=am_notes,
                    deltas=deltas, goals_actuals=goals_actuals,
                )
                with open(tmp_path, "rb") as f:
                    pptx_bytes = f.read()
                os.unlink(tmp_path)
                st.success(f"{period_label} report ready.")
                st.download_button(
                    f"Download {period_label} PPTX", pptx_bytes,
                    file_name=f"{brand_name.lower().replace(' ', '_')}_{report_type}_report.pptx",
                    mime="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                    type="primary", key=f"{brand_name}_dl_pptx",
                )
            except Exception as e:
                st.error(f"Report error: {e}")

    with gen_col2:
        has_creds = False
        try:
            from dotenv import load_dotenv
            load_dotenv()
            creds_path = os.getenv("GOOGLE_CREDENTIALS_PATH")
            sheet_id = os.getenv("SHEET_ID")
            has_creds = bool(creds_path and sheet_id and Path(creds_path).exists())
        except Exception:
            pass

        if st.button("Write to Google Sheets", use_container_width=True,
                     disabled=not has_creds, key=f"{brand_name}_sheets",
                     help="Configure credentials in .env" if not has_creds else None):
            try:
                from dotenv import load_dotenv
                load_dotenv()
                writer = SheetsWriter(os.getenv("GOOGLE_CREDENTIALS_PATH"), os.getenv("SHEET_ID"))
                if ig_df is not None:
                    writer.write(ig_df, "IG Posts", mode="overwrite")
                if x_df is not None:
                    writer.write(x_df, "X Posts", mode="overwrite")
                all_dates = []
                if ig_df is not None:
                    all_dates.extend(ig_df["date"].tolist())
                if x_df is not None:
                    all_dates.extend(x_df["date"].tolist())
                if all_dates:
                    sorted_dates = sorted(all_dates)
                    writer.update_metadata([brand_name], (sorted_dates[0], sorted_dates[-1]))
                st.success("Written to Google Sheets.")
            except Exception as e:
                st.error(f"Sheets error: {e}")


# ─── Home dashboard ───────────────────────────────────────────────────────────

def _render_home(user: dict, brands: list[dict]) -> None:
    from datetime import date

    first_name = user["name"].split()[0]
    today = date.today().strftime("%A, %B %-d")
    n_brands = len(brands)
    brands_with_data = sum(
        1 for b in brands
        if st.session_state.get("brand_data", {}).get(b["name"])
    )

    # Greeting
    st.markdown(
        f"""
        <div style="margin-bottom:40px">
            <div style="font-size:0.82rem;color:rgba(255,255,255,0.4);margin-bottom:6px">{today}</div>
            <h1 style="font-size:2.2rem;font-weight:800;margin:0 0 6px 0">Welcome back, {first_name}.</h1>
            <p style="color:rgba(255,255,255,0.45);margin:0;font-size:0.95rem">
                Here's a snapshot of your workspace.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Stat cards
    stat_style = """
        border:1px solid rgba(255,255,255,0.09);
        border-radius:14px;
        padding:24px;
        background:rgba(255,255,255,0.03);
    """
    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown(
            f"""<div style="{stat_style}">
                <div style="font-size:0.75rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">Brands</div>
                <div style="font-size:2.4rem;font-weight:800;color:#fff;line-height:1">{n_brands}</div>
                <div style="font-size:0.78rem;color:rgba(255,255,255,0.35);margin-top:8px">Active accounts</div>
            </div>""",
            unsafe_allow_html=True,
        )
    with c2:
        st.markdown(
            f"""<div style="{stat_style}">
                <div style="font-size:0.75rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">Data Loaded</div>
                <div style="font-size:2.4rem;font-weight:800;color:#fff;line-height:1">{brands_with_data}</div>
                <div style="font-size:0.78rem;color:rgba(255,255,255,0.35);margin-top:8px">of {n_brands} brands this session</div>
            </div>""",
            unsafe_allow_html=True,
        )
    with c3:
        st.markdown(
            f"""<div style="{stat_style}">
                <div style="font-size:0.75rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">Reports</div>
                <div style="font-size:2.4rem;font-weight:800;color:#fff;line-height:1">—</div>
                <div style="font-size:0.78rem;color:rgba(255,255,255,0.35);margin-top:8px">Generate from Brand Overview</div>
            </div>""",
            unsafe_allow_html=True,
        )

    # Announcements
    st.markdown("<div style='margin-top:40px'>", unsafe_allow_html=True)
    st.markdown(
        """
        <div style="font-size:0.75rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px">
            Announcements
        </div>
        """,
        unsafe_allow_html=True,
    )
    announcements = [
        ("New feature", "PPTX report generation is live. Open any brand and hit Generate Report."),
        ("Reminder", "Upload your brand CSVs weekly to keep the dashboard current."),
        ("Coming soon", "Automated Google Sheets sync — no more manual uploads."),
    ]
    for title, body in announcements:
        st.markdown(
            f"""
            <div style="
                border-left:3px solid rgba(255,255,255,0.2);
                padding:12px 16px;
                margin-bottom:10px;
                background:rgba(255,255,255,0.02);
                border-radius:0 8px 8px 0;
            ">
                <div style="font-size:0.82rem;font-weight:600;color:#fff;margin-bottom:3px">{title}</div>
                <div style="font-size:0.8rem;color:rgba(255,255,255,0.45)">{body}</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    st.markdown("</div>", unsafe_allow_html=True)


# ─── Router ───────────────────────────────────────────────────────────────────

def _nav_button(label: str, icon_svg: str, active: bool, key: str) -> bool:
    bg = "rgba(255,255,255,0.10)" if active else "transparent"
    st.markdown(
        f"""
        <style>
            [data-testid="stBaseButton-secondary"][aria-label="{key}"] button,
            div[data-testid="stButton"]:has(button[aria-label="{key}"]) button {{
                display:flex;align-items:center;gap:10px;
                width:100%;text-align:left;padding:9px 12px;
                border-radius:8px;border:none;
                background:{bg};color:#fff;
                font-size:0.9rem;font-weight:{"600" if active else "400"};
                cursor:pointer;margin-bottom:2px;
            }}
        </style>
        """,
        unsafe_allow_html=True,
    )
    return st.button(f"{label}", key=key, use_container_width=True)


def render(user: dict) -> None:
    brands = _load_brands()
    if "nav" not in st.session_state:
        st.session_state.nav = "home"
    nav = st.session_state.nav

    # ── 1. Hide Streamlit sidebar + shift main content ──
    st.markdown(
        """
        <style>
            section[data-testid="stSidebar"]  { display: none !important; }
            [data-testid="stSidebarCollapseButton"],
            [data-testid="collapsedControl"]  { display: none !important; }
            /* Offset main content to clear our 64px custom sidebar */
            [data-testid="stMain"] { margin-left: 64px !important; }
        </style>
        """,
        unsafe_allow_html=True,
    )

    # ── 2. Hidden trigger buttons live inside the hidden sidebar ──
    #    display:none elements can still be .click()-ed via JavaScript.
    with st.sidebar:
        if st.button("__home__", key="nav_home"):
            st.session_state.nav = "home"
            st.session_state.pop("selected_brand", None)
            st.rerun()
        if st.button("__brands__", key="nav_brands"):
            st.session_state.nav = "brands"
            st.session_state.pop("selected_brand", None)
            st.rerun()
        if nav == "brand_detail":
            for b in brands:
                if st.button(f"__jump_{b['name']}__", key=f"sidebar_jump_{b['name']}"):
                    st.session_state.selected_brand = b["name"]
                    st.rerun()
        if st.button("__logout__", key="logout_btn"):
            from src.auth import delete_session
            delete_session(st.session_state.get("session_token", ""))
            st.query_params.clear()
            for key in list(st.session_state.keys()):
                del st.session_state[key]
            st.rerun()

    # ── 3. Inject custom sidebar into the page via JS ──
    import streamlit.components.v1 as _components
    active_home   = "active" if nav == "home" else ""
    active_brands = "active" if nav in ("brands", "brand_detail") else ""
    _components.html(
        f"""
        <script>
        (function() {{
            var p = window.parent.document;

            // Clean up previous render
            ["tnt-sb", "tnt-sb-css"].forEach(function(id) {{
                var el = p.getElementById(id); if (el) el.remove();
            }});

            // Styles
            var css = p.createElement("style");
            css.id = "tnt-sb-css";
            css.textContent = `
                #tnt-sb {{
                    position: fixed;
                    top: 0; left: 0;
                    height: 100vh;
                    width: 64px;
                    background: #161922;
                    border-right: 1px solid rgba(255,255,255,0.10);
                    overflow: hidden;
                    transition: width 0.22s cubic-bezier(.4,0,.2,1),
                                box-shadow 0.22s ease;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    box-sizing: border-box;
                }}
                #tnt-sb.open {{
                    width: 240px;
                    box-shadow: 8px 0 36px rgba(0,0,0,0.55);
                }}
                .tsb-logo {{
                    font-size: 0.78rem; font-weight: 800;
                    color: #fff; letter-spacing: 0.06em;
                    padding: 22px 0 18px 20px;
                    white-space: nowrap;
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                    flex-shrink: 0;
                }}
                .tsb-nav {{
                    display: flex; align-items: center; gap: 14px;
                    padding: 11px 0 11px 20px;
                    margin: 3px 8px;
                    border-radius: 7px;
                    color: rgba(255,255,255,0.5);
                    cursor: pointer;
                    white-space: nowrap;
                    font-size: 0.875rem;
                    transition: background .15s, color .15s;
                    user-select: none;
                    flex-shrink: 0;
                }}
                .tsb-nav:hover {{ background: rgba(255,255,255,0.07); color: #fff; }}
                .tsb-nav.active  {{ background: rgba(255,255,255,0.10); color: #fff; font-weight: 600; }}
                .tsb-icon {{ width: 22px; text-align: center; flex-shrink: 0; font-size: 1rem; }}
                .tsb-sep  {{ flex: 1; }}
                .tsb-logout {{ margin: 0 8px 20px; }}
            `;
            p.head.appendChild(css);

            // Sidebar HTML
            var sb = p.createElement("div");
            sb.id = "tnt-sb";
            sb.innerHTML = `
                <div class="tsb-logo">TNT · The New Thing</div>
                <div class="tsb-nav {active_home}"  data-btn="__home__">
                    <span class="tsb-icon">⊞</span><span>Dashboard</span>
                </div>
                <div class="tsb-nav {active_brands}" data-btn="__brands__">
                    <span class="tsb-icon">⊟</span><span>Brand Overview</span>
                </div>
                <div class="tsb-sep"></div>
                <div class="tsb-nav tsb-logout" data-btn="__logout__">
                    <span class="tsb-icon">↪</span><span>Logout</span>
                </div>
            `;
            p.body.appendChild(sb);

            // Click a hidden Streamlit button by its label
            function clickBtn(label) {{
                var all = p.querySelectorAll("button");
                for (var i = 0; i < all.length; i++) {{
                    if (all[i].innerText.trim() === label) {{ all[i].click(); return; }}
                }}
            }}

            // Nav click
            sb.addEventListener("click", function(e) {{
                pinned = true;
                var item = e.target.closest("[data-btn]");
                if (item) clickBtn(item.getAttribute("data-btn"));
            }});

            // Hover expand / collapse
            var pinned = false;
            sb.addEventListener("mouseenter", function() {{ sb.classList.add("open"); }});
            sb.addEventListener("mouseleave", function() {{
                if (!pinned) sb.classList.remove("open");
            }});
            p.addEventListener("click", function(e) {{
                if (!sb.contains(e.target)) {{ pinned = false; sb.classList.remove("open"); }}
            }});
        }})();
        </script>
        """,
        height=1,
    )

    # ── 4. Main content routing ──
    if nav == "home":
        _render_home(user, brands)
    elif nav == "brands":
        _render_overview(user, brands)
    elif nav == "brand_detail":
        selected = st.session_state.get("selected_brand")
        brand_config = next((b for b in brands if b["name"] == selected), None)
        if brand_config:
            _render_brand_detail(user, brand_config)
        else:
            st.session_state.nav = "brands"
            st.rerun()

