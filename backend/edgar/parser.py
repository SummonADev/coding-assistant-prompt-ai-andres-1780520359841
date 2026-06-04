"""Download and parse SEC 10-K filings into clean section text."""

import logging
import re
import time
from typing import Optional

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "MandADueDiligenceTool contact@example.com",
    "Accept-Encoding": "gzip, deflate",
}
REQUEST_DELAY = 0.11

# SEC item headers we care about (ordered by importance for analysis)
SECTION_PATTERNS: list[tuple[str, str]] = [
    ("ITEM_1", r"item\s+1[^a-z0-9]"),
    ("ITEM_1A", r"item\s+1a[^a-z0-9]"),
    ("ITEM_1B", r"item\s+1b[^a-z0-9]"),
    ("ITEM_2", r"item\s+2[^a-z0-9]"),
    ("ITEM_3", r"item\s+3[^a-z0-9]"),
    ("ITEM_4", r"item\s+4[^a-z0-9]"),
    ("ITEM_5", r"item\s+5[^a-z0-9]"),
    ("ITEM_6", r"item\s+6[^a-z0-9]"),
    ("ITEM_7", r"item\s+7[^a-z0-9]"),
    ("ITEM_7A", r"item\s+7a[^a-z0-9]"),
    ("ITEM_8", r"item\s+8[^a-z0-9]"),
    ("ITEM_9", r"item\s+9[^a-z0-9]"),
    ("ITEM_9A", r"item\s+9a[^a-z0-9]"),
    ("ITEM_10", r"item\s+10[^a-z0-9]"),
    ("ITEM_11", r"item\s+11[^a-z0-9]"),
    ("ITEM_12", r"item\s+12[^a-z0-9]"),
]

# Sections most relevant to M&A analysis
KEY_SECTIONS = {"ITEM_1", "ITEM_1A", "ITEM_7", "ITEM_7A", "ITEM_8"}


def _fetch_url(url: str) -> bytes:
    """Fetch raw bytes from a URL with rate limiting.

    Args:
        url: URL to fetch.

    Returns:
        Response content as bytes.

    Raises:
        RuntimeError: On rate limit (429).
        ValueError: On not found (404).
    """
    time.sleep(REQUEST_DELAY)
    resp = requests.get(url, headers=HEADERS, timeout=60)
    if resp.status_code == 429:
        raise RuntimeError("SEC EDGAR rate limit. Please retry in a moment.")
    if resp.status_code == 404:
        raise ValueError(f"Filing document not found: {url}")
    resp.raise_for_status()
    return resp.content


def _html_to_text(content: bytes) -> str:
    """Convert HTML bytes to clean plain text.

    Args:
        content: Raw HTML bytes.

    Returns:
        Cleaned plain text string.
    """
    soup = BeautifulSoup(content, "lxml")

    # Remove script, style, and hidden elements
    for tag in soup(["script", "style", "meta", "link"]):
        tag.decompose()

    text = soup.get_text(separator="\n")
    # Collapse excessive whitespace
    lines = [line.strip() for line in text.splitlines()]
    lines = [line for line in lines if line]
    return "\n".join(lines)


def _try_pdf_fallback(url: str) -> Optional[str]:
    """Attempt to parse a PDF version of the filing as fallback.

    Args:
        url: URL of the PDF filing.

    Returns:
        Extracted text or None on failure.
    """
    try:
        import pdfplumber
        import io

        content = _fetch_url(url)
        pages: list[str] = []
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages[:150]:  # limit to first 150 pages
                page_text = page.extract_text()
                if page_text:
                    pages.append(page_text)
        return "\n".join(pages)
    except Exception as exc:
        logger.warning("PDF fallback failed: %s", exc)
        return None


def _split_into_sections(full_text: str) -> dict[str, str]:
    """Split the full filing text into labeled sections by ITEM headers.

    Args:
        full_text: The complete cleaned text of the 10-K.

    Returns:
        Dict mapping section label (e.g. 'ITEM_1A') to its text content.
    """
    # Build a single regex that finds all item headers
    combined_pattern = "|".join(
        f"(?P<{name}>{pattern})" for name, pattern in SECTION_PATTERNS
    )
    flags = re.IGNORECASE | re.MULTILINE

    matches = list(re.finditer(combined_pattern, full_text, flags))
    if not matches:
        logger.warning("No SEC item headers found; returning full text as ITEM_1")
        return {"ITEM_1": full_text}

    sections: dict[str, str] = {}
    for idx, match in enumerate(matches):
        section_name = match.lastgroup or "UNKNOWN"
        start = match.start()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(full_text)
        section_text = full_text[start:end].strip()

        # Keep the longer version if a section appears multiple times (ToC vs body)
        if section_name not in sections or len(section_text) > len(sections[section_name]):
            sections[section_name] = section_text

    return sections


def _clean_section_text(text: str) -> str:
    """Remove noise characters and collapse whitespace in section text.

    Args:
        text: Raw section text.

    Returns:
        Cleaned section text.
    """
    # Remove page number artifacts and common boilerplate
    text = re.sub(r"\b(Table of Contents|INDEX)\b", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\d+\n", "\n", text)  # lone page numbers
    text = re.sub(r"\n{3,}", "\n\n", text)  # excessive blank lines
    text = re.sub(r"[ \t]{2,}", " ", text)  # multiple spaces
    return text.strip()


def download_and_parse_filing(
    filing_url: str,
    ticker: str,
) -> dict[str, str]:
    """Download a 10-K filing and parse it into named sections.

    Tries HTML parsing first, falls back to PDF if the URL ends in .pdf.

    Args:
        filing_url: Direct URL to the 10-K primary document.
        ticker: Stock ticker (used for logging).

    Returns:
        Dict mapping section labels to cleaned text. Always contains at least
        one key. Key sections are: ITEM_1, ITEM_1A, ITEM_7, ITEM_7A, ITEM_8.

    Raises:
        RuntimeError: If both HTML and PDF parsing fail.
    """
    logger.info("Downloading filing for %s from %s", ticker, filing_url)
    
    full_text: Optional[str] = None

    if filing_url.lower().endswith(".pdf"):
        full_text = _try_pdf_fallback(filing_url)
    else:
        try:
            content = _fetch_url(filing_url)
            full_text = _html_to_text(content)
        except Exception as exc:
            logger.warning("HTML parse failed for %s: %s", ticker, exc)
            if filing_url.lower().endswith((".htm", ".html")):
                pdf_url = re.sub(r"\.htm[l]?$", ".pdf", filing_url, flags=re.IGNORECASE)
                full_text = _try_pdf_fallback(pdf_url)

    if not full_text:
        raise RuntimeError(
            f"Failed to extract text from filing for {ticker}. "
            "The document may be in an unsupported format."
        )

    logger.info(
        "Extracted %d characters of text for %s", len(full_text), ticker
    )

    sections = _split_into_sections(full_text)

    # Clean each section
    cleaned: dict[str, str] = {}
    for name, text in sections.items():
        cleaned_text = _clean_section_text(text)
        if len(cleaned_text) > 200:  # skip near-empty sections
            cleaned[name] = cleaned_text

    logger.info(
        "Parsed %d sections for %s: %s",
        len(cleaned),
        ticker,
        list(cleaned.keys()),
    )
    return cleaned
