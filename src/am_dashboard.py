"""Account Manager dashboard for ReportEngine.

Full AM view: upload CSVs, period-over-period deltas, goals vs actuals,
qualitative AM notes form, weekly/monthly report generation.
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


def _delta_label(delta: Optional[dict]) -> tuple[Optional[float], Optional[str]]:
    """Return (delta_value, delta_label) for st.metric."""
    if delta is None or delta.get("delta_pct") is None:
        return None, None
    pct = delta["delta_pct"]
    label = f"{'+' if pct > 0 else ''}{pct}% vs prior period"
    return pct, label


def _render_goals_section(goals_actuals: dict) -> None:
    if not goals_actuals:
        st.caption("No goals configured for this brand. Add goals in config/brands.json.")
        return

    cols = st.columns(len(goals_actuals))
    for i, (label, data) in enumerate(goals_actuals.items()):
        with cols[i]:
            pct = data["pct"]
            color = "normal" if data["met"] else "inverse"
            delta_label = f"{pct}% of goal ({data['goal']:,})"
            val = data["actual"]
            display_val = f"{val:,.0f}" if isinstance(val, (int, float)) and val >= 10 else f"{val}%"
            st.metric(label=label, value=display_val, delta=delta_label, delta_color=color)


def _render_am_notes_form() -> dict:
    """Render the qualitative AM notes form. Returns the form values."""
    st.subheader("AM Notes")
    st.caption("These feed directly into the generated report.")

    col1, col2 = st.columns(2)
    with col1:
        sentiment = st.selectbox(
            "Client Sentiment",
            options=["Positive", "Neutral", "Negative", "At Risk"],
            key="am_sentiment",
        )
        wins = st.text_area(
            "Strategic Wins This Period",
            placeholder="e.g. Reel hit 50k reach, client approved new content pillars",
            key="am_wins",
            height=100,
        )
        risks = st.text_area(
            "Upcoming Risks",
            placeholder="e.g. Client hasn't approved next month's content yet",
            key="am_risks",
            height=100,
        )
    with col2:
        relationship_note = st.text_area(
            "Relationship Note",
            placeholder="e.g. Viren is very engaged this month, responded within 1 hour",
            key="am_relationship",
            height=80,
        )
        losses = st.text_area(
            "Misses / Focus Areas",
            placeholder="e.g. Story reach dropped 20%, need to revisit cadence",
            key="am_losses",
            height=100,
        )
        client_feedback = st.text_area(
            "Client Verbatim Feedback",
            placeholder="Paste any direct quotes from the client call or email",
            key="am_feedback",
            height=80,
        )

    return {
        "sentiment": sentiment,
        "wins": wins,
        "losses": losses,
        "risks": risks,
        "relationship_note": relationship_note,
        "client_feedback": client_feedback,
    }


def render(user: dict) -> None:
    """Render the Account Manager dashboard.

    Args:
        user: Authenticated user dict {email, name, role}.
    """
    brands = _load_brands()
    brand_names = [b["name"] for b in brands] if brands else []

    # --- Sidebar ---
    with st.sidebar:
        st.markdown(f"**{user['name']}**")
        st.caption(user["email"])
        st.divider()

        st.subheader("Report Settings")

        if brand_names:
            selected_brand_name = st.selectbox("Brand", brand_names, key="am_brand")
            brand_config = next((b for b in brands if b["name"] == selected_brand_name), {})
        else:
            selected_brand_name = st.text_input("Brand Name", placeholder="e.g. Tinder", key="am_brand_text")
            brand_config = {}

        report_type = st.radio(
            "Report Type",
            options=["Weekly", "Monthly"],
            horizontal=True,
            key="am_report_type",
        ).lower()

        st.subheader("Platforms")
        use_ig = st.checkbox("Instagram", value=True, key="am_use_ig")
        use_x = st.checkbox("X (Twitter)", value=False, key="am_use_x")

        st.divider()
        if st.button("Logout", use_container_width=True):
            for key in list(st.session_state.keys()):
                del st.session_state[key]
            st.rerun()
        st.caption("Powered by Ascnd")

    brand_name = selected_brand_name or ""
    goals = brand_config.get("goals", {})

    # --- Header ---
    period_label = "Weekly" if report_type == "weekly" else "Monthly"
    st.title(f"AM Dashboard — {brand_name or 'Select a Brand'}")
    st.caption(f"{period_label} report view. Upload CSVs to begin.")

    # --- Section 1: Upload ---
    st.header("1. Upload Data")
    ig_df: Optional[pd.DataFrame] = None
    x_df: Optional[pd.DataFrame] = None

    upload_col1, upload_col2 = st.columns(2)

    with upload_col1:
        if use_ig:
            ig_file = st.file_uploader(
                "Instagram CSV (Meta Business Suite export)",
                type=["csv"],
                key="am_ig_file",
            )
            if ig_file:
                try:
                    with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
                        tmp.write(ig_file.getvalue())
                        tmp_path = tmp.name
                    ig_df = ig_processor.process(tmp_path, brand_name or "Brand")
                    os.unlink(tmp_path)
                    dates = pd.to_datetime(ig_df["date"])
                    st.success(
                        f"Instagram: {len(ig_df)} posts "
                        f"({dates.min().strftime('%b %-d')} - {dates.max().strftime('%b %-d, %Y')})"
                    )
                except Exception as e:
                    st.error(f"Instagram CSV error: {e}")
                    ig_df = None

    with upload_col2:
        if use_x:
            x_file = st.file_uploader(
                "X CSV (X Analytics export)",
                type=["csv"],
                key="am_x_file",
            )
            if x_file:
                try:
                    with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
                        tmp.write(x_file.getvalue())
                        tmp_path = tmp.name
                    x_df = x_processor.process(tmp_path, brand_name or "Brand")
                    os.unlink(tmp_path)
                    dates = pd.to_datetime(x_df["date"])
                    st.success(
                        f"X: {len(x_df)} tweets "
                        f"({dates.min().strftime('%b %-d')} - {dates.max().strftime('%b %-d, %Y')})"
                    )
                except Exception as e:
                    st.error(f"X CSV error: {e}")
                    x_df = None

    if ig_df is None and x_df is None:
        st.info("Upload at least one CSV to see metrics.")
        return

    # --- Section 2: Performance Overview ---
    st.divider()
    st.header("2. Performance Overview")

    # Split into current vs prior period for delta calc
    ig_current, ig_prior = split_by_period(ig_df, report_type) if ig_df is not None else (None, None)
    x_current, x_prior = split_by_period(x_df, report_type) if x_df is not None else (None, None)

    deltas = compute_deltas(ig_current, ig_prior, x_current, x_prior)

    # Use full data for goals vs actuals and health score
    goals_actuals = compute_goals_actuals(ig_df, x_df, goals, report_type)

    # AM notes must be collected before health score (sentinel values used if form not filled yet)
    am_notes_pre = {
        "sentiment": st.session_state.get("am_sentiment", "Neutral"),
        "wins": st.session_state.get("am_wins", ""),
        "losses": st.session_state.get("am_losses", ""),
        "risks": st.session_state.get("am_risks", ""),
        "relationship_note": st.session_state.get("am_relationship", ""),
        "client_feedback": st.session_state.get("am_feedback", ""),
    }
    health = compute_health_score(ig_df, x_df, goals, am_notes_pre, report_type)

    # Health score banner
    band_color_map = {
        "Thriving": "#27AE60",
        "Healthy": "#3498DB",
        "At Risk": "#E67E22",
        "Critical": "#E74C3C",
    }
    hc = band_color_map.get(health["band"], "#95A5A6")
    st.markdown(
        f"""
        <div style="
            background:{hc};
            border-radius:12px;
            padding:14px 24px;
            display:flex;
            align-items:center;
            gap:18px;
            margin-bottom:8px;
        ">
            <span style="font-size:2.4rem;font-weight:900;color:#fff;line-height:1">
                {health['score']}
            </span>
            <div>
                <div style="font-size:1.1rem;font-weight:700;color:#fff">
                    {health['band']}
                </div>
                <div style="font-size:0.78rem;color:rgba(255,255,255,0.8)">
                    Campaign {health['breakdown']['campaign']} &nbsp;|&nbsp;
                    Delivery {health['breakdown']['delivery']} &nbsp;|&nbsp;
                    Sentiment {health['breakdown']['sentiment']}
                </div>
            </div>
            <span style="margin-left:auto;font-size:0.8rem;color:rgba(255,255,255,0.7)">
                Client Health Score
            </span>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Scorecard row
    scorecard_cols = []
    scorecard_data = []

    if ig_df is not None and len(ig_df) > 0:
        scorecard_data.extend([
            ("IG Posts", str(len(ig_df)), deltas.get("ig_posts")),
            ("IG Total Reach", f"{int(ig_df['reach'].sum()):,}", deltas.get("ig_reach")),
            ("IG Avg Eng. Rate", f"{round(ig_df['engagement_rate'].mean(), 2)}%", deltas.get("ig_engagement_rate")),
        ])
    if x_df is not None and len(x_df) > 0:
        scorecard_data.extend([
            ("X Tweets", str(len(x_df)), deltas.get("x_posts")),
            ("X Impressions", f"{int(x_df['impressions'].sum()):,}", deltas.get("x_impressions")),
            ("X Avg Eng. Rate", f"{round(x_df['engagement_rate'].mean(), 2)}%", deltas.get("x_engagement_rate")),
        ])

    num_cols = len(scorecard_data)
    if num_cols > 0:
        cols = st.columns(num_cols)
        for i, (label, value, delta) in enumerate(scorecard_data):
            with cols[i]:
                _, delta_label = _delta_label(delta)
                delta_pct = delta["delta_pct"] if delta else None
                st.metric(
                    label=label,
                    value=value,
                    delta=delta_label,
                    delta_color="normal" if delta_pct and delta_pct >= 0 else "inverse",
                )

    # Goals vs Actuals
    if goals_actuals:
        st.subheader(f"Goals vs Actuals ({period_label})")
        _render_goals_section(goals_actuals)

    # Top content type breakdown
    if ig_df is not None and len(ig_df) > 0:
        st.subheader("Instagram: Content Type Breakdown")
        breakdown = (
            ig_df.groupby("content_type")
            .agg(posts=("post_id", "count"), avg_reach=("reach", "mean"), avg_eng=("engagement_rate", "mean"))
            .round(2)
            .sort_values("avg_eng", ascending=False)
            .reset_index()
        )
        breakdown.columns = ["Content Type", "Posts", "Avg Reach", "Avg Eng. Rate (%)"]
        breakdown["Avg Reach"] = breakdown["Avg Reach"].apply(lambda x: f"{int(x):,}")
        st.dataframe(breakdown, use_container_width=True, hide_index=True)

    # --- Section 3: AM Notes ---
    st.divider()
    st.header("3. Qualitative Inputs")
    am_notes = _render_am_notes_form()

    # --- Section 4: Generate Report ---
    st.divider()
    st.header("4. Generate Report")

    gen_col1, gen_col2 = st.columns(2)

    with gen_col1:
        if st.button(f"Generate {period_label} PPTX", type="primary", use_container_width=True):
            if not brand_name:
                st.warning("Select or enter a brand name.")
            else:
                try:
                    with tempfile.NamedTemporaryFile(suffix=".pptx", delete=False) as tmp:
                        tmp_path = tmp.name
                    generate_report(
                        ig_df, x_df, brand_name, tmp_path,
                        report_type=report_type,
                        am_notes=am_notes,
                        deltas=deltas,
                        goals_actuals=goals_actuals,
                        health=health,
                    )
                    with open(tmp_path, "rb") as f:
                        pptx_bytes = f.read()
                    os.unlink(tmp_path)
                    st.success(f"{period_label} report ready for {brand_name}.")
                    st.download_button(
                        label=f"Download {period_label} PPTX",
                        data=pptx_bytes,
                        file_name=f"{brand_name.lower().replace(' ', '_')}_{report_type}_report.pptx",
                        mime="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        type="primary",
                        key="am_download_pptx",
                    )
                except Exception as e:
                    st.error(f"Report generation error: {e}")

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

        if st.button(
            "Write to Google Sheets",
            use_container_width=True,
            disabled=not has_creds,
            help="Configure credentials in .env" if not has_creds else "Write data to Google Sheets",
        ):
            try:
                from dotenv import load_dotenv
                load_dotenv()
                writer = SheetsWriter(
                    os.getenv("GOOGLE_CREDENTIALS_PATH"),
                    os.getenv("SHEET_ID"),
                )
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
                st.success("Data written to Google Sheets.")
            except Exception as e:
                st.error(f"Sheets write error: {e}")
