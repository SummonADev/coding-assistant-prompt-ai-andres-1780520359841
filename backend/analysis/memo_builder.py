"""Assemble all Claude-generated sections into the final memo response dict."""

import logging
from typing import Any

from chromadb import Collection

from analysis.analyzer import (
    analyze_financial_health,
    analyze_risk_factors,
    analyze_red_flags,
    analyze_competitive_position,
    analyze_executive_summary,
    determine_deal_signal,
)

logger = logging.getLogger(__name__)


def build_memo(
    collection: Collection,
    filing_info: dict[str, str],
) -> dict[str, Any]:
    """Orchestrate all Claude analysis calls and assemble the final response dict.

    Calls each analyzer in sequence, then assembles the response matching
    the exact JSON schema expected by the React frontend.

    Args:
        collection: Populated ChromaDB collection for the filing.
        filing_info: Dict from edgar.client.get_filing_info with company metadata.

    Returns:
        Dict with 'metadata' and 'memo' keys matching the frontend schema.
    """
    ticker = filing_info["ticker"]
    company_name = filing_info["company_name"]
    fiscal_year = filing_info["filing_date"][:4]

    logger.info("[%s] Analyzing financial health...", ticker)
    financial_health = analyze_financial_health(
        collection=collection,
        company_name=company_name,
        ticker=ticker,
        fiscal_year=fiscal_year,
    )

    logger.info("[%s] Analyzing risk factors...", ticker)
    risk_factors = analyze_risk_factors(
        collection=collection,
        company_name=company_name,
        ticker=ticker,
    )

    logger.info("[%s] Scanning for red flags...", ticker)
    red_flags = analyze_red_flags(
        collection=collection,
        company_name=company_name,
        ticker=ticker,
    )

    logger.info("[%s] Analyzing competitive position...", ticker)
    competitive_position = analyze_competitive_position(
        collection=collection,
        company_name=company_name,
        ticker=ticker,
    )

    logger.info("[%s] Determining deal signal...", ticker)
    deal_signal = determine_deal_signal(
        collection=collection,
        company_name=company_name,
        ticker=ticker,
        financial_health=financial_health,
        risk_factors=risk_factors,
        red_flags=red_flags,
    )

    logger.info("[%s] Writing executive summary...", ticker)
    executive_summary = analyze_executive_summary(
        company_name=company_name,
        ticker=ticker,
        financial_health=financial_health,
        risk_factors=risk_factors,
        red_flags=red_flags,
        competitive_position=competitive_position,
        deal_signal=deal_signal,
    )

    metadata = {
        "companyName": company_name,
        "ticker": ticker,
        "cik": filing_info["cik"],
        "filingDate": filing_info["filing_date"],
        "fiscalYearEnd": filing_info["filing_date"],
        "filingType": filing_info["filing_type"],
        "secUrl": filing_info["sec_url"],
    }

    memo = {
        "dealSignal": deal_signal,
        "executiveSummary": executive_summary,
        "financialHealth": financial_health,
        "riskFactors": risk_factors,
        "redFlags": red_flags,
        "competitivePosition": competitive_position,
    }

    return {"metadata": metadata, "memo": memo}
