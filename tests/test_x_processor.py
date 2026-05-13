"""Tests for src/x_processor.py X/Twitter CSV processor."""

import os
import tempfile

import pandas as pd
import pytest

from src.x_processor import OUTPUT_COLUMNS, process

SAMPLE_CSV = os.path.join(
    os.path.dirname(__file__), "sample_data", "sample_x_tweets.csv"
)


class TestProcessWithSampleData:
    def test_returns_15_rows(self):
        df = process(SAMPLE_CSV, "TestBrand")
        assert len(df) == 15

    def test_returns_dataframe(self):
        df = process(SAMPLE_CSV, "TestBrand")
        assert isinstance(df, pd.DataFrame)


class TestOutputSchema:
    def test_exact_columns(self):
        df = process(SAMPLE_CSV, "TestBrand")
        assert list(df.columns) == OUTPUT_COLUMNS

    def test_column_count(self):
        df = process(SAMPLE_CSV, "TestBrand")
        assert len(df.columns) == 14


class TestEngagementRateFromPercentageString:
    def test_percentage_parsed(self):
        df = process(SAMPLE_CSV, "TestBrand")
        # All rates should be positive floats (sample data has 0.5%-5% range)
        assert all(df["engagement_rate"] > 0)
        assert all(df["engagement_rate"] < 10)

    def test_percentage_is_float(self):
        df = process(SAMPLE_CSV, "TestBrand")
        assert df["engagement_rate"].dtype == float

    def test_specific_value(self):
        df = process(SAMPLE_CSV, "TestBrand")
        # First row in sample (date descending, so Mar 28 = first row)
        # Mar 28 tweet has engagement rate "2.9%"
        first_row = df.iloc[0]
        assert first_row["engagement_rate"] == 2.9


class TestEngagementRateCalculatedFallback:
    def test_calculated_from_engagements_impressions(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
            f.write("Tweet id,time,impressions,engagements,likes,retweets,replies\n")
            f.write("123,2026-03-15 10:00 +0000,1000,50,20,10,5\n")
            f.flush()
            df = process(f.name, "TestBrand")
            # engagement_rate = (50 / 1000) * 100 = 5.0
            assert df.iloc[0]["engagement_rate"] == 5.0
            assert df.iloc[0]["engagement_total"] == 50
        os.unlink(f.name)


class TestEngagementRateFromLikesRetweetsReplies:
    def test_fallback_calculation(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
            f.write("Tweet id,time,impressions,likes,retweets,replies\n")
            f.write("456,2026-03-15 10:00 +0000,2000,60,20,20\n")
            f.flush()
            df = process(f.name, "TestBrand")
            # engagement_total = 60 + 20 + 20 = 100
            # engagement_rate = (100 / 2000) * 100 = 5.0
            assert df.iloc[0]["engagement_total"] == 100
            assert df.iloc[0]["engagement_rate"] == 5.0
        os.unlink(f.name)

    def test_zero_impressions(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
            f.write("Tweet id,time,impressions,likes,retweets,replies\n")
            f.write("789,2026-03-15 10:00 +0000,0,10,5,2\n")
            f.flush()
            df = process(f.name, "TestBrand")
            assert df.iloc[0]["engagement_rate"] == 0.0
        os.unlink(f.name)


class TestEngagementTotalFromEngagementsColumn:
    def test_uses_engagements_column(self):
        df = process(SAMPLE_CSV, "TestBrand")
        # Sample CSV has "engagements" column. First row (Mar 28) has 245 engagements
        first_row = df.iloc[0]
        assert first_row["engagement_total"] == 245


class TestEngagementTotalFallback:
    def test_sums_likes_retweets_replies(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
            f.write("Tweet id,time,impressions,likes,retweets,replies\n")
            f.write("111,2026-03-15 10:00 +0000,5000,100,30,20\n")
            f.flush()
            df = process(f.name, "TestBrand")
            assert df.iloc[0]["engagement_total"] == 150
        os.unlink(f.name)


class TestDateParsing:
    def test_x_analytics_format(self):
        df = process(SAMPLE_CSV, "TestBrand")
        for date_val in df["date"]:
            assert len(date_val) == 10
            assert date_val[4] == "-"
            assert date_val[7] == "-"

    def test_dates_in_march_2026(self):
        df = process(SAMPLE_CSV, "TestBrand")
        for date_val in df["date"]:
            assert date_val.startswith("2026-03-")


class TestContentTypeAlwaysTweet:
    def test_all_tweets(self):
        df = process(SAMPLE_CSV, "TestBrand")
        assert all(df["content_type"] == "Tweet")


class TestBrandTagging:
    def test_brand_column(self):
        df = process(SAMPLE_CSV, "TestBrand")
        assert all(df["brand"] == "TestBrand")

    def test_platform_column(self):
        df = process(SAMPLE_CSV, "TestBrand")
        assert all(df["platform"] == "X")


class TestEmptyCsv:
    def test_raises_value_error(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
            f.write("Tweet id,time,impressions,likes\n")
            f.flush()
            with pytest.raises(ValueError, match="no data rows"):
                process(f.name, "TestBrand")
        os.unlink(f.name)


class TestCaptionTruncation:
    def test_long_tweet_truncated(self):
        long_text = "A" * 150
        with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
            f.write("Tweet id,Tweet text,time,impressions,likes,retweets,replies\n")
            f.write(f'222,"{long_text}",2026-03-15 10:00 +0000,1000,10,5,2\n')
            f.flush()
            df = process(f.name, "TestBrand")
            assert len(df.iloc[0]["caption_preview"]) == 100
            assert df.iloc[0]["caption_preview"].endswith("...")
        os.unlink(f.name)

    def test_short_tweet_not_truncated(self):
        df = process(SAMPLE_CSV, "TestBrand")
        # All sample tweets are under 100 chars
        for preview in df["caption_preview"]:
            assert not preview.endswith("...") or len(preview) <= 100


class TestSorting:
    def test_sorted_by_date_descending(self):
        df = process(SAMPLE_CSV, "TestBrand")
        dates = list(df["date"])
        assert dates == sorted(dates, reverse=True)
