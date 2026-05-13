# PPTX Report Generator - Addition Plan
**Status:** APPROVED
**Date:** 2026-03-29

## Context Change
Original system ended at Google Sheets + Looker Studio. Now the system has TWO outputs:
1. Google Sheets -> Looker Studio dashboard (TNT internal, view brand performance)
2. PPTX report (client-facing, TNT sends to the brands they manage)

## What's Already Built (no changes needed)
- src/utils.py (column matching, date parsing, normalization)
- src/ig_processor.py (Instagram CSV -> DataFrame)
- src/x_processor.py (X CSV -> DataFrame)
- src/sheets_writer.py (DataFrame -> Google Sheets)
- src/report_generator.py (CLI orchestrator)
- All tests (91 passing)

## What Needs to Be Built

### New Dependencies
- python-pptx >= 0.6.23 (PPTX generation)
- matplotlib >= 3.8.0 (charts rendered as images for slides)

### New Files
- src/pptx_generator.py - generates branded PPTX from processed DataFrames
- templates/report_template.pptx - blank branded template (Ascnd/TNT styling)
- tests/test_pptx_generator.py - tests for report generation

### Modified Files
- requirements.txt - add python-pptx, matplotlib
- src/report_generator.py - add --report flag to trigger PPTX generation

## PPTX Slide Structure (per brand report)

### Slide 1: Cover
- Brand logo placeholder
- Report title: "{Brand Name} Social Media Performance Report"
- Date range: "March 1 - March 28, 2026"
- "Prepared by TNT | Powered by Ascnd"

### Slide 2: Executive Summary (scorecards)
- Total Posts
- Total Reach
- Average Engagement Rate
- Top Performing Content Type
- Period-over-period comparison (if previous data available, otherwise skip)

### Slide 3: Instagram Overview
- Post count, total reach, avg engagement rate (scorecards at top)
- Bar chart: Reach by Content Type
- Bar chart: Engagement Rate by Content Type

### Slide 4: Instagram Top Posts
- Table: top 5 posts by engagement rate
- Columns: Date, Type, Caption Preview, Reach, Engagement Rate

### Slide 5: X/Twitter Overview (if X data exists)
- Tweet count, total impressions, avg engagement rate
- Similar charts as IG slide

### Slide 6: X Top Posts (if X data exists)
- Table: top 5 tweets by engagement rate

### Slide 7: Key Insights & Recommendations
- Auto-generated bullet points:
  - "Reels drove the highest engagement at X% average"
  - "Best posting day was {day_of_week} with Y avg reach"
  - "Top performing post reached Z people"
- Space for TNT to add manual notes

### Slide 8: Next Steps / CTA
- "Prepared by TNT"
- Contact info placeholder
- Ascnd branding subtle in footer

## Styling
- Clean, modern, minimal
- TNT brand colors: blue (primary accent) + beige (background/secondary)
- Font: Calibri (universal PPTX font)
- Charts: matplotlib with blue/beige palette, no grid lines, clean labels
- No raw data appendix. Top 5 only. Keep it clean.
- Weekly report only (Viren specified weekly)

## Build Steps

### Step 9: PPTX Generator + Charts
- Build src/pptx_generator.py
- Build chart generation (matplotlib -> PNG -> embed in slides)
- Build slide-by-slide generation matching the structure above

### Step 10: Wire into CLI + Streamlit
- Add --report flag to report_generator.py
- Build Streamlit app: upload CSV, pick brand, generate + download PPTX
- End-to-end test: CSV -> PPTX file on disk

## Decisions
1. TNT branding: blue + beige (no logo yet, use text)
2. No raw data appendix. Top 5 posts only. Clean deck.
3. Weekly report only. Date range derived from CSV data.
