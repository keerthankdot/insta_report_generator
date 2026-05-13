"""ReportEngine CLI entry point.

Orchestrates CSV processing and Google Sheets writing for Instagram
and X/Twitter social media data. Supports single-brand and multi-brand
modes with dry-run capability.
"""

import argparse
import json
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple

# Allow running as both `python src/report_generator.py` and `python -m src.report_generator`
if __name__ == "__main__" and __package__ is None:
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd

from src import ig_processor, x_processor

logger = logging.getLogger(__name__)

VERSION = "1.0"


def _format_date_range(df: pd.DataFrame) -> str:
    """Format the date range from a DataFrame as human-readable string.

    Args:
        df: DataFrame with a "date" column in YYYY-MM-DD format.

    Returns:
        String like "Mar 1 - Mar 28, 2026".
    """
    dates = pd.to_datetime(df["date"])
    min_date = dates.min()
    max_date = dates.max()
    if min_date.year == max_date.year:
        return f"{min_date.strftime('%b %-d')} - {max_date.strftime('%b %-d, %Y')}"
    return f"{min_date.strftime('%b %-d, %Y')} - {max_date.strftime('%b %-d, %Y')}"


def _print_header() -> None:
    """Print the branded CLI header."""
    print()
    print("============================================")
    print("  ReportEngine by Ascnd v" + VERSION)
    print("============================================")
    print()


def _print_footer(
    brand_count: int,
    total_posts: int,
    dry_run: bool,
    report_dir: Optional[str] = None,
) -> None:
    """Print the summary footer.

    Args:
        brand_count: Number of brands processed.
        total_posts: Total posts across all brands and platforms.
        dry_run: Whether this was a dry run.
        report_dir: Directory where PPTX reports were saved, or None.
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    print()
    print("============================================")
    print(f"  DONE. {brand_count} brand{'s' if brand_count != 1 else ''}, {total_posts} posts processed.")
    if dry_run:
        print("  Dry run: no Sheet updated")
    else:
        print("  Google Sheet updated.")
    if report_dir:
        print(f"  Reports saved to: {report_dir}")
    print(f"  Last updated: {timestamp}")
    print("============================================")
    print()


def _build_parser() -> argparse.ArgumentParser:
    """Build the argument parser.

    Returns:
        Configured ArgumentParser.
    """
    parser = argparse.ArgumentParser(
        description="ReportEngine by Ascnd: CSV to Google Sheets pipeline for social media analytics.",
        add_help=True,
    )
    parser.add_argument("--brand", type=str, help="Single brand name to process")
    parser.add_argument("--ig-csv", type=str, help="Path to Instagram CSV file")
    parser.add_argument("--x-csv", type=str, help="Path to X/Twitter CSV file")
    parser.add_argument("--config", type=str, help="Path to brands.json for multi-brand processing")
    parser.add_argument("--data-dir", type=str, help="Directory containing CSV files (used with --config)")
    parser.add_argument("--mode", type=str, default="overwrite", choices=["overwrite", "append"],
                        help="Write mode: overwrite (default) or append")
    parser.add_argument("--dry-run", action="store_true", help="Process CSVs but skip Google Sheets write")
    parser.add_argument("--report", action="store_true", help="Generate PPTX report for each brand")
    parser.add_argument("--output-dir", type=str, default="./reports/",
                        help="Directory to save generated reports (default: ./reports/)")
    return parser


def _validate_args(args: argparse.Namespace) -> Optional[str]:
    """Validate CLI arguments and return error message if invalid.

    Args:
        args: Parsed arguments.

    Returns:
        Error message string, or None if valid.
    """
    if args.brand and args.config:
        return "Cannot use both --brand and --config. Pick one."
    if not args.brand and not args.config:
        return "Must provide either --brand or --config."
    if args.brand and not args.ig_csv and not args.x_csv:
        return "With --brand, must provide at least one of --ig-csv or --x-csv."
    if args.config and not args.data_dir:
        return "--data-dir is required when using --config."
    if args.config and not Path(args.config).exists():
        return f"Config file not found: {args.config}"
    if args.data_dir and not Path(args.data_dir).is_dir():
        return f"Data directory not found: {args.data_dir}"
    return None


def main() -> None:
    """Main entry point for the ReportEngine CLI."""
    parser = _build_parser()
    args = parser.parse_args()

    error = _validate_args(args)
    if error:
        print(f"\nError: {error}")
        print("Run with --help for usage information.\n")
        sys.exit(1)

    _print_header()

    # Determine brand list
    brands: List[dict] = []
    if args.brand:
        brands = [{"name": args.brand}]
    else:
        with open(args.config, "r") as f:
            config = json.load(f)
        brands = config["brands"]

    ig_frames: List[pd.DataFrame] = []
    x_frames: List[pd.DataFrame] = []
    processed_brands: List[str] = []

    for brand in brands:
        brand_name = brand["name"]

        # Determine CSV paths
        if args.brand:
            ig_path = args.ig_csv
            x_path = args.x_csv
        else:
            brand_lower = brand_name.lower()
            ig_path = str(Path(args.data_dir) / f"{brand_lower}_ig.csv")
            x_path = str(Path(args.data_dir) / f"{brand_lower}_x.csv")
            if not Path(ig_path).exists():
                ig_path = None
            if not Path(x_path).exists():
                x_path = None

        brand_had_data = False

        # Process Instagram
        if ig_path:
            try:
                print(f"Processing: {brand_name} (Instagram)")
                ig_df = ig_processor.process(ig_path, brand_name)
                date_range_str = _format_date_range(ig_df)
                print(f"  -> Found {len(ig_df)} posts ({date_range_str})")

                top = ig_df.loc[ig_df["engagement_rate"].idxmax()]
                print(f"  -> Top post: {top['content_type']}, {top['reach']:,} reach, {top['engagement_rate']}% engagement")

                ig_frames.append(ig_df)
                brand_had_data = True
            except Exception as e:
                print(f"  -> Error processing Instagram CSV: {e}")
                logger.error("Failed to process IG CSV for %s: %s", brand_name, e)

        # Process X
        if x_path:
            try:
                print(f"Processing: {brand_name} (X)")
                x_df = x_processor.process(x_path, brand_name)
                date_range_str = _format_date_range(x_df)
                print(f"  -> Found {len(x_df)} tweets ({date_range_str})")

                top = x_df.loc[x_df["engagement_rate"].idxmax()]
                print(f"  -> Top post: {top['impressions']:,} impressions, {top['engagement_rate']}% engagement")

                x_frames.append(x_df)
                brand_had_data = True
            except Exception as e:
                print(f"  -> Error processing X CSV: {e}")
                logger.error("Failed to process X CSV for %s: %s", brand_name, e)

        if brand_had_data:
            processed_brands.append(brand_name)

    # Combine DataFrames
    master_ig = pd.concat(ig_frames, ignore_index=True) if ig_frames else None
    master_x = pd.concat(x_frames, ignore_index=True) if x_frames else None

    total_posts = 0
    if master_ig is not None:
        total_posts += len(master_ig)
    if master_x is not None:
        total_posts += len(master_x)

    # Write to Google Sheets or skip for dry run
    if not args.dry_run:
        try:
            from dotenv import load_dotenv
            import os

            load_dotenv()
            creds_path = os.getenv("GOOGLE_CREDENTIALS_PATH")
            sheet_id = os.getenv("SHEET_ID")

            if not creds_path or not sheet_id:
                print("  -> Error: GOOGLE_CREDENTIALS_PATH and SHEET_ID must be set in .env")
            else:
                from src.sheets_writer import SheetsWriter
                writer = SheetsWriter(creds_path, sheet_id)

                if master_ig is not None:
                    print("  -> Writing Instagram data to Google Sheets...")
                    writer.write(master_ig, "IG Posts", mode=args.mode)

                if master_x is not None:
                    print("  -> Writing X data to Google Sheets...")
                    writer.write(master_x, "X Posts", mode=args.mode)

                # Calculate overall date range
                all_dates = []
                if master_ig is not None:
                    all_dates.extend(master_ig["date"].tolist())
                if master_x is not None:
                    all_dates.extend(master_x["date"].tolist())
                if all_dates:
                    all_dates_sorted = sorted(all_dates)
                    writer.update_metadata(
                        processed_brands,
                        (all_dates_sorted[0], all_dates_sorted[-1]),
                    )
        except Exception as e:
            print(f"  -> Error writing to Google Sheets: {e}")
            logger.error("Sheets write failed: %s", e)
    else:
        print("  -> Dry run: skipping Google Sheets write")

    # Generate PPTX reports
    report_dir = None
    if args.report:
        from src.pptx_generator import generate_report

        output_dir = Path(args.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        report_dir = str(output_dir)

        for brand_name in processed_brands:
            try:
                brand_ig = None
                brand_x = None
                if master_ig is not None:
                    filtered = master_ig[master_ig["brand"] == brand_name]
                    if len(filtered) > 0:
                        brand_ig = filtered
                if master_x is not None:
                    filtered = master_x[master_x["brand"] == brand_name]
                    if len(filtered) > 0:
                        brand_x = filtered

                output_path = str(output_dir / f"{brand_name.lower()}_weekly_report.pptx")
                generate_report(brand_ig, brand_x, brand_name, output_path)
                print(f"  -> Report generated: {output_path}")
            except Exception as e:
                print(f"  -> Error generating report for {brand_name}: {e}")
                logger.error("PPTX generation failed for %s: %s", brand_name, e)

    _print_footer(len(processed_brands), total_posts, args.dry_run, report_dir)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted. Exiting.\n")
        sys.exit(130)
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        print("Please report this issue.\n")
        logger.exception("Unexpected error in report_generator")
        sys.exit(1)
