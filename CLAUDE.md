# CLAUDE.md - TNT Report Automation System (Ascnd Demo Build)
# Project: ReportEngine by Ascnd
# Version: 1.0
# Last Updated: 2026-03-29
# Owner: Keerthan (KDOT), Ascnd

---

## PURPOSE

Build a Python-based system that ingests CSV exports from Meta Business Suite (Instagram) and X Analytics (Twitter), normalizes the data, writes it to structured Google Sheets, and generates a Looker Studio-ready data layer. This is a demo build for a Loom video to close TNT (The New Thing) as an Ascnd client. The contact is Viren (CEO).

The system must be dead simple, reliable, and visually impressive when demonstrated.

---

## CONTEXT: WHAT THIS SOLVES

TNT is a social media agency. Their team manually opens Instagram for each brand, reads numbers, types them into Google Sheets, then formats those sheets into client presentations. Every week. Viren's words: he wants "an easy to use and quick data centre for all brand content page performance."

This system eliminates the manual data entry step. CSV export (60 seconds) replaces 3+ hours of manual work per week.

---

## ARCHITECTURE OVERVIEW

```
[Meta Business Suite CSV] --> [Python Script: ig_processor.py] --> [Google Sheet: IG Data]
[X Analytics CSV]         --> [Python Script: x_processor.py]  --> [Google Sheet: X Data]
                                                                        |
                                                                        v
                                                              [Looker Studio Dashboard]
                                                                        |
                                                                        v
                                                              [Scheduled PDF Export]
```

The system has four components:
1. CSV Processors (Python scripts that clean and normalize raw exports)
2. Google Sheets Writer (writes normalized data to structured sheets via gspread)
3. Dashboard Layer (Looker Studio connected to Sheets, built manually)
4. Report Export (Looker Studio scheduled PDF email)

Components 1-2 are what Claude Code builds. Components 3-4 are manual setup documented in this file.

---

## PROJECT STRUCTURE

```
report-engine/
  README.md                    # Setup instructions and usage guide
  requirements.txt             # Python dependencies
  .env.example                 # Template for environment variables
  config/
    brands.json                # Brand configuration (name, IG account, X handle)
    column_maps.json           # CSV column name mappings for normalization
  src/
    ig_processor.py            # Instagram CSV processor
    x_processor.py             # X/Twitter CSV processor
    sheets_writer.py           # Google Sheets writer (shared by both processors)
    report_generator.py        # Main orchestrator script
    utils.py                   # Date parsing, validation, helpers
  templates/
    sheet_structure.json       # Google Sheet tab/column definitions
  tests/
    test_ig_processor.py       # Tests with sample CSV data
    test_x_processor.py        # Tests with sample CSV data
    sample_data/
      sample_ig_content.csv    # Mock Instagram CSV (realistic column names)
      sample_x_tweets.csv      # Mock X Analytics CSV (realistic column names)
  docs/
    LOOM_SCRIPT.md             # Shot-by-shot Loom recording guide
    LOOKER_STUDIO_SETUP.md     # Step-by-step dashboard build instructions
    AUTOMATION_ROADMAP.md      # Future API automation pitch doc for Viren
```

---

## TECHNICAL SPECIFICATIONS

### Python Version
- Python 3.10+

### Dependencies (requirements.txt)
```
pandas>=2.0.0
gspread>=6.0.0
google-auth>=2.0.0
google-auth-oauthlib>=1.0.0
python-dotenv>=1.0.0
```

### Google Sheets Authentication
- Use a Google Cloud Service Account
- Share the target Google Sheet with the service account email
- Store credentials JSON path in .env as GOOGLE_CREDENTIALS_PATH
- Store the Google Sheet ID in .env as SHEET_ID

### Environment Variables (.env)
```
GOOGLE_CREDENTIALS_PATH=./credentials/service_account.json
SHEET_ID=your_google_sheet_id_here
```

---

## COMPONENT 1: INSTAGRAM CSV PROCESSOR (ig_processor.py)

### Input: Meta Business Suite Content Insights CSV

Meta Business Suite exports content insights with these typical columns (may vary slightly by export date and Meta UI version). The processor must handle column name variations gracefully.

**Known column names from Meta Business Suite Content Export (Instagram tab, Content type):**

Post-level export columns (most common):
- "Title" or "Post title" (caption preview, may be truncated)
- "Post ID" or "post_id"
- "Type" or "Content type" (e.g., "IG carousel", "IG reel", "IG image", "IG video", "IG story")
- "Published" or "Publish time" or "Date published" (datetime string)
- "Reach" or "Organic reach" (integer)
- "Impressions" or "Views" (integer, Meta shifted from Impressions to Views in 2025)
- "Likes" or "Reactions" (integer)
- "Comments" (integer)
- "Shares" (integer)
- "Saves" (integer)
- "Follows" (integer, may not always be present)
- "Permalink" or "Post link" (URL to the post)

Account-level overview export columns (separate export in Meta Business Suite under Results tab):
- "Date" (YYYY-MM-DD or other format)
- "Accounts reached" or "Reach" (integer)
- "Accounts engaged" or "Engagement" (integer)
- "Total followers" or "Followers" (integer)
- "Profile visits" or "Profile views" (integer)
- "Website clicks" or "Link clicks" (integer)
- "Net followers" (integer, follows minus unfollows)

### Processing Rules

1. **Column Detection**: Do NOT hardcode column names. Build a fuzzy matcher that maps known variations to normalized names. Use config/column_maps.json.

2. **Date Parsing**: Meta exports dates in multiple formats depending on locale:
   - "Mar 15, 2026, 10:30 AM" (US locale)
   - "15 Mar 2026 10:30" (non-US)
   - "2026-03-15T10:30:00+0530" (ISO with timezone)
   - "2026-03-15" (date only for account-level)
   Use pandas.to_datetime with infer_datetime_format=True and dayfirst=False as default. Store as YYYY-MM-DD in the output.

3. **Content Type Normalization**: Map all variations to: "Image", "Carousel", "Reel", "Video", "Story"
   - "IG carousel" or "Carousel album" -> "Carousel"
   - "IG reel" or "Reel" -> "Reel"
   - "IG image" or "Photo" or "Image" -> "Image"
   - "IG video" or "Video" -> "Video"
   - "IG story" or "Story" -> "Story"

4. **Calculated Fields**: Add these columns to the output:
   - engagement_total = likes + comments + shares + saves
   - engagement_rate = (engagement_total / reach) * 100, rounded to 2 decimal places
   - If reach is 0 or NaN, set engagement_rate to 0

5. **Missing Values**: Replace NaN/empty with 0 for all numeric columns. Replace NaN/empty with "" for text columns.

6. **Sorting**: Sort by date descending (most recent first).

7. **Brand Tagging**: Add a "Brand" column based on the brand_name passed as argument or from config.

### Output Schema (Post-Level)

| Column | Type | Description |
|--------|------|-------------|
| brand | string | Brand name from config |
| platform | string | Always "Instagram" |
| post_id | string | Post ID or permalink slug |
| date | string | YYYY-MM-DD |
| content_type | string | Image/Carousel/Reel/Video/Story |
| caption_preview | string | First 100 chars of caption |
| reach | int | Organic reach |
| views | int | Impressions or views |
| likes | int | Like count |
| comments | int | Comment count |
| shares | int | Share count |
| saves | int | Save count |
| engagement_total | int | likes + comments + shares + saves |
| engagement_rate | float | (engagement_total / reach) * 100 |
| permalink | string | URL to post |

### Output Schema (Account-Level, if provided)

| Column | Type | Description |
|--------|------|-------------|
| brand | string | Brand name from config |
| platform | string | Always "Instagram" |
| date | string | YYYY-MM-DD |
| followers | int | Total follower count |
| net_followers | int | Follows minus unfollows |
| reach | int | Accounts reached |
| profile_views | int | Profile visits |
| website_clicks | int | Link/website taps |

---

## COMPONENT 2: X/TWITTER CSV PROCESSOR (x_processor.py)

### CRITICAL NOTE ON X ANALYTICS ACCESS

X Analytics with CSV export now requires X Premium (paid subscription). If TNT does not have Premium on their brand accounts, the X data path changes:

**Fallback options (handle in order of preference):**
1. X Analytics CSV export (if Premium available): native analytics.x.com export
2. Chrome extension export (free): tools like TwExport, X Post Exporter, XTractor export tweet data with engagement metrics to CSV
3. Manual entry template: provide a blank Google Sheet template with the correct columns that TNT can fill manually until automation is set up

The processor should handle CSV files from ANY of these sources by using the same fuzzy column matching approach as the Instagram processor.

### Input: X Analytics CSV (By Tweet)

X Analytics "By Tweet" CSV export typically has these columns:
- "Tweet id" or "id" (string)
- "Tweet permalink" or "permalink" (URL)
- "Tweet text" or "text" (full tweet text)
- "time" or "date" or "created_at" (datetime)
- "impressions" (integer)
- "engagements" (integer)
- "engagement rate" (percentage string like "2.5%" or float)
- "retweets" (integer)
- "replies" (integer)
- "likes" or "favorites" (integer)
- "user profile clicks" or "profile clicks" (integer)
- "url clicks" or "link clicks" (integer)
- "hashtag clicks" (integer)
- "detail expands" (integer)
- "media views" or "media engagements" (integer)

Chrome extension exports may have different column names:
- "Tweet" or "Content" or "Full Text" (tweet text)
- "Date" or "Created At" or "Timestamp"
- "Likes" or "Favorite Count"
- "Retweets" or "Retweet Count"
- "Replies" or "Reply Count"
- "Views" or "Impressions" or "View Count"
- "Bookmarks" or "Bookmark Count"
- "Quotes" or "Quote Count"

### Processing Rules

1. **Column Detection**: Same fuzzy matching approach as Instagram. Use config/column_maps.json.

2. **Engagement Rate Parsing**: X Analytics exports engagement rate as a percentage string "2.5%". Strip the % and convert to float. If engagement rate is not in the CSV, calculate it: (engagements / impressions) * 100.

3. **Date Parsing**: X Analytics uses "YYYY-MM-DD HH:MM +0000" format typically. Also handle ISO 8601 and human-readable formats.

4. **Tweet Text Truncation**: Store full text but also create a caption_preview of first 100 characters.

5. **Missing Values**: Same as Instagram. 0 for numeric, "" for text.

6. **Sorting**: Date descending.

7. **Brand Tagging**: Same as Instagram.

### Output Schema (Post-Level)

| Column | Type | Description |
|--------|------|-------------|
| brand | string | Brand name from config |
| platform | string | Always "X" |
| post_id | string | Tweet ID |
| date | string | YYYY-MM-DD |
| content_type | string | "Tweet" (default for all) |
| caption_preview | string | First 100 chars of tweet text |
| impressions | int | Total impressions |
| likes | int | Like count |
| retweets | int | Retweet count |
| replies | int | Reply count |
| url_clicks | int | Link clicks |
| engagement_total | int | Total engagements (if available) or likes + retweets + replies |
| engagement_rate | float | Percentage |
| permalink | string | Tweet URL |

---

## COMPONENT 3: GOOGLE SHEETS WRITER (sheets_writer.py)

### Responsibilities
- Authenticate with Google Sheets API via service account
- Create or locate the target sheet tabs
- Write normalized DataFrames to the correct tabs
- Handle append mode (add new data below existing) and overwrite mode (clear and rewrite)
- Add a "Last Updated" timestamp to a metadata tab

### Tab Structure

The Google Sheet should have these tabs:

1. **"Dashboard Meta"** - Single row with last_updated timestamp, brand count, date range
2. **"IG Posts"** - All Instagram post-level data, all brands combined
3. **"IG Account"** - All Instagram account-level data, all brands combined (if available)
4. **"X Posts"** - All X post-level data, all brands combined
5. **"Summary"** - Auto-calculated summary (can be a Google Sheets formula sheet or generated by Python)

### Writing Rules

1. Always write headers in Row 1 of each tab.
2. Use batch updates (gspread batch_update or update method) to minimize API calls.
3. Before writing, check if the tab exists. If not, create it.
4. For the demo, use OVERWRITE mode (clear sheet, write fresh). For production, switch to APPEND mode.
5. Format the header row: bold, frozen, light gray background. Use gspread formatting if available, otherwise skip (Looker Studio doesn't care about Sheet formatting).

### Error Handling

- If Google Sheets API quota is exceeded (100 requests per 100 seconds per user), implement a 2-second delay between operations.
- If authentication fails, print a clear error message pointing to the credentials setup guide in README.md.
- If a tab write fails, log the error but continue with other tabs. Don't crash the entire run.

---

## COMPONENT 4: REPORT GENERATOR (report_generator.py)

This is the main entry point. It orchestrates the full pipeline.

### Usage

```bash
# Process a single brand
python src/report_generator.py --brand "Tinder" --ig-csv "./data/tinder_ig.csv" --x-csv "./data/tinder_x.csv"

# Process multiple brands from a config file
python src/report_generator.py --config ./config/brands.json --data-dir ./data/

# Process only Instagram (no X data available)
python src/report_generator.py --brand "Dunkin" --ig-csv "./data/dunkin_ig.csv"

# Overwrite mode (default for demo)
python src/report_generator.py --brand "Tinder" --ig-csv "./data/tinder_ig.csv" --mode overwrite

# Append mode (for production use)
python src/report_generator.py --brand "Tinder" --ig-csv "./data/tinder_ig.csv" --mode append
```

### Flow

1. Parse CLI arguments
2. Load brand config (from --brand flag or brands.json)
3. For each brand:
   a. If --ig-csv provided: run ig_processor.process(csv_path, brand_name)
   b. If --x-csv provided: run x_processor.process(csv_path, brand_name)
4. Combine all brand DataFrames into master DataFrames (one for IG Posts, one for X Posts)
5. Call sheets_writer.write(master_ig_posts_df, tab="IG Posts", mode=mode)
6. Call sheets_writer.write(master_x_posts_df, tab="X Posts", mode=mode)
7. Update "Dashboard Meta" tab with timestamp
8. Print summary: brands processed, posts written, date range, any errors

### CLI Output (make it demo-friendly)

```
============================================
  ReportEngine by Ascnd v1.0
============================================

Processing: Tinder (Instagram)
  -> Found 47 posts (Mar 1 - Mar 28, 2026)
  -> Top post: Reel, 45,232 reach, 8.3% engagement
  -> Writing to Google Sheets...

Processing: Tinder (X)
  -> Found 23 tweets (Mar 1 - Mar 28, 2026)
  -> Top post: 12,450 impressions, 3.1% engagement
  -> Writing to Google Sheets...

============================================
  DONE. 2 brands, 70 posts processed.
  Google Sheet updated: [sheet URL]
  Last updated: 2026-03-29 14:30 IST
============================================
```

---

## CONFIG FILES

### config/brands.json
```json
{
  "brands": [
    {
      "name": "Tinder",
      "ig_account": "tinder",
      "x_handle": "Tinder",
      "color": "#FF6B6B"
    },
    {
      "name": "Dunkin",
      "ig_account": "dunkin",
      "x_handle": "dunaborecek",
      "color": "#FF6600"
    }
  ]
}
```

### config/column_maps.json
```json
{
  "instagram": {
    "date": ["Published", "Publish time", "Date published", "Date", "publish_time", "date"],
    "post_id": ["Post ID", "post_id", "id", "ID"],
    "content_type": ["Type", "Content type", "content_type", "Media type", "media_type"],
    "caption": ["Title", "Post title", "Caption", "Description", "title", "caption"],
    "reach": ["Reach", "Organic reach", "reach", "organic_reach", "Accounts reached"],
    "views": ["Impressions", "Views", "impressions", "views", "Total impressions"],
    "likes": ["Likes", "Reactions", "likes", "reactions", "Like count"],
    "comments": ["Comments", "comments", "Comment count"],
    "shares": ["Shares", "shares", "Share count"],
    "saves": ["Saves", "saves", "Save count"],
    "follows": ["Follows", "follows", "Follow count"],
    "permalink": ["Permalink", "Post link", "permalink", "URL", "url", "Link"]
  },
  "x": {
    "date": ["time", "date", "created_at", "Date", "Created At", "Timestamp", "Tweet date"],
    "post_id": ["Tweet id", "id", "ID", "Tweet ID", "tweet_id"],
    "text": ["Tweet text", "text", "Tweet", "Content", "Full Text", "tweet_text"],
    "impressions": ["impressions", "Impressions", "Views", "View Count", "views"],
    "engagements": ["engagements", "Engagements", "Total engagements"],
    "engagement_rate": ["engagement rate", "Engagement rate", "Engagement Rate"],
    "likes": ["likes", "Likes", "favorites", "Favorites", "Favorite Count", "Like Count"],
    "retweets": ["retweets", "Retweets", "Retweet Count", "reposts", "Reposts"],
    "replies": ["replies", "Replies", "Reply Count"],
    "url_clicks": ["url clicks", "URL clicks", "link clicks", "Link clicks", "Link Click Count"],
    "profile_clicks": ["user profile clicks", "profile clicks", "Profile clicks"],
    "permalink": ["Tweet permalink", "permalink", "Permalink", "URL", "Tweet URL"]
  }
}
```

---

## SAMPLE DATA FOR TESTING

### sample_ig_content.csv (generate this for tests)
Create a CSV with 20 rows of realistic Instagram data for a fictional brand. Use these parameters:
- Date range: March 1-28, 2026
- Mix of content types: 8 Reels, 6 Carousels, 4 Images, 2 Stories
- Reach range: 1,000 to 50,000 (Reels should have higher reach)
- Engagement rate range: 1.5% to 12% (Reels and Carousels higher)
- Include realistic captions (food brand or lifestyle brand)
- Use Meta Business Suite column naming conventions

### sample_x_tweets.csv (generate this for tests)
Create a CSV with 15 rows of realistic X/Twitter data. Use these parameters:
- Date range: March 1-28, 2026
- Impressions range: 500 to 15,000
- Engagement rate range: 0.5% to 5%
- Include realistic tweet text (same brand as Instagram)
- Use X Analytics column naming conventions

---

## CODING STANDARDS

1. **No hardcoded paths.** Everything through CLI args or .env.
2. **Type hints on all functions.** Use Python type hints.
3. **Docstrings on all functions.** Google-style docstrings.
4. **Error messages must be human-readable.** No raw tracebacks for expected errors (missing file, bad CSV format, auth failure). Catch and print friendly messages.
5. **Logging.** Use Python logging module. INFO level for normal output, DEBUG for column matching details, WARNING for missing expected columns, ERROR for failures.
6. **No external API calls in processors.** Processors are pure data transformation. Only sheets_writer.py touches the Google API.
7. **Pandas best practices.** Use .loc for assignment, avoid chained indexing, handle SettingWithCopyWarning.

---

## WHAT CAN BREAK (AND HOW TO HANDLE IT)

| Failure Mode | Detection | Response |
|-------------|-----------|----------|
| CSV has unexpected column names | Column fuzzy matcher finds <50% of expected columns | WARN user, list unmatched columns, process what you can |
| CSV is empty or has only headers | len(df) == 0 after read | ERROR message: "CSV file has no data rows" |
| CSV encoding issues | UnicodeDecodeError on read | Try utf-8, then latin-1, then cp1252 |
| Date column has unparseable values | pd.to_datetime raises ValueError | WARN, set those rows' dates to None, exclude from output |
| Google Sheets auth fails | gspread.exceptions.SpreadsheetNotFound or auth error | Clear error message with setup instructions link |
| Google Sheets API rate limit | gspread.exceptions.APIError with 429 | Retry with exponential backoff, max 3 retries |
| Sheet tab doesn't exist | gspread.exceptions.WorksheetNotFound | Create the tab automatically |
| Duplicate data on re-run | Same posts written twice in append mode | De-duplicate by post_id before writing |

---

## LOOKER STUDIO DASHBOARD SETUP (manual, not coded)

### Connection
1. Open Looker Studio (lookerstudio.google.com)
2. Create New Report
3. Add Data Source: Google Sheets
4. Select the Google Sheet, select "IG Posts" tab
5. Repeat for "X Posts" tab
6. Set date column as Date type in Looker Studio

### Dashboard Pages

**Page 1: Overview**
- Scorecards: Total Reach (sum), Total Engagement (sum), Average Engagement Rate, Total Posts
- Date range filter (top right)
- Brand filter (dropdown)
- Platform filter (Instagram / X)
- Bar chart: Reach by Brand (horizontal)
- Time series: Daily Reach trend (line chart, one line per brand)

**Page 2: Instagram Deep Dive**
- Data source: IG Posts tab only
- Scorecards: Total IG Reach, Avg IG Engagement Rate, Total IG Posts
- Table: All posts sorted by engagement_rate desc, showing date, content_type, caption_preview, reach, engagement_total, engagement_rate
- Pie chart: Posts by content_type
- Bar chart: Average engagement_rate by content_type
- Time series: Weekly reach trend

**Page 3: X Deep Dive**
- Same structure as Page 2 but for X Posts tab
- Scorecards: Total Impressions, Avg Engagement Rate, Total Tweets
- Table: All tweets sorted by impressions desc

**Page 4: Content Type Comparison (Instagram only)**
- Grouped bar chart: Reach by content_type
- Grouped bar chart: Engagement rate by content_type
- This page answers: "Should we make more Reels or Carousels?"

### Styling
- Background: White (#FFFFFF)
- Accent color: Gold (#C9A84C) for Ascnd branding, or TNT brand colors if provided
- Font: Inter or Roboto (Google fonts available in Looker Studio)
- Scorecards: Large number, small label below

### Scheduled PDF Export
1. In Looker Studio, click Share > Schedule email delivery
2. Set frequency: Weekly, Monday 9:00 AM IST
3. Recipients: Viren's email (or Keerthan's for demo)
4. Format: PDF
5. Subject line: "[Brand Name] Weekly Performance Report - Powered by Ascnd"

---

## LOOM DEMO SCRIPT

See docs/LOOM_SCRIPT.md for the full shot-by-shot recording guide.

Key beats:
1. OPEN with the problem statement (15 sec): "Your team spends 3+ hours per week manually copying numbers from Instagram and Twitter into spreadsheets, then formatting reports. Here's what that looks like with Ascnd."
2. SHOW the CSV export from Meta Business Suite (30 sec): Screen record the export. Two clicks. Done.
3. RUN the script (30 sec): Terminal, run the command, show the branded output with post counts and top performers.
4. SHOW the Google Sheet (15 sec): Switch to browser, sheet is populated. No one typed anything.
5. SHOW the Looker Studio dashboard (45 sec): Walk through each page. Click a brand filter. Show the engagement breakdown.
6. SHOW the scheduled PDF (15 sec): "This lands in your inbox every Monday. You didn't make it."
7. CLOSE with the automation pitch (30 sec): "What you just saw uses a simple CSV export. When we go live, even that step disappears. The system pulls data from Instagram's API automatically every morning. But the dashboard, the reports, the data centre? That's ready now."

Total Loom: 3 minutes or less.

---

## AUTOMATION ROADMAP (for the pitch, not for the demo build)

### Phase 1: Current (CSV-based, what we're building now)
- Manual CSV export from Meta Business Suite and X
- Python script processes and writes to Google Sheets
- Looker Studio dashboard auto-updates from Sheets
- Weekly PDF report via Looker Studio email
- Time saved: ~2.5 hours/week per brand

### Phase 2: Instagram API Automation (Month 2)
- Meta Developer App with Graph API access
- n8n or cron job pulls Instagram data daily at 6 AM
- No more CSV exports for Instagram
- X remains CSV-based (or Chrome extension) until Phase 3
- Estimated build time: 1 week
- Additional cost: Rs. 0 (API is free for owned accounts)

### Phase 3: Full Automation + Custom Reports (Month 3-4)
- X API integration (if budget allows, $200/month Basic tier)
- Auto-generated branded PPTX reports (python-pptx)
- Client portal: each brand gets a unique Looker Studio link
- Slack/email alerts for breakout posts (>2x average reach)
- Estimated build time: 2-3 weeks
- Additional cost: X API ($200/month) + VPS for n8n ($500/month)

### Phase 4: Intelligence Layer (Month 5+)
- AI-powered content recommendations based on performance data
- Automated competitive benchmarking
- Predictive posting time optimization
- This is where Creator OS connects

---

## PROMPTS FOR CLAUDE CODE (fire these in sequence)

### Prompt 1: Project Setup
```
Read the CLAUDE.md file in this directory. Set up the project structure exactly as specified. Create all directories, requirements.txt, .env.example, and the config JSON files. Do not write any processing code yet. Just the skeleton and configs.
```

### Prompt 2: Utility Functions
```
Read CLAUDE.md. Build src/utils.py with:
1. A fuzzy column matcher function that takes a DataFrame and a column mapping dict (from column_maps.json) and returns a dict mapping normalized names to actual column names found in the DataFrame. Log matches at DEBUG level. Warn if <50% of expected columns are found.
2. A date parser function that handles all the date formats listed in CLAUDE.md (Meta and X formats). Returns YYYY-MM-DD string.
3. A content type normalizer for Instagram that maps all known variations to the five standard types.
4. A safe_int function that converts any value to int, returning 0 for NaN/None/empty.
5. A truncate function that takes a string and max_length, returns truncated string with "..." if needed.
Include type hints and Google-style docstrings on everything.
```

### Prompt 3: Instagram Processor
```
Read CLAUDE.md. Build src/ig_processor.py following the specs exactly. The process() function takes a CSV file path and brand_name string, returns a pandas DataFrame matching the Output Schema (Post-Level) from CLAUDE.md. Use the utils.py functions for column matching, date parsing, and type normalization. Handle all the failure modes listed in the "What Can Break" table. Create the sample test CSV and a test file. Run the tests to verify.
```

### Prompt 4: X Processor
```
Read CLAUDE.md. Build src/x_processor.py following the specs exactly. Same pattern as ig_processor.py but for X/Twitter CSV data. Handle the engagement_rate percentage string parsing (strip "%" and convert to float). Create sample test CSV and test file. Run tests.
```

### Prompt 5: Google Sheets Writer
```
Read CLAUDE.md. Build src/sheets_writer.py. It should:
1. Authenticate with Google Sheets API via service account (path from .env)
2. Open the sheet by ID (from .env)
3. Have a write() method that takes a DataFrame, tab_name, and mode (overwrite/append)
4. Handle tab creation if tab doesn't exist
5. Handle API rate limiting with retry logic
6. Update the "Dashboard Meta" tab with a timestamp after all writes
Do NOT test against a real Google Sheet yet. Just build the module with proper error handling. I'll provide credentials separately.
```

### Prompt 6: Report Generator (Main Orchestrator)
```
Read CLAUDE.md. Build src/report_generator.py as the CLI entry point. Use argparse for CLI arguments as specified. Wire up all three components (ig_processor, x_processor, sheets_writer). Make the terminal output match the demo-friendly format shown in CLAUDE.md. Handle the case where only Instagram OR only X data is provided (both are optional). Include a --dry-run flag that processes CSVs and prints output but skips the Google Sheets write.
```

### Prompt 7: Documentation
```
Read CLAUDE.md. Create:
1. README.md with full setup instructions (Google Cloud service account setup, Sheet creation, running the tool)
2. docs/LOOM_SCRIPT.md with the shot-by-shot Loom recording guide from CLAUDE.md, expanded with exact screen positions and talking points
3. docs/AUTOMATION_ROADMAP.md with the Phase 1-4 roadmap from CLAUDE.md, formatted as a client-facing document that can be sent to Viren
4. docs/LOOKER_STUDIO_SETUP.md with detailed step-by-step Looker Studio dashboard creation instructions
```

### Prompt 8: End-to-End Test
```
Run the full pipeline end-to-end with sample data in dry-run mode. Fix any bugs. Then show me the terminal output so I can verify it matches the expected format from CLAUDE.md.
```

---

## STANDING RULES

1. Never assume priority on any task. Ask Keerthan first.
2. Before building any deck, write a slide-by-slide breakdown in plain text first and get approval.
3. Never use em dashes in any output. Use periods, commas, colons, or separate sentences.
4. Price based on value of output, not experience level.
5. Empire State Building rule: know every moving part before writing code.
6. Creative challenger mode: question assumptions, think three moves ahead.
7. This is a demo to close a client. Speed and visual impact matter more than code elegance. Working > perfect.

---

## SUCCESS CRITERIA

The build is done when:
1. `python src/report_generator.py --brand "TestBrand" --ig-csv ./tests/sample_data/sample_ig_content.csv --dry-run` runs without errors and prints the demo-friendly output
2. The same command with --x-csv flag also works
3. With real Google Sheets credentials, data appears correctly in the Sheet
4. The Looker Studio dashboard is connected and shows charts (manual step)
5. The Loom is recorded and sent to Viren (manual step)

---

## NOTES FOR FUTURE SESSIONS

- This CLAUDE.md covers the demo build only. When TNT signs, create a separate CLAUDE.md for the production build with API integration.
- The column_maps.json will need updating as Meta and X change their export formats. Keep it as the single source of truth for column name handling.
- If Viren asks "can this do YouTube too?", the answer is yes. YouTube Studio also exports CSV. The architecture is the same: processor + sheet writer + Looker Studio. Scope it as Phase 2.
