"""Test script to verify the SEC EDGAR data pipeline without the AI layer.

Usage:
    cd backend
    python test_backend.py AAPL
    python test_backend.py TSLA

This prints the raw parsed filing sections to the console so you can verify
the data pipeline (EDGAR fetch + HTML parsing + section splitting) before
touching the AI layer.
"""

import logging
import sys
from pprint import pprint

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("test_backend")


def print_divider(title: str) -> None:
    """Print a formatted section divider.

    Args:
        title: Title to display in the divider.
    """
    width = 80
    print("\n" + "=" * width)
    print(f"  {title}")
    print("=" * width)


def test_cik_resolution(ticker: str) -> dict:
    """Test step 1: resolve ticker to CIK and filing metadata.

    Args:
        ticker: Stock ticker symbol.

    Returns:
        Filing info dict from edgar.client.get_filing_info.
    """
    print_divider(f"STEP 1: Resolving CIK and Filing Info for {ticker}")
    from edgar.client import get_filing_info
    filing_info = get_filing_info(ticker)
    pprint(filing_info)
    return filing_info


def test_parsing(filing_info: dict) -> dict:
    """Test step 2: download and parse the filing into sections.

    Args:
        filing_info: Dict from edgar.client.get_filing_info.

    Returns:
        Dict of section label -> text.
    """
    ticker = filing_info["ticker"]
    print_divider(f"STEP 2: Downloading and Parsing 10-K for {ticker}")

    from utils.cache import get_cached_sections, save_sections_cache
    cached = get_cached_sections(ticker)
    if cached:
        print(f"  [CACHE HIT] Loaded {len(cached)} sections from cache")
        sections = cached
    else:
        from edgar.parser import download_and_parse_filing
        sections = download_and_parse_filing(filing_info["filing_url"], ticker)
        save_sections_cache(ticker, sections)
        print(f"  [DOWNLOADED] Parsed {len(sections)} sections; saved to cache")

    return sections


def print_section_summaries(sections: dict) -> None:
    """Print a summary table of all parsed sections.

    Args:
        sections: Dict of section label -> text.
    """
    print_divider("SECTION SUMMARY")
    print(f"  {'SECTION':<15} {'CHARACTERS':>12} {'WORDS':>10} {'PREVIEW'}")
    print("  " + "-" * 75)
    for name, text in sorted(sections.items()):
        words = len(text.split())
        preview = text[:60].replace("\n", " ").strip()
        print(f"  {name:<15} {len(text):>12,} {words:>10,}   {preview}...")


def print_section_detail(sections: dict, section_name: str, max_chars: int = 2000) -> None:
    """Print detailed text for a specific section.

    Args:
        sections: Dict of section label -> text.
        section_name: Section key to print (e.g. 'ITEM_1A').
        max_chars: Maximum characters to print.
    """
    print_divider(f"SECTION DETAIL: {section_name}")
    text = sections.get(section_name, "[NOT FOUND]")
    print(text[:max_chars])
    if len(text) > max_chars:
        print(f"\n  ... [truncated — {len(text):,} total characters]")


def test_chunking(sections: dict, filing_info: dict) -> None:
    """Test step 3: chunk the sections and report chunk statistics.

    Args:
        sections: Dict of section label -> text.
        filing_info: Filing metadata dict.
    """
    print_divider("STEP 3: Chunking Sections")
    from analysis.embedder import chunk_sections
    chunks = chunk_sections(
        sections=sections,
        ticker=filing_info["ticker"],
        filing_type=filing_info["filing_type"],
        fiscal_year=filing_info["filing_date"][:4],
    )
    print(f"  Total chunks created: {len(chunks)}")
    chunk_by_section: dict[str, int] = {}
    for c in chunks:
        chunk_by_section[c["section"]] = chunk_by_section.get(c["section"], 0) + 1
    print("  Chunks per section:")
    for section, count in sorted(chunk_by_section.items()):
        print(f"    {section:<15}: {count} chunks")
    print("\n  Sample chunk (first chunk of ITEM_1A or ITEM_1):")
    target = next(
        (c for c in chunks if c["section"] in ("ITEM_1A", "ITEM_1")),
        chunks[0] if chunks else None,
    )
    if target:
        print(f"    Section: {target['section']}")
        print(f"    Chunk index: {target['chunk_index']}")
        print(f"    Text preview: {target['text'][:300]}...")


def main() -> None:
    """Run the full data pipeline test and print results to console."""
    if len(sys.argv) < 2:
        print("Usage: python test_backend.py <TICKER>")
        print("Example: python test_backend.py AAPL")
        sys.exit(1)

    ticker = sys.argv[1].strip().upper()
    print(f"\n{'#' * 80}")
    print(f"  M&A Due Diligence — Data Pipeline Test")
    print(f"  Ticker: {ticker}")
    print(f"{'#' * 80}")

    try:
        filing_info = test_cik_resolution(ticker)
    except (ValueError, RuntimeError) as e:
        print(f"\n[ERROR] CIK resolution failed: {e}")
        sys.exit(1)

    try:
        sections = test_parsing(filing_info)
    except Exception as e:
        print(f"\n[ERROR] Filing parsing failed: {e}")
        sys.exit(1)

    print_section_summaries(sections)

    # Print detail for the most important sections
    for key_section in ["ITEM_1", "ITEM_1A", "ITEM_7"]:
        if key_section in sections:
            print_section_detail(sections, key_section, max_chars=1500)

    test_chunking(sections, filing_info)

    print("\n" + "=" * 80)
    print("  ✅ Data pipeline test PASSED — ready for AI layer")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    main()
