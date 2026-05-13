# ReportEngine Build Plan
**Status:** APPROVED
**Date:** 2026-03-29

## Decisions Made
- Demo shows ONE account, system architectured for multiple
- Account-level IG data: DEFERRED (post-level only for now)
- Python environment: venv (built-in, no extras)
- Config convention: `{brand_name_lowercase}_ig.csv` / `{brand_name_lowercase}_x.csv`
- Column matching: exact case-insensitive against column_maps.json variations (no fuzzy/Levenshtein)
- templates/sheet_structure.json: defines tab names and column orders, read by sheets_writer

## Build Order (8 steps)

### Step 1: Project Skeleton
- requirements.txt, .env.example, config/brands.json, config/column_maps.json
- templates/sheet_structure.json
- Empty __init__.py in src/ and tests/
- tests/sample_data/ directory
- Verify: files exist, pip install works

### Step 2: src/utils.py + tests/test_utils.py
- match_columns(), parse_date(), normalize_content_type(), safe_int(), truncate()
- Tests for all edge cases
- Verify: tests green

### Step 3: Sample CSV Data
- tests/sample_data/sample_ig_content.csv (20 rows)
- tests/sample_data/sample_x_tweets.csv (15 rows)
- Verify: pandas.read_csv() loads both

### Step 4: src/ig_processor.py + tests/test_ig_processor.py
- process(csv_path, brand_name) -> DataFrame
- Encoding fallback, column matching, date parsing, content type normalization
- Calculated fields: engagement_total, engagement_rate
- Verify: tests green

### Step 5: src/x_processor.py + tests/test_x_processor.py
- process(csv_path, brand_name) -> DataFrame
- Engagement rate % string parsing, fallback calculation
- Verify: tests green

### Step 6: src/sheets_writer.py
- SheetsWriter class with auth, write(), update_metadata()
- Rate limit retry, tab auto-creation, header formatting
- No live tests (no credentials yet)

### Step 7: src/report_generator.py
- CLI entry point with argparse
- --brand, --ig-csv, --x-csv, --config, --data-dir, --mode, --dry-run
- Demo-friendly terminal output
- Verify: dry-run with sample data prints expected output

### Step 8: Documentation + E2E Test
- README.md, docs/LOOM_SCRIPT.md, docs/LOOKER_STUDIO_SETUP.md, docs/AUTOMATION_ROADMAP.md
- Full dry-run pipeline verification
