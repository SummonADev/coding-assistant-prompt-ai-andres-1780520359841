"""SEC EDGAR client: resolve ticker to CIK and locate the latest 10-K filing URL."""

import logging
import time
from typing import Any

import requests

logger = logging.getLogger(__name__)

EDGAR_BASE = "https://data.sec.gov"
EDGAR_SEARCH = "https://efts.sec.gov/LATEST/search-index"
HEADERS = {
    "User-Agent": "MandADueDiligenceTool contact@example.com",
    "Accept-Encoding": "gzip, deflate",
}
REQUEST_DELAY = 0.11  # seconds between requests


def _get(url: str, **kwargs: Any) -> requests.Response:
    """Make a GET request with rate-limit delay and standard headers.

    Args:
        url: The URL to fetch.
        **kwargs: Additional arguments passed to requests.get.

    Returns:
        The HTTP response.

    Raises:
        RuntimeError: On HTTP 429 (rate limited).
        ValueError: On HTTP 404 (not found).
    """
    time.sleep(REQUEST_DELAY)
    response = requests.get(url, headers=HEADERS, timeout=30, **kwargs)
    if response.status_code == 429:
        raise RuntimeError(
            "SEC EDGAR rate limit reached. Please wait a moment and try again."
        )
    if response.status_code == 404:
        raise ValueError(f"Resource not found at {url}")
    response.raise_for_status()
    return response


def ticker_to_cik(ticker: str) -> str:
    """Resolve a stock ticker to a zero-padded 10-digit CIK.

    Args:
        ticker: The stock ticker symbol (e.g. 'AAPL').

    Returns:
        Zero-padded 10-digit CIK string.

    Raises:
        ValueError: If ticker is not found in the EDGAR company tickers map.
    """
    url = "https://www.sec.gov/files/company_tickers.json"
    resp = _get(url)
    tickers_map: dict[str, Any] = resp.json()

    upper = ticker.upper()
    for entry in tickers_map.values():
        if entry.get("ticker", "").upper() == upper:
            cik_raw: int = entry["cik_str"]
            return str(cik_raw).zfill(10)

    raise ValueError(
        f"Ticker '{ticker}' not found in SEC EDGAR. "
        "Verify the ticker is correct. Foreign filers may use Form 20-F."
    )


def get_company_name(cik: str) -> str:
    """Fetch the official company name from EDGAR for a given CIK.

    Args:
        cik: Zero-padded 10-digit CIK string.

    Returns:
        Company name string.
    """
    url = f"{EDGAR_BASE}/submissions/CIK{cik}.json"
    resp = _get(url)
    data: dict[str, Any] = resp.json()
    return data.get("name", "Unknown Company")


def get_latest_10k_filing(cik: str) -> dict[str, str]:
    """Find the most recent 10-K filing accession number and document URL.

    Args:
        cik: Zero-padded 10-digit CIK string.

    Returns:
        Dict with keys: accession_number, filing_date, filing_type, index_url.

    Raises:
        ValueError: If no 10-K filing is found for this company.
    """
    url = f"{EDGAR_BASE}/submissions/CIK{cik}.json"
    resp = _get(url)
    data: dict[str, Any] = resp.json()

    filings = data.get("filings", {}).get("recent", {})
    forms: list[str] = filings.get("form", [])
    accessions: list[str] = filings.get("accessionNumber", [])
    dates: list[str] = filings.get("filingDate", [])

    for i, form in enumerate(forms):
        if form in ("10-K", "10-K405"):
            accession = accessions[i].replace("-", "")
            accession_dashed = accessions[i]
            filing_date = dates[i]
            index_url = (
                f"https://www.sec.gov/Archives/edgar/data/"
                f"{int(cik)}/{accession}/{accession_dashed}-index.htm"
            )
            return {
                "accession_number": accession_dashed,
                "filing_date": filing_date,
                "filing_type": form,
                "index_url": index_url,
            }

    raise ValueError(
        f"No 10-K filing found for CIK {cik}. "
        "The company may not have filed a 10-K with the SEC."
    )


def get_primary_document_url(cik: str, accession_dashed: str) -> str:
    """Retrieve the URL of the primary HTML or HTM document in a filing.

    Args:
        cik: Zero-padded 10-digit CIK string.
        accession_dashed: Accession number with dashes (e.g. '0000320193-24-000123').

    Returns:
        Full URL to the primary 10-K document.

    Raises:
        ValueError: If no suitable document is found in the filing index.
    """
    accession_nodash = accession_dashed.replace("-", "")
    index_url = (
        f"{EDGAR_BASE}/submissions/CIK{cik}.json"  # already fetched; use filing index JSON
    )
    # Use the EDGAR filing index JSON instead
    filing_index_url = (
        f"https://www.sec.gov/Archives/edgar/data/"
        f"{int(cik)}/{accession_nodash}/{accession_dashed}-index.json"
    )
    time.sleep(REQUEST_DELAY)
    resp = requests.get(filing_index_url, headers=HEADERS, timeout=30)

    if resp.status_code == 200:
        index_data: dict[str, Any] = resp.json()
        documents: list[dict[str, Any]] = index_data.get("documents", [])
        # Prefer the primary 10-K htm document
        for doc in documents:
            doc_type = doc.get("type", "").upper()
            name: str = doc.get("documentUrl", doc.get("name", ""))
            if doc_type in ("10-K", "10-K405") and name.lower().endswith((".htm", ".html")):
                if name.startswith("http"):
                    return name
                return (
                    f"https://www.sec.gov/Archives/edgar/data/"
                    f"{int(cik)}/{accession_nodash}/{name}"
                )

    # Fallback: build URL from accession number
    # Try common naming patterns
    base = f"https://www.sec.gov/Archives/edgar/data/{int(cik)}/{accession_nodash}/"
    for suffix in [
        f"{accession_dashed}.htm",
        "form10-k.htm",
        "10k.htm",
        "annual_report.htm",
    ]:
        candidate = base + suffix
        time.sleep(REQUEST_DELAY)
        head_resp = requests.head(candidate, headers=HEADERS, timeout=15)
        if head_resp.status_code == 200:
            return candidate

    raise ValueError(
        f"Could not locate primary 10-K document for accession {accession_dashed}"
    )


def get_filing_info(ticker: str) -> dict[str, str]:
    """Top-level function: resolve ticker to all filing metadata needed for analysis.

    Args:
        ticker: Stock ticker symbol.

    Returns:
        Dict with keys: ticker, cik, company_name, filing_date, filing_type,
        accession_number, filing_url, sec_url.
    """
    logger.info("Resolving CIK for ticker %s", ticker)
    cik = ticker_to_cik(ticker)
    logger.info("CIK for %s: %s", ticker, cik)

    company_name = get_company_name(cik)
    filing = get_latest_10k_filing(cik)

    logger.info(
        "Found filing: %s dated %s",
        filing["accession_number"],
        filing["filing_date"],
    )

    filing_url = get_primary_document_url(cik, filing["accession_number"])
    logger.info("Primary document URL: %s", filing_url)

    sec_browse_url = (
        f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany"
        f"&CIK={cik}&type=10-K"
    )

    return {
        "ticker": ticker,
        "cik": cik,
        "company_name": company_name,
        "filing_date": filing["filing_date"],
        "filing_type": filing["filing_type"],
        "accession_number": filing["accession_number"],
        "filing_url": filing_url,
        "sec_url": sec_browse_url,
    }
