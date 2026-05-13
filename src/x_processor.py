"""X/Twitter CSV processor for ReportEngine.

Reads X Analytics or Chrome extension CSV exports, normalizes the data,
and returns a clean DataFrame matching the X Posts output schema.
"""

import json
import logging
from pathlib import Path

import pandas as pd

from src.utils import match_columns, parse_date, safe_int, truncate

logger = logging.getLogger(__name__)

COLUMN_MAPS_PATH = Path(__file__).parent.parent / "config" / "column_maps.json"

OUTPUT_COLUMNS = [
    "brand",
    "platform",
    "post_id",
    "date",
    "content_type",
    "caption_preview",
    "impressions",
    "likes",
    "retweets",
    "replies",
    "url_clicks",
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


def _parse_engagement_rate(value: str) -> float:
    """Parse an engagement rate value, stripping '%' if present.

    Args:
        value: Engagement rate as string (e.g. "2.5%") or numeric.

    Returns:
        Float engagement rate, or 0.0 if unparseable.
    """
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return 0.0
    s = str(value).strip().rstrip("%")
    try:
        return round(float(s), 2)
    except (ValueError, TypeError):
        return 0.0


def process(csv_path: str, brand_name: str) -> pd.DataFrame:
    """Process an X/Twitter CSV export into a normalized DataFrame.

    Reads an X Analytics or Chrome extension CSV, maps columns to
    normalized names, parses dates and engagement rates, and returns
    a DataFrame matching the X Posts output schema.

    Args:
        csv_path: Path to the X CSV export file.
        brand_name: Brand name to tag each row with.

    Returns:
        DataFrame with columns matching OUTPUT_COLUMNS, sorted by date
        descending.

    Raises:
        FileNotFoundError: If the CSV file does not exist.
        ValueError: If the CSV file has no data rows.
    """
    logger.info("Processing X CSV: %s (brand: %s)", csv_path, brand_name)

    df = _read_csv(csv_path)
    logger.info("Read %d rows from CSV", len(df))

    with open(COLUMN_MAPS_PATH, "r") as f:
        column_maps = json.load(f)
    x_map = column_maps["x"]

    matched = match_columns(df, x_map)
    logger.info("Matched %d/%d columns", len(matched), len(x_map))

    result = pd.DataFrame()

    # Text fields
    result["post_id"] = df[matched["post_id"]].astype(str) if "post_id" in matched else ""
    result["date"] = df[matched["date"]].apply(parse_date) if "date" in matched else ""
    result["caption_preview"] = (
        df[matched["text"]].apply(truncate) if "text" in matched else ""
    )
    result["permalink"] = df[matched["permalink"]].astype(str) if "permalink" in matched else ""

    # Numeric fields
    numeric_fields = ["impressions", "likes", "retweets", "replies", "url_clicks"]
    for field in numeric_fields:
        if field in matched:
            result[field] = df[matched[field]].apply(safe_int)
        else:
            result[field] = 0

    # Engagement total: use "engagements" column if available, else sum components
    if "engagements" in matched:
        result["engagement_total"] = df[matched["engagements"]].apply(safe_int)
    else:
        result["engagement_total"] = result["likes"] + result["retweets"] + result["replies"]

    # Engagement rate: parse from column, or calculate from engagements/impressions,
    # or fall back to (likes + retweets + replies) / impressions
    if "engagement_rate" in matched:
        result["engagement_rate"] = df[matched["engagement_rate"]].apply(_parse_engagement_rate)
    elif "engagements" in matched:
        result["engagement_rate"] = result.apply(
            lambda row: round((row["engagement_total"] / row["impressions"]) * 100, 2)
            if row["impressions"] > 0
            else 0.0,
            axis=1,
        )
    else:
        result["engagement_rate"] = result.apply(
            lambda row: round(
                ((row["likes"] + row["retweets"] + row["replies"]) / row["impressions"]) * 100, 2
            )
            if row["impressions"] > 0
            else 0.0,
            axis=1,
        )

    # Static fields
    result["content_type"] = "Tweet"
    result["brand"] = brand_name
    result["platform"] = "X"

    # Fill remaining NaN
    for col in result.columns:
        if result[col].dtype in ("int64", "float64"):
            result[col] = result[col].fillna(0)
        else:
            result[col] = result[col].fillna("")

    # Sort by date descending
    result = result.sort_values("date", ascending=False).reset_index(drop=True)

    return result[OUTPUT_COLUMNS]
