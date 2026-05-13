"""Creative dashboard for ReportEngine.

Simple view: upload CSVs, preview data, generate and download PPTX report.
No qualitative inputs, no delta calculations, no goals.
"""

import os
import tempfile
from pathlib import Path

import pandas as pd
import streamlit as st

from src import ig_processor, x_processor
from src.pptx_generator import generate_report


def render(user: dict) -> None:
    """Render the Creative dashboard.

    Args:
        user: Authenticated user dict {email, name, role}.
    """
    st.title("ReportEngine")
    st.caption(f"Welcome, {user['name']}. Upload CSVs and generate your report.")

    with st.sidebar:
        st.header("Settings")
        brand_name = st.text_input("Brand Name", placeholder="e.g. Tinder")

        st.subheader("Platforms")
        use_ig = st.checkbox("Instagram", value=True)
        use_x = st.checkbox("X (Twitter)", value=False)

        if not use_ig and not use_x:
            st.warning("Select at least one platform.")

        st.divider()
        if st.button("Logout", use_container_width=True):
            for key in list(st.session_state.keys()):
                del st.session_state[key]
            st.rerun()
        st.caption("Powered by Ascnd")

    st.header("1. Upload Data")
    ig_df = None
    x_df = None
    col1, col2 = st.columns(2)

    with col1:
        if use_ig:
            ig_file = st.file_uploader(
                "Instagram CSV (Meta Business Suite)", type=["csv"], key="cr_ig"
            )
            if ig_file:
                try:
                    with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
                        tmp.write(ig_file.getvalue())
                        tmp_path = tmp.name
                    ig_df = ig_processor.process(tmp_path, brand_name or "Brand")
                    os.unlink(tmp_path)
                    dates = pd.to_datetime(ig_df["date"])
                    date_range = f"{dates.min().strftime('%b %-d')} - {dates.max().strftime('%b %-d, %Y')}"
                    st.success(f"Instagram: {len(ig_df)} posts ({date_range})")
                    st.dataframe(
                        ig_df[["date", "content_type", "reach", "engagement_rate"]].head(5),
                        use_container_width=True,
                        hide_index=True,
                    )
                except Exception as e:
                    st.error(f"Error processing Instagram CSV: {e}")

    with col2:
        if use_x:
            x_file = st.file_uploader(
                "X CSV (X Analytics)", type=["csv"], key="cr_x"
            )
            if x_file:
                try:
                    with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
                        tmp.write(x_file.getvalue())
                        tmp_path = tmp.name
                    x_df = x_processor.process(tmp_path, brand_name or "Brand")
                    os.unlink(tmp_path)
                    dates = pd.to_datetime(x_df["date"])
                    date_range = f"{dates.min().strftime('%b %-d')} - {dates.max().strftime('%b %-d, %Y')}"
                    st.success(f"X: {len(x_df)} tweets ({date_range})")
                    st.dataframe(
                        x_df[["date", "content_type", "impressions", "engagement_rate"]].head(5),
                        use_container_width=True,
                        hide_index=True,
                    )
                except Exception as e:
                    st.error(f"Error processing X CSV: {e}")

    if ig_df is not None or x_df is not None:
        st.header("2. Generate Report")
        if st.button("Generate PPTX Report", type="primary", use_container_width=True):
            if not brand_name:
                st.warning("Enter a brand name in the sidebar.")
            else:
                try:
                    with tempfile.NamedTemporaryFile(suffix=".pptx", delete=False) as tmp:
                        tmp_path = tmp.name
                    generate_report(ig_df, x_df, brand_name, tmp_path)
                    with open(tmp_path, "rb") as f:
                        pptx_bytes = f.read()
                    os.unlink(tmp_path)
                    st.success(f"Report ready for {brand_name}.")
                    st.download_button(
                        label="Download PPTX",
                        data=pptx_bytes,
                        file_name=f"{brand_name.lower().replace(' ', '_')}_report.pptx",
                        mime="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        type="primary",
                    )
                except Exception as e:
                    st.error(f"Error generating report: {e}")
