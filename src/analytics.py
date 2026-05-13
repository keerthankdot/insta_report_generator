"""Analytics helpers for ReportEngine.

Period splitting, WoW/MoM delta calculations, and goals vs actuals.
"""

import logging
from datetime import timedelta
from typing import Optional

import pandas as pd

logger = logging.getLogger(__name__)


def split_by_period(
    df: pd.DataFrame,
    report_type: str = "weekly",
    date_col: str = "date",
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Split a DataFrame into current and prior period.

    For weekly: current = most recent 7 days, prior = 7 days before that.
    For monthly: current = most recent 30 days, prior = 30 days before that.

    Args:
        df: DataFrame with a date column.
        report_type: "weekly" or "monthly".
        date_col: Name of the date column (YYYY-MM-DD strings).

    Returns:
        Tuple of (current_df, prior_df). prior_df may be empty if not enough data.
    """
    if df is None or len(df) == 0:
        empty = pd.DataFrame(columns=df.columns if df is not None else [])
        return empty, empty

    dates = pd.to_datetime(df[date_col])
    max_date = dates.max()
    window = 7 if report_type == "weekly" else 30

    current_start = max_date - timedelta(days=window - 1)
    prior_end = current_start - timedelta(days=1)
    prior_start = prior_end - timedelta(days=window - 1)

    current_df = df[dates >= current_start].copy()
    prior_df = df[(dates >= prior_start) & (dates <= prior_end)].copy()

    logger.debug(
        "Split: current=%d rows (%s to %s), prior=%d rows (%s to %s)",
        len(current_df), current_start.date(), max_date.date(),
        len(prior_df), prior_start.date(), prior_end.date(),
    )
    return current_df, prior_df


def compute_deltas(
    ig_current: Optional[pd.DataFrame],
    ig_prior: Optional[pd.DataFrame],
    x_current: Optional[pd.DataFrame],
    x_prior: Optional[pd.DataFrame],
) -> dict:
    """Compute WoW or MoM deltas for key metrics.

    Args:
        ig_current: Current-period IG DataFrame.
        ig_prior: Prior-period IG DataFrame.
        x_current: Current-period X DataFrame.
        x_prior: Prior-period X DataFrame.

    Returns:
        Dict with keys like "ig_reach", "ig_engagement_rate", "ig_posts",
        "x_impressions", "x_engagement_rate", "x_posts". Each value is a dict:
        {current, prior, delta_pct, direction}.
    """
    results = {}

    def _delta(current_val: float, prior_val: float) -> dict:
        if prior_val == 0:
            return {"current": current_val, "prior": prior_val, "delta_pct": None, "direction": "flat"}
        pct = round(((current_val - prior_val) / prior_val) * 100, 1)
        direction = "up" if pct > 0 else "down" if pct < 0 else "flat"
        return {"current": current_val, "prior": prior_val, "delta_pct": pct, "direction": direction}

    if ig_current is not None and len(ig_current) > 0:
        ig_prior_safe = ig_prior if ig_prior is not None and len(ig_prior) > 0 else None
        results["ig_posts"] = _delta(
            len(ig_current),
            len(ig_prior_safe) if ig_prior_safe is not None else 0,
        )
        results["ig_reach"] = _delta(
            int(ig_current["reach"].sum()),
            int(ig_prior_safe["reach"].sum()) if ig_prior_safe is not None else 0,
        )
        results["ig_engagement_rate"] = _delta(
            round(ig_current["engagement_rate"].mean(), 2),
            round(ig_prior_safe["engagement_rate"].mean(), 2) if ig_prior_safe is not None else 0,
        )

    if x_current is not None and len(x_current) > 0:
        x_prior_safe = x_prior if x_prior is not None and len(x_prior) > 0 else None
        results["x_posts"] = _delta(
            len(x_current),
            len(x_prior_safe) if x_prior_safe is not None else 0,
        )
        results["x_impressions"] = _delta(
            int(x_current["impressions"].sum()),
            int(x_prior_safe["impressions"].sum()) if x_prior_safe is not None else 0,
        )
        results["x_engagement_rate"] = _delta(
            round(x_current["engagement_rate"].mean(), 2),
            round(x_prior_safe["engagement_rate"].mean(), 2) if x_prior_safe is not None else 0,
        )

    return results


def compute_goals_actuals(
    ig_df: Optional[pd.DataFrame],
    x_df: Optional[pd.DataFrame],
    goals: dict,
    report_type: str = "weekly",
) -> dict:
    """Compare actual metrics against configured goals.

    Args:
        ig_df: Processed IG DataFrame for the period.
        x_df: Processed X DataFrame for the period.
        goals: Goals dict from brands.json (keys: weekly_posts, weekly_reach,
            monthly_posts, monthly_reach, engagement_rate).
        report_type: "weekly" or "monthly" — selects the right goal keys.

    Returns:
        Dict of {goal_key: {actual, goal, pct, met}}. Only includes metrics
        where a goal is configured.
    """
    prefix = report_type  # "weekly" or "monthly"
    results = {}

    def _check(actual: float, goal_key: str, label: str) -> None:
        goal_val = goals.get(goal_key)
        if goal_val and goal_val > 0:
            pct = round((actual / goal_val) * 100, 1)
            results[label] = {
                "actual": actual,
                "goal": goal_val,
                "pct": pct,
                "met": actual >= goal_val,
            }

    total_posts = 0
    total_reach = 0
    eng_rates = []

    if ig_df is not None and len(ig_df) > 0:
        total_posts += len(ig_df)
        total_reach += int(ig_df["reach"].sum())
        eng_rates.append(ig_df["engagement_rate"].mean())
    if x_df is not None and len(x_df) > 0:
        total_posts += len(x_df)
        eng_rates.append(x_df["engagement_rate"].mean())

    avg_eng = round(sum(eng_rates) / len(eng_rates), 2) if eng_rates else 0

    _check(total_posts, f"{prefix}_posts", "Posts Published")
    _check(total_reach, f"{prefix}_reach", "Total Reach")
    _check(avg_eng, "engagement_rate", "Avg Engagement Rate")

    return results


def compute_health_score(
    ig_df: Optional[pd.DataFrame],
    x_df: Optional[pd.DataFrame],
    goals: dict,
    am_notes: Optional[dict],
    report_type: str = "weekly",
) -> dict:
    """Compute a 0-100 client health score from four weighted signals.

    Weights:
        Campaign Performance (35%): avg engagement rate vs benchmark.
        Delivery (25%): posts published vs goal.
        Sentiment (25%): AM-provided sentiment flag.
        Account Stability (15%): placeholder 75 until payment data integrated.

    Args:
        ig_df: IG DataFrame for the period.
        x_df: X DataFrame for the period.
        goals: Brand goals dict from brands.json.
        am_notes: AM qualitative inputs dict; uses "sentiment" key.
        report_type: "weekly" or "monthly" for goal key selection.

    Returns:
        Dict with keys: score (int), band (str), color (hex str),
        breakdown (dict of component scores).
    """
    # Campaign Performance
    eng_rates = []
    if ig_df is not None and len(ig_df) > 0:
        eng_rates.append(ig_df["engagement_rate"].mean())
    if x_df is not None and len(x_df) > 0:
        eng_rates.append(x_df["engagement_rate"].mean())
    avg_eng = sum(eng_rates) / len(eng_rates) if eng_rates else 0

    if avg_eng >= 6:
        campaign = 100
    elif avg_eng >= 4:
        campaign = 80
    elif avg_eng >= 2:
        campaign = 55
    elif avg_eng >= 1:
        campaign = 35
    else:
        campaign = 15

    # Delivery
    total_posts = 0
    if ig_df is not None:
        total_posts += len(ig_df)
    if x_df is not None:
        total_posts += len(x_df)
    goal_posts = goals.get(f"{report_type}_posts", 0)

    if goal_posts > 0:
        delivery_ratio = total_posts / goal_posts
        if delivery_ratio >= 1.0:
            delivery = 100
        elif delivery_ratio >= 0.8:
            delivery = 80
        elif delivery_ratio >= 0.6:
            delivery = 55
        elif delivery_ratio >= 0.4:
            delivery = 35
        else:
            delivery = 15
    else:
        delivery = 75

    # Sentiment
    sentiment_map = {"Positive": 100, "Neutral": 65, "Negative": 30, "At Risk": 0}
    sentiment_label = (am_notes or {}).get("sentiment", "")
    sentiment = sentiment_map.get(sentiment_label, 75)

    # Account Stability (placeholder)
    stability = 75

    score = round(0.35 * campaign + 0.25 * delivery + 0.25 * sentiment + 0.15 * stability)

    if score >= 81:
        band, color = "Thriving", "#27AE60"
    elif score >= 61:
        band, color = "Healthy", "#3498DB"
    elif score >= 41:
        band, color = "At Risk", "#E67E22"
    else:
        band, color = "Critical", "#E74C3C"

    return {
        "score": score,
        "band": band,
        "color": color,
        "breakdown": {
            "campaign": campaign,
            "delivery": delivery,
            "sentiment": sentiment,
            "stability": stability,
        },
    }
