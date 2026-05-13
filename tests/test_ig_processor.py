"""Tests for src/ig_processor.py Instagram CSV processor."""

import os
import tempfile

import pandas as pd
import pytest

from src.ig_processor import OUTPUT_COLUMNS, process

SAMPLE_CSV = os.path.join(
    os.path.dirname(__file__), "sample_data", "sample_ig_content.csv"
)


class TestProcessWithSampleData:
    def test_returns_20_rows(self):
        df = process(SAMPLE_CSV, "TestBrand")
        assert len(df) == 20

    def test_returns_dataframe(self):
        df = process(SAMPLE_CSV, "TestBrand")
        assert isinstance(df, pd.DataFrame)


class TestOutputSchema:
    def test_exact_columns(self):
        df = process(SAMPLE_CSV, "TestBrand")
        assert list(df.columns) == OUTPUT_COLUMNS

    def test_column_count(self):
        df = process(SAMPLE_CSV, "TestBrand")
        assert len(df.columns) == 15


class TestEngagementCalculation:
    def test_engagement_total(self):
        df = process(SAMPLE_CSV, "TestBrand")
        for _, row in df.iterrows():
            expected = row["likes"] + row["comments"] + row["shares"] + row["saves"]
            assert row["engagement_total"] == expected

    def test_engagement_rate(self):
        df = process(SAMPLE_CSV, "TestBrand")
        for _, row in df.iterrows():
            if row["reach"] > 0:
                expected = round((row["engagement_total"] / row["reach"]) * 100, 2)
                assert row["engagement_rate"] == expected
            else:
                assert row["engagement_rate"] == 0

    def test_engagement_rate_is_float(self):
        df = process(SAMPLE_CSV, "TestBrand")
        assert df["engagement_rate"].dtype == float


class TestContentTypeNormalization:
    def test_ig_reel_becomes_reel(self):
        df = process(SAMPLE_CSV, "TestBrand")
        reels = df[df["content_type"] == "Reel"]
        assert len(reels) == 8

    def test_ig_carousel_becomes_carousel(self):
        df = process(SAMPLE_CSV, "TestBrand")
        carousels = df[df["content_type"] == "Carousel"]
        assert len(carousels) == 6

    def test_ig_image_becomes_image(self):
        df = process(SAMPLE_CSV, "TestBrand")
        images = df[df["content_type"] == "Image"]
        assert len(images) == 4

    def test_ig_story_becomes_story(self):
        df = process(SAMPLE_CSV, "TestBrand")
        stories = df[df["content_type"] == "Story"]
        assert len(stories) == 2

    def test_no_raw_ig_prefixes(self):
        df = process(SAMPLE_CSV, "TestBrand")
        for ct in df["content_type"]:
            assert not ct.startswith("IG ")


class TestDateParsing:
    def test_all_dates_yyyy_mm_dd(self):
        df = process(SAMPLE_CSV, "TestBrand")
        for date_val in df["date"]:
            assert len(date_val) == 10
            assert date_val[4] == "-"
            assert date_val[7] == "-"

    def test_dates_in_march_2026(self):
        df = process(SAMPLE_CSV, "TestBrand")
        for date_val in df["date"]:
            assert date_val.startswith("2026-03-")


class TestSorting:
    def test_sorted_by_date_descending(self):
        df = process(SAMPLE_CSV, "TestBrand")
        dates = list(df["date"])
        assert dates == sorted(dates, reverse=True)


class TestBrandTagging:
    def test_brand_column(self):
        df = process(SAMPLE_CSV, "TestBrand")
        assert all(df["brand"] == "TestBrand")

    def test_platform_column(self):
        df = process(SAMPLE_CSV, "TestBrand")
        assert all(df["platform"] == "Instagram")

    def test_different_brand_name(self):
        df = process(SAMPLE_CSV, "Tinder")
        assert all(df["brand"] == "Tinder")


class TestEmptyCsv:
    def test_raises_value_error(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
            f.write("Title,Post ID,Type,Published,Reach\n")
            f.flush()
            with pytest.raises(ValueError, match="no data rows"):
                process(f.name, "TestBrand")
        os.unlink(f.name)


class TestMissingColumns:
    def test_processes_with_partial_columns(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
            f.write("Published,Likes\n")
            f.write('"Mar 15, 2026, 10:30 AM",42\n')
            f.flush()
            df = process(f.name, "TestBrand")
            assert len(df) == 1
            assert df.iloc[0]["date"] == "2026-03-15"
            assert df.iloc[0]["likes"] == 42
            assert df.iloc[0]["reach"] == 0
            assert df.iloc[0]["brand"] == "TestBrand"
        os.unlink(f.name)

    def test_file_not_found(self):
        with pytest.raises(FileNotFoundError):
            process("/nonexistent/path.csv", "TestBrand")
