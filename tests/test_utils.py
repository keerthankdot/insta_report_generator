"""Tests for src/utils.py utility functions."""

import logging
import math

import pandas as pd
import pytest

from src.utils import match_columns, normalize_content_type, parse_date, safe_int, truncate


# --- match_columns ---


class TestMatchColumns:
    def test_full_match(self):
        df = pd.DataFrame(columns=["Published", "Post ID", "Reach", "Likes"])
        column_map = {
            "date": ["Published", "Publish time"],
            "post_id": ["Post ID", "post_id"],
            "reach": ["Reach", "Organic reach"],
            "likes": ["Likes", "Reactions"],
        }
        result = match_columns(df, column_map)
        assert result == {
            "date": "Published",
            "post_id": "Post ID",
            "reach": "Reach",
            "likes": "Likes",
        }

    def test_partial_match_below_50_warns(self, caplog):
        df = pd.DataFrame(columns=["Published"])
        column_map = {
            "date": ["Published"],
            "post_id": ["Post ID"],
            "reach": ["Reach"],
        }
        with caplog.at_level(logging.WARNING, logger="src.utils"):
            result = match_columns(df, column_map)
        assert result == {"date": "Published"}
        assert "Only 1/3 columns matched" in caplog.text
        assert "post_id" in caplog.text
        assert "reach" in caplog.text

    def test_no_match(self, caplog):
        df = pd.DataFrame(columns=["foo", "bar"])
        column_map = {
            "date": ["Published"],
            "post_id": ["Post ID"],
        }
        with caplog.at_level(logging.WARNING, logger="src.utils"):
            result = match_columns(df, column_map)
        assert result == {}
        assert "Only 0/2 columns matched" in caplog.text

    def test_case_insensitive(self):
        df = pd.DataFrame(columns=["published", "POST ID", "rEaCh"])
        column_map = {
            "date": ["Published"],
            "post_id": ["Post ID"],
            "reach": ["Reach"],
        }
        result = match_columns(df, column_map)
        assert result["date"] == "published"
        assert result["post_id"] == "POST ID"
        assert result["reach"] == "rEaCh"

    def test_first_variation_wins(self):
        df = pd.DataFrame(columns=["Publish time", "Date published"])
        column_map = {
            "date": ["Published", "Publish time", "Date published"],
        }
        result = match_columns(df, column_map)
        assert result["date"] == "Publish time"

    def test_empty_map(self):
        df = pd.DataFrame(columns=["Published"])
        result = match_columns(df, {})
        assert result == {}


# --- parse_date ---


class TestParseDate:
    def test_us_locale(self):
        assert parse_date("Mar 15, 2026, 10:30 AM") == "2026-03-15"

    def test_non_us_locale(self):
        assert parse_date("15 Mar 2026 10:30") == "2026-03-15"

    def test_iso_with_timezone(self):
        assert parse_date("2026-03-15T10:30:00+0530") == "2026-03-15"

    def test_date_only(self):
        assert parse_date("2026-03-15") == "2026-03-15"

    def test_x_analytics_format(self):
        assert parse_date("2026-03-15 10:30 +0000") == "2026-03-15"

    def test_none(self):
        assert parse_date(None) == ""

    def test_empty_string(self):
        assert parse_date("") == ""

    def test_nan(self):
        assert parse_date(float("nan")) == ""

    def test_garbage_string(self, caplog):
        with caplog.at_level(logging.WARNING, logger="src.utils"):
            assert parse_date("not-a-date-at-all") == ""
        assert "Could not parse date" in caplog.text


# --- normalize_content_type ---


class TestNormalizeContentType:
    @pytest.mark.parametrize(
        "raw,expected",
        [
            ("IG carousel", "Carousel"),
            ("Carousel album", "Carousel"),
            ("Carousel", "Carousel"),
            ("IG reel", "Reel"),
            ("Reel", "Reel"),
            ("IG image", "Image"),
            ("Photo", "Image"),
            ("Image", "Image"),
            ("IG video", "Video"),
            ("Video", "Video"),
            ("IG story", "Story"),
            ("Story", "Story"),
        ],
    )
    def test_known_types(self, raw, expected):
        assert normalize_content_type(raw) == expected

    def test_case_insensitive(self):
        assert normalize_content_type("ig CAROUSEL") == "Carousel"
        assert normalize_content_type("REEL") == "Reel"

    def test_strips_whitespace(self):
        assert normalize_content_type("  Reel  ") == "Reel"

    def test_unknown_type_warns(self, caplog):
        with caplog.at_level(logging.WARNING, logger="src.utils"):
            result = normalize_content_type("Live Stream")
        assert result == "Live Stream"
        assert "Unknown content type" in caplog.text

    def test_empty_string(self):
        assert normalize_content_type("") == ""

    def test_none(self):
        assert normalize_content_type(None) == ""


# --- safe_int ---


class TestSafeInt:
    def test_int(self):
        assert safe_int(42) == 42

    def test_float(self):
        assert safe_int(3.0) == 3
        assert safe_int(3.7) == 3

    def test_string_number(self):
        assert safe_int("1234") == 1234

    def test_comma_formatted(self):
        assert safe_int("1,234") == 1234
        assert safe_int("1,234,567") == 1234567

    def test_none(self):
        assert safe_int(None) == 0

    def test_nan(self):
        assert safe_int(float("nan")) == 0

    def test_empty_string(self):
        assert safe_int("") == 0

    def test_non_numeric_string(self):
        assert safe_int("abc") == 0

    def test_zero(self):
        assert safe_int(0) == 0

    def test_negative(self):
        assert safe_int(-5) == -5

    def test_string_float(self):
        assert safe_int("3.14") == 3


# --- truncate ---


class TestTruncate:
    def test_short_string(self):
        assert truncate("hello", 100) == "hello"

    def test_exact_length(self):
        text = "a" * 100
        assert truncate(text, 100) == text

    def test_long_string(self):
        text = "a" * 120
        result = truncate(text, 100)
        assert len(result) == 100
        assert result.endswith("...")
        assert result == "a" * 97 + "..."

    def test_none(self):
        assert truncate(None) == ""

    def test_nan(self):
        assert truncate(float("nan")) == ""

    def test_default_max_length(self):
        text = "a" * 150
        result = truncate(text)
        assert len(result) == 100
        assert result.endswith("...")
