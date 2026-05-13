"""Instagram CSV processor for ReportEngine.

Reads Meta Business Suite content insight CSV exports, normalizes the data,
and returns a clean DataFrame matching the IG Posts output schema.
"""

import json
import logging
from pathlib import Path
from typing import Optional

import pandas as pd

from src.utils import match_columns, normalize_content_type, parse_date, safe_int, truncate

logger = logging.getLogger(__name__)

COLUMN_MAPS_PATH = Path(__file__).parent.parent / "config" / "column_maps.json"

OUTPUT_COLUMNS = [
    "brand",
    "platform",
    "post_id",
    "date",
    "content_type",
    "caption_preview",
    "reach",
    "views",
    "likes",
    "comments",
    "shares",
    "saves",
    "engagement_total",
    "engagement_rate",
    "permalink",
]


def _read_csv(csv_path: str) -> pd.DataFrame:
    """Read a CSV file with encoding fallback.

    Tries utf-8, then latin-1, then cp1252.

    Args:
        csv_path: Path to the CSV file.

    Returns:
        DataFrame with raw CSV data.

    Raises:
        FileNotFoundError: If the CSV file does not exist.
        ValueError: If the CSV file has no data rows.
    """
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")

    for encoding in ("utf-8", "latin-1", "cp1252"):
        try:
            df = pd.read_csv(csv_path, encoding=encoding)
            logger.debug("Read CSV with encoding: %s", encoding)
            break
        except UnicodeDecodeError:
            logger.debug("Encoding %s failed, trying next", encoding)
            continue
    else:
        raise ValueError(f"Could not read CSV file with any supported encoding: {csv_path}")

    if len(df) == 0:
        raise ValueError(f"CSV file has no data rows: {csv_path}")

    return df


def process(csv_path: str, brand_name: str) -> pd.DataFrame:
    """Process an Instagram CSV export into a normalized DataFrame.

    Reads a Meta Business Suite content insights CSV, maps columns to
    normalized names, parses dates, normalizes content types, calculates
    engagement metrics, and returns a DataFrame matching the IG Posts
    output schema.

    Args:
        csv_path: Path to the Instagram CSV export file.
        brand_name: Brand name to tag each row with.

    Returns:
        DataFrame with columns matching OUTPUT_COLUMNS, sorted by date
        descending.

    Raises:
        FileNotFoundError: If the CSV file does not exist.
        ValueError: If the CSV file has no data rows.
    """
    logger.info("Processing Instagram CSV: %s (brand: %s)", csv_path, brand_name)

    df = _read_csv(csv_path)
    logger.info("Read %d rows from CSV", len(df))

    with open(COLUMN_MAPS_PATH, "r") as f:
        column_maps = json.load(f)
    ig_map = column_maps["instagram"]

    matched = match_columns(df, ig_map)
    logger.info("Matched %d/%d columns", len(matched), len(ig_map))

    result = pd.DataFrame()

    # Map matched columns to normalized names
    result["post_id"] = df[matched["post_id"]].astype(str) if "post_id" in matched else ""
    result["date"] = df[matched["date"]].apply(parse_date) if "date" in matched else ""
    result["content_type"] = (
        df[matched["content_type"]].apply(normalize_content_type)
        if "content_type" in matched
        else ""
    )
    result["caption_preview"] = (
        df[matched["caption"]].apply(truncate) if "caption" in matched else ""
    )

    numeric_fields = ["reach", "views", "likes", "comments", "shares", "saves"]
    for field in numeric_fields:
        if field in matched:
            result[field] = df[matched[field]].apply(safe_int)
        else:
            result[field] = 0

    result["engagement_total"] = (
        result["likes"] + result["comments"] + result["shares"] + result["saves"]
    )
    result["engagement_rate"] = result.apply(
        lambda row: round((row["engagement_total"] / row["reach"]) * 100, 2)
        if row["reach"] > 0
        else 0,
        axis=1,
    )

    result["permalink"] = df[matched["permalink"]].astype(str) if "permalink" in matched else ""

    result["brand"] = brand_name
    result["platform"] = "Instagram"

    # Fill any remaining NaN
    for col in result.columns:
        if result[col].dtype in ("int64", "float64"):
            result[col] = result[col].fillna(0)
        else:
            result[col] = result[col].fillna("")

    # Sort by date descending
    result = result.sort_values("date", ascending=False).reset_index(drop=True)

    # Return with exact column order
    return result[OUTPUT_COLUMNS]
