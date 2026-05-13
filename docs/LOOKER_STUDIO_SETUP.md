# Looker Studio Dashboard Setup Guide

Step-by-step instructions for building the ReportEngine dashboard in Looker Studio, connected to the Google Sheet data layer.

## 1. Create the Report

1. Go to [lookerstudio.google.com](https://lookerstudio.google.com)
2. Click **Create > Report**
3. Name it: `[Brand Name] Performance Dashboard - Powered by Ascnd`

## 2. Connect Data Sources

You need to add two data sources from the Google Sheet.

### Data Source 1: IG Posts

1. Click **Add Data** (or Resource > Manage added data sources > Add a data source)
2. Select **Google Sheets**
3. Find and select your ReportEngine Google Sheet
4. Select the **IG Posts** worksheet tab
5. Check **Use first row as headers**
6. Click **Add**
7. In the field editor, set these types:
   - `date`: **Date** (YYYY-MM-DD)
   - `reach`, `views`, `likes`, `comments`, `shares`, `saves`, `engagement_total`: **Number**
   - `engagement_rate`: **Number** (percent format, 2 decimal places)
   - All others: **Text**

### Data Source 2: X Posts

1. Click **Add Data** again
2. Select **Google Sheets**, same spreadsheet
3. Select the **X Posts** worksheet tab
4. Check **Use first row as headers**
5. Click **Add**
6. Set field types:
   - `date`: **Date** (YYYY-MM-DD)
   - `impressions`, `likes`, `retweets`, `replies`, `url_clicks`, `engagement_total`: **Number**
   - `engagement_rate`: **Number** (percent format, 2 decimal places)
   - All others: **Text**

## 3. Global Styling

Apply these settings across all pages for a clean, professional look.

- **Theme:** Click **Theme and Layout > Theme** and select a minimal theme, then customize:
  - Background: **#FFFFFF** (white)
  - Font family: **Inter** or **Roboto**
  - Accent color: **#C9A84C** (Ascnd gold)
  - Text color: **#333333**
- **Layout:** Set page size to **16:9** (standard widescreen)
- **Grid:** Enable snap to grid for alignment

## 4. Page 1: Overview

This page gives a high-level view across all brands and platforms.

**Data source:** IG Posts (primary), X Posts (blended if needed)

### Filters (top of page)

1. **Date range control:** Insert > Date range control. Place in top-right corner. Default to "Last 30 days" or "Custom".
2. **Brand filter:** Insert > Drop-down list. Field: `brand`. Place next to date range.
3. **Platform filter:** Insert > Drop-down list. Field: `platform`. Place next to brand filter.

### Scorecards (row below filters)

Add 4 scorecards in a horizontal row:

| Scorecard | Metric | Aggregation |
|-----------|--------|-------------|
| Total Reach | `reach` | SUM |
| Total Engagement | `engagement_total` | SUM |
| Avg Engagement Rate | `engagement_rate` | AVERAGE |
| Total Posts | Record Count | COUNT |

**Scorecard styling:**
- Large number (24pt+), bold
- Small label below (10pt), gray
- No background, just the number

### Charts

1. **Bar chart: Reach by Brand** (horizontal)
   - Dimension: `brand`
   - Metric: SUM of `reach`
   - Sort: Descending by reach
   - Bar color: **#C9A84C**
   - Place on left half of page

2. **Time series: Daily Reach Trend**
   - Dimension: `date`
   - Metric: SUM of `reach`
   - Breakdown dimension: `brand` (one line per brand)
   - Line style: smooth
   - Place on right half of page

## 5. Page 2: Instagram Deep Dive

**Data source:** IG Posts only

### Scorecards (top row, 3 cards)

| Scorecard | Metric | Aggregation |
|-----------|--------|-------------|
| Total IG Reach | `reach` | SUM |
| Avg IG Engagement Rate | `engagement_rate` | AVERAGE |
| Total IG Posts | Record Count | COUNT |

### Table: All Posts

- Insert > Table
- Columns: `date`, `content_type`, `caption_preview`, `reach`, `engagement_total`, `engagement_rate`
- Sort: `engagement_rate` descending
- Enable pagination (20 rows per page)
- Alternating row colors for readability
- Place across full width, middle of page

### Pie Chart: Posts by Content Type

- Dimension: `content_type`
- Metric: Record Count
- Colors: assign distinct colors per type
- Place bottom-left

### Bar Chart: Avg Engagement Rate by Content Type

- Dimension: `content_type`
- Metric: AVERAGE of `engagement_rate`
- Sort: Descending
- Bar color: **#C9A84C**
- Place bottom-center

### Time Series: Weekly Reach Trend

- Dimension: `date` (set to ISO Week granularity)
- Metric: SUM of `reach`
- Place bottom-right

## 6. Page 3: X Deep Dive

**Data source:** X Posts only

Same structure as Page 2, adapted for X metrics:

### Scorecards (top row, 3 cards)

| Scorecard | Metric | Aggregation |
|-----------|--------|-------------|
| Total Impressions | `impressions` | SUM |
| Avg Engagement Rate | `engagement_rate` | AVERAGE |
| Total Tweets | Record Count | COUNT |

### Table: All Tweets

- Columns: `date`, `caption_preview`, `impressions`, `likes`, `retweets`, `engagement_total`, `engagement_rate`
- Sort: `impressions` descending
- Enable pagination

### Bar Chart: Engagement Breakdown

- Dimension: (none, use metrics only)
- Metrics: SUM of `likes`, SUM of `retweets`, SUM of `replies`
- Chart type: Stacked bar or grouped bar
- Place bottom section

## 7. Page 4: Content Type Comparison (Instagram)

**Data source:** IG Posts only

This page answers: "Should we make more Reels or Carousels?"

### Grouped Bar Chart: Reach by Content Type

- Dimension: `content_type`
- Metric: SUM of `reach`
- Sort: Descending by reach
- Bar color: **#C9A84C** primary, **#E8D5A3** secondary
- Place top half of page

### Grouped Bar Chart: Engagement Rate by Content Type

- Dimension: `content_type`
- Metric: AVERAGE of `engagement_rate`
- Sort: Descending
- Place bottom half of page

### Add a text box with insight:

"Content types with higher average engagement rates indicate what your audience responds to most. Use this to guide your content calendar."

## 8. Scheduled PDF Export

1. Click **Share** (top-right of Looker Studio)
2. Select **Schedule email delivery**
3. Configure:
   - **Frequency:** Weekly
   - **Day:** Monday
   - **Time:** 9:00 AM IST
   - **Recipients:** Add email addresses (Viren's email for production, your email for testing)
   - **Format:** PDF
   - **Subject line:** `[Brand Name] Weekly Performance Report - Powered by Ascnd`
4. Click **Save**

The PDF will include all pages of the report, delivered automatically every Monday.

## Tips

- **Refresh data:** The dashboard auto-refreshes from Sheets. After running the script, just reload the dashboard.
- **Caching:** Looker Studio caches data for about 15 minutes. To force refresh: Resource > Manage added data sources > Refresh fields.
- **Mobile:** Looker Studio reports are responsive but look best on desktop. Share the link for interactive viewing, PDFs for mobile.
- **Branding:** To add the Ascnd or TNT logo, insert an Image element on each page. Place it in the top-left corner, sized to 120x40px.
