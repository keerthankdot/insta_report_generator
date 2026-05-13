# ReportEngine by Ascnd

ReportEngine eliminates manual social media data entry for agencies. It takes CSV exports from Meta Business Suite (Instagram) and X Analytics (Twitter), normalizes the data, writes it to structured Google Sheets, and powers a Looker Studio dashboard with scheduled PDF reports. What used to take 3+ hours per week now takes 60 seconds.

## Prerequisites

- Python 3.10+
- Google Cloud account (free tier works)
- A Google Sheet to write data to
- CSV exports from Meta Business Suite and/or X Analytics

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd report-engine
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Google Cloud Service Account

You need a service account so the script can write to Google Sheets without manual login.

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services > Library**
4. Search for **Google Sheets API** and click **Enable**
5. Navigate to **IAM & Admin > Service Accounts**
6. Click **Create Service Account**
   - Name: `reportengine` (or anything descriptive)
   - Role: no role needed (it accesses Sheets via sharing, not IAM)
   - Click **Done**
7. Click on the new service account, go to **Keys** tab
8. Click **Add Key > Create new key > JSON**
9. Save the downloaded file to `credentials/service_account.json` in the project directory

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```
GOOGLE_CREDENTIALS_PATH=./credentials/service_account.json
SHEET_ID=your_google_sheet_id_here
```

**How to find the Google Sheet ID:** Open your Google Sheet in the browser. The URL looks like:

```
https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/edit
                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                       This is your Sheet ID
```

### 4. Share the Google Sheet

Open the target Google Sheet, click **Share**, and add the service account email as an **Editor**. The service account email looks like `reportengine@your-project.iam.gserviceaccount.com` (you can find it in the JSON key file under `client_email`).

## Usage

### Single brand with Instagram data

```bash
python src/report_generator.py --brand "Tinder" --ig-csv "./data/tinder_ig.csv" --dry-run
```

### Single brand with both platforms

```bash
python src/report_generator.py --brand "Tinder" --ig-csv "./data/tinder_ig.csv" --x-csv "./data/tinder_x.csv"
```

### Instagram only (no X data available)

```bash
python src/report_generator.py --brand "Dunkin" --ig-csv "./data/dunkin_ig.csv"
```

### Multi-brand from config file

```bash
python src/report_generator.py --config ./config/brands.json --data-dir ./data/
```

This expects CSV files named `{brand_lowercase}_ig.csv` and `{brand_lowercase}_x.csv` in the data directory. Missing files are skipped with a warning.

### Overwrite mode (default, best for demos)

```bash
python src/report_generator.py --brand "Tinder" --ig-csv "./data/tinder_ig.csv" --mode overwrite
```

### Append mode (for production, adds new data without clearing)

```bash
python src/report_generator.py --brand "Tinder" --ig-csv "./data/tinder_ig.csv" --mode append
```

### Dry run (process CSVs, skip Sheets write)

```bash
python src/report_generator.py --brand "Tinder" --ig-csv "./data/tinder_ig.csv" --x-csv "./data/tinder_x.csv" --dry-run
```

## Output

The script produces demo-friendly terminal output:

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
  DONE. 1 brand, 70 posts processed.
  Google Sheet updated.
  Last updated: 2026-03-29 14:30
============================================
```

## Project Structure

```
report-engine/
  README.md                    # This file
  requirements.txt             # Python dependencies
  .env.example                 # Environment variable template
  config/
    brands.json                # Brand configuration
    column_maps.json           # CSV column name mappings
  src/
    ig_processor.py            # Instagram CSV processor
    x_processor.py             # X/Twitter CSV processor
    sheets_writer.py           # Google Sheets writer
    report_generator.py        # Main CLI entry point
    utils.py                   # Shared utility functions
  templates/
    sheet_structure.json       # Google Sheet tab/column definitions
  tests/
    test_ig_processor.py       # Instagram processor tests
    test_x_processor.py        # X processor tests
    test_utils.py              # Utility function tests
    sample_data/
      sample_ig_content.csv    # Sample Instagram CSV (20 rows)
      sample_x_tweets.csv      # Sample X Analytics CSV (15 rows)
  docs/
    LOOM_SCRIPT.md             # Loom recording guide
    LOOKER_STUDIO_SETUP.md     # Dashboard build instructions
    AUTOMATION_ROADMAP.md      # Future automation pitch doc
```

## Running Tests

```bash
source .venv/bin/activate
python -m pytest tests/ -v
```

## How to Export CSVs

### Instagram (Meta Business Suite)

1. Go to [business.facebook.com](https://business.facebook.com)
2. Select your Instagram account
3. Navigate to **Content** tab
4. Set the date range
5. Click **Export** (top right)
6. Choose **CSV** format
7. Save the file

### X/Twitter (X Analytics)

1. Go to [analytics.x.com](https://analytics.x.com) (requires X Premium)
2. Navigate to **Tweets** tab
3. Set the date range
4. Click **Export data**
5. Save the CSV file

If X Premium is not available, use a Chrome extension like TwExport or XTractor to export tweet data with engagement metrics.

## Next Steps

This is the Phase 1 (CSV-based) build. For the full automation roadmap including API integration, automated pulls, and AI-powered insights, see [docs/AUTOMATION_ROADMAP.md](docs/AUTOMATION_ROADMAP.md).
