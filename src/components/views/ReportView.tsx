import { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import type { AnalysisResult, DealSignal } from '@/types';
import ExecutiveSummaryCard from '@/components/report/ExecutiveSummaryCard';
import FinancialHealthCard from '@/components/report/FinancialHealthCard';
import RiskFactorsCard from '@/components/report/RiskFactorsCard';
import RedFlagsCard from '@/components/report/RedFlagsCard';
import CompetitivePositionCard from '@/components/report/CompetitivePositionCard';
import { formatDate } from '@/lib/utils';

type ReportViewProps = {
  result: AnalysisResult;
  onReset: () => void;
};

export default function ReportView({ result, onReset }: ReportViewProps) {
  const [downloading, setDownloading] = useState(false);
  const { memo, metadata } = result;

  const handleDownload = () => {
    setDownloading(true);
    // Simulate PDF generation (in production this would call pdf_generator.py via API)
    setTimeout(() => {
      const content = buildTextMemo(result);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${metadata.ticker}_MA_Due_Diligence_${metadata.filingDate}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{metadata.companyName}</h1>
            <span className="px-2.5 py-0.5 bg-navy/10 text-navy text-xs font-bold rounded">{metadata.ticker}</span>
          </div>
          <p className="text-slate-500 text-sm">
            M&A Due Diligence Briefing · {metadata.filingType} filed {formatDate(metadata.filingDate)}
          </p>
        </div>
        <DealSignalBadge signal={memo.dealSignal} />
      </div>

      {/* Executive Summary — full width */}
      <ExecutiveSummaryCard summary={memo.executiveSummary} signal={memo.dealSignal} />

      {/* Four section grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <FinancialHealthCard content={memo.financialHealth} />
        <RiskFactorsCard risks={memo.riskFactors} />
        <RedFlagsCard content={memo.redFlags} />
        <CompetitivePositionCard content={memo.competitivePosition} />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-200">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-dark disabled:opacity-60 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Preparing...' : '📄 Download Memo'}
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          🔄 Analyze Another Company
        </button>
        <p className="ml-auto text-slate-400 text-xs">Source: SEC EDGAR · {metadata.filingType} · {metadata.ticker}</p>
      </div>
    </div>
  );
}

function DealSignalBadge({ signal }: { signal: DealSignal }) {
  const map: Record<DealSignal, { bg: string; text: string; dot: string }> = {
    Favorable: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    Neutral: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    Cautious: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
  };
  const s = map[signal];
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${s.bg} ${s.text}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      {signal}
    </span>
  );
}

function buildTextMemo(result: AnalysisResult): string {
  const { memo, metadata } = result;
  const lines: string[] = [
    'CONFIDENTIAL — For Internal Use Only',
    '='.repeat(60),
    `M&A DUE DILIGENCE BRIEFING`,
    `Company: ${metadata.companyName} (${metadata.ticker})`,
    `Source: SEC EDGAR — ${metadata.filingType} filed ${metadata.filingDate}`,
    `Generated: ${new Date().toLocaleDateString()}`,
    '='.repeat(60),
    '',
    'EXECUTIVE SUMMARY',
    '-'.repeat(40),
    memo.executiveSummary,
    '',
    `Deal Attractiveness: ${memo.dealSignal}`,
    '',
    'FINANCIAL HEALTH',
    '-'.repeat(40),
    memo.financialHealth,
    '',
    'RISK FACTORS',
    '-'.repeat(40),
    ...memo.riskFactors.map((r) => `• ${r.name} [${r.impact}]: ${r.description}`),
    '',
    'RED FLAGS',
    '-'.repeat(40),
    memo.redFlags.join('\n'),
    '',
    'COMPETITIVE POSITION',
    '-'.repeat(40),
    memo.competitivePosition,
  ];
  return lines.join('\n');
}
