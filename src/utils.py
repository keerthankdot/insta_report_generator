"""Utility functions for ReportEngine CSV processing.

Provides column matching, date parsing, content type normalization,
safe type conversion, and string truncation.
"""

import logging
import math
from typing import Any

import pandas as pd

logger = logging.getLogger(__name__)


def match_columns(df: pd.DataFrame, column_map: dict[str, list[str]]) -> dict[str, str]:
    """Match DataFrame columns to normalized names using known variations.

    For each normalized name in the map, checks if any of its known variations
    exist as a DataFrame column (case-insensitive exact match). Returns the
    first match found for each normalized name.

    Args:
        df: DataFrame whose columns to match against.
        column_map: Dict mapping normalized names to lists of known variations.
            Example: {"date": ["Published", "Publish time", "Date"]}

    Returns:
        Dict mapping normalized names to the actual column names found in df.
        Only includes normalized names that had a match.
    """
    df_columns_lower = {col.lower(): col for col in df.columns}
    matched = {}

    for normalized_name, variations in column_map.items():
        for variation in variations:
            actual_col = df_columns_lower.get(variation.lower())
            if actual_col is not None:
                matched[normalized_name] = actual_col
                logger.debug("Matched '%s' -> '%s'", normalized_name, actual_col)
                break

    total = len(column_map)
    matched_count = len(matched)
    if total > 0 and matched_count / total < 0.5:
        unmatched = [name for name in column_map if name not in matched]
        logger.warning(
            "Only %d/%d columns matched (%.0f%%). Unmatched: %s",
            matched_count,
            total,
            (matched_count / total) * 100,
            ", ".join(unmatched),
        )

    return matched


def parse_date(value: Any) -> str:
    """Parse a date value into YYYY-MM-DD string format.

    Handles multiple date formats commonly found in Meta Business Suite
    and X Analytics CSV exports.

    Args:
        value: Date value to parse. Can be a string in various formats,
            a datetime object, None, or NaN.

    Returns:
        Date string in YYYY-MM-DD format, or "" if the value is
        None, NaN, empty, or unparseable.
    """
    if value is None:
        return ""
    if isinstance(value, float) and math.isnan(value):
        return ""
    if isinstance(value, str) and value.strip() == "":
        return ""

    try:
        parsed = pd.to_datetime(value, dayfirst=False)
        return parsed.strftime("%Y-%m-%d")
    except (ValueError, TypeError):
        logger.warning("Could not parse date value: '%s'", value)
        return ""


def normalize_content_type(raw_type: str) -> str:
    """Normalize Instagram content type strings to standard values.

    Maps all known variations to one of: Image, Carousel, Reel, Video, Story.

    Args:
        raw_type: Raw content type string from CSV export.

    Returns:
        Normalized content type string ("Image", "Carousel", "Reel",
        "Video", or "Story"). Returns the original string if no
        mapping is found.
    """
    if not raw_type or (isinstance(raw_type, float) and math.isnan(raw_type)):
        return ""

    mapping = {
        "ig carousel": "Carousel",
        "carousel album": "Carousel",
        "carousel": "Carousel",
        "ig reel": "Reel",
        "reel": "Reel",
        "ig image": "Image",
        "photo": "Image",
        "image": "Image",
        "ig video": "Video",
        "video": "Video",
        "ig story": "Story",
        "story": "Story",
    }

    normalized = mapping.get(raw_type.strip().lower())
    if normalized is None:
        logger.warning("Unknown content type: '%s'", raw_type)
        return raw_type
    return normalized


def safe_int(value: Any) -> int:
    """Safely convert any value to int, returning 0 for invalid inputs.

    Handles floats, string numbers, comma-formatted numbers, None, NaN,
    empty strings, and non-numeric strings.

    Args:
        value: Value to convert to int.

    Returns:
        Integer value, or 0 if conversion is not possible.
    """
    if value is None:
        return 0
    if isinstance(value, float) and math.isnan(value):
        return 0
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    if isinstance(value, str):
        cleaned = value.strip().replace(",", "")
        if cleaned == "":
            return 0
        try:
            return int(float(cleaned))
        except (ValueError, TypeError):
            return 0
    return 0


def truncate(text: str, max_length: int = 100) -> str:
    """Truncate a string to a maximum length, appending "..." if needed.

    Args:
        text: String to truncate. Returns "" if None or NaN.
        max_length: Maximum length of the returned string (including "...").

    Returns:
        Original string if within max_length, truncated string with "..."
        appended if longer, or "" if input is None/NaN.
    """
    if text is None:
        return ""
    if isinstance(text, float) and math.isnan(text):
        return ""
    text = str(text)
    if len(text) <= max_length:
        return text
    return text[: max_length - 3] + "..."
