"""Google Sheets writer for ReportEngine.

Handles authentication, tab management, data writing (overwrite/append),
header formatting, and metadata updates for the Google Sheet data layer.
"""

import logging
import time
from datetime import datetime
from typing import Any, Callable, List, Optional, Tuple

import gspread
import pandas as pd
from google.oauth2.service_account import Credentials

logger = logging.getLogger(__name__)

SCOPES = [
    "https://spreadsheets.google.com/feeds",
    "https://www.googleapis.com/auth/drive",
]


class SheetsWriter:
    """Writes normalized DataFrames to a structured Google Sheet.

    Authenticates via a Google Cloud service account and provides methods
    to write DataFrames to specific tabs in overwrite or append mode,
    with automatic tab creation, header formatting, and rate limit handling.
    """

    def __init__(self, credentials_path: str, sheet_id: str) -> None:
        """Initialize SheetsWriter with Google Sheets authentication.

        Args:
            credentials_path: Path to the service account JSON credentials file.
            sheet_id: Google Sheet ID to open.

        Raises:
            FileNotFoundError: If credentials file does not exist.
            gspread.exceptions.SpreadsheetNotFound: If spreadsheet ID is invalid
                or not shared with the service account.
            Exception: If authentication fails for any other reason.
        """
        try:
            creds = Credentials.from_service_account_file(
                credentials_path, scopes=SCOPES
            )
            client = gspread.authorize(creds)
            logger.info("Authenticated with Google Sheets API")
        except FileNotFoundError:
            logger.error(
                "Credentials file not found: %s. "
                "See README.md for service account setup instructions.",
                credentials_path,
            )
            raise
        except Exception as e:
            logger.error(
                "Google Sheets authentication failed: %s. "
                "See README.md for service account setup instructions.",
                e,
            )
            raise

        try:
            self.spreadsheet = client.open_by_key(sheet_id)
            logger.info("Opened spreadsheet: %s", self.spreadsheet.title)
        except gspread.exceptions.SpreadsheetNotFound:
            logger.error(
                "Spreadsheet not found with ID: %s. "
                "Verify the Sheet ID and ensure it is shared with the service account email.",
                sheet_id,
            )
            raise

    def write(self, df: pd.DataFrame, tab_name: str, mode: str = "overwrite") -> None:
        """Write a DataFrame to a Google Sheet tab.

        Args:
            df: DataFrame to write. Must have column headers.
            tab_name: Name of the worksheet tab to write to.
                Created automatically if it does not exist.
            mode: Write mode. "overwrite" clears and rewrites the entire tab.
                "append" adds new rows below existing data, de-duplicating
                by post_id if that column exists.
        """
        worksheet = self._get_or_create_tab(tab_name)
        headers = list(df.columns)

        # Convert DataFrame to native Python types for gspread serialization
        clean_df = df.fillna("").copy()
        for col in clean_df.columns:
            clean_df[col] = clean_df[col].apply(_to_native)

        if len(clean_df) == 0:
            logger.warning("No data rows to write for %s", tab_name)
            self._retry_with_backoff(
                lambda: worksheet.update([headers], value_input_option="RAW")
            )
            self._format_headers(worksheet)
            return

        if mode == "overwrite":
            self._retry_with_backoff(lambda: worksheet.clear())
            data = [headers] + clean_df.values.tolist()
            self._retry_with_backoff(
                lambda: worksheet.update(data, value_input_option="RAW")
            )
            logger.info("%s: wrote %d rows (overwrite)", tab_name, len(clean_df))

        elif mode == "append":
            existing = self._retry_with_backoff(lambda: worksheet.get_all_values())

            if not existing:
                # Sheet is empty, write headers + data
                data = [headers] + clean_df.values.tolist()
                self._retry_with_backoff(
                    lambda: worksheet.update(data, value_input_option="RAW")
                )
                logger.info("%s: wrote %d rows (append to empty)", tab_name, len(clean_df))
            else:
                # De-duplicate by post_id if column exists
                if "post_id" in headers:
                    existing_headers = existing[0]
                    if "post_id" in existing_headers:
                        pid_idx = existing_headers.index("post_id")
                        existing_ids = {row[pid_idx] for row in existing[1:] if len(row) > pid_idx}
                        before_count = len(clean_df)
                        clean_df = clean_df[~clean_df["post_id"].astype(str).isin(existing_ids)]
                        dupes = before_count - len(clean_df)
                        if dupes > 0:
                            logger.info("%s: skipped %d duplicate rows", tab_name, dupes)

                if len(clean_df) == 0:
                    logger.info("%s: no new rows to append after de-duplication", tab_name)
                else:
                    rows = clean_df.values.tolist()
                    next_row = len(existing) + 1
                    cell_range = f"A{next_row}"
                    self._retry_with_backoff(
                        lambda: worksheet.update(rows, cell_range, value_input_option="RAW")
                    )
                    logger.info("%s: appended %d rows", tab_name, len(clean_df))

        self._format_headers(worksheet)

    def update_metadata(self, brands: List[str], date_range: Tuple[str, str]) -> None:
        """Update the Dashboard Meta tab with run metadata.

        Args:
            brands: List of brand names that were processed.
            date_range: Tuple of (start_date, end_date) as YYYY-MM-DD strings.
        """
        worksheet = self._get_or_create_tab("Dashboard Meta")
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        headers = ["Last Updated", "Brands", "Date Range Start", "Date Range End", "Total Brands"]
        values = [timestamp, ", ".join(brands), date_range[0], date_range[1], len(brands)]
        data = [headers, [_to_native(v) for v in values]]

        self._retry_with_backoff(lambda: worksheet.clear())
        self._retry_with_backoff(
            lambda: worksheet.update(data, value_input_option="RAW")
        )
        self._format_headers(worksheet)
        logger.info("Dashboard Meta updated: %s, %d brands", timestamp, len(brands))

    def _get_or_create_tab(self, tab_name: str, rows: int = 1000, cols: int = 20) -> gspread.Worksheet:
        """Get an existing worksheet tab or create it if missing.

        Args:
            tab_name: Title of the worksheet tab.
            rows: Number of rows for new tabs.
            cols: Number of columns for new tabs.

        Returns:
            The gspread Worksheet object.
        """
        try:
            worksheet = self.spreadsheet.worksheet(tab_name)
            logger.debug("Found existing tab: %s", tab_name)
            return worksheet
        except gspread.exceptions.WorksheetNotFound:
            worksheet = self.spreadsheet.add_worksheet(
                title=tab_name, rows=rows, cols=cols
            )
            logger.info("Created new tab: %s", tab_name)
            return worksheet

    def _format_headers(self, worksheet: gspread.Worksheet) -> None:
        """Format the header row: bold, frozen, light gray background.

        Args:
            worksheet: The gspread Worksheet to format.
        """
        try:
            from gspread.utils import rowcol_to_a1

            last_col = worksheet.col_count
            header_range = f"A1:{rowcol_to_a1(1, last_col)}"

            worksheet.format(header_range, {
                "textFormat": {"bold": True},
                "backgroundColor": {
                    "red": 0.95,
                    "green": 0.95,
                    "blue": 0.95,
                },
            })
            worksheet.freeze(rows=1)
            logger.debug("Formatted headers for: %s", worksheet.title)
        except Exception as e:
            logger.warning(
                "Could not format headers for %s: %s. Skipping formatting.",
                worksheet.title,
                e,
            )

    def _retry_with_backoff(self, func: Callable, max_retries: int = 3) -> Any:
        """Execute a function with exponential backoff on rate limit errors.

        Args:
            func: Callable to execute.
            max_retries: Maximum number of retry attempts.

        Returns:
            The return value of func().

        Raises:
            gspread.exceptions.APIError: If all retries are exhausted.
        """
        for attempt in range(max_retries + 1):
            try:
                return func()
            except gspread.exceptions.APIError as e:
                if e.response.status_code == 429 and attempt < max_retries:
                    wait = 2 ** (attempt + 1)
                    logger.warning(
                        "Rate limited (429). Retry %d/%d in %ds...",
                        attempt + 1,
                        max_retries,
                        wait,
                    )
                    time.sleep(wait)
                else:
                    logger.error("Google Sheets API error after %d attempts: %s", attempt + 1, e)
                    raise


def _to_native(value: Any) -> Any:
    """Convert numpy/pandas types to native Python types for gspread.

    Args:
        value: Value to convert.

    Returns:
        Native Python int, float, str, or the original value.
    """
    if pd.isna(value):
        return ""
    if hasattr(value, "item"):
        return value.item()
    return value
