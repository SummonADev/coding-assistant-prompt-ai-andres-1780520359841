import { useState } from 'react';
import { Download, RotateCcw } from 'lucide-react';
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
    setTimeout(() => {
      const content = buildTextMemo(result);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${metadata.ticker}_Due_Diligence_${metadata.filingDate}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 animate-fade-in">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{metadata.companyName}</h1>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg">{metadata.ticker}</span>
          </div>
          <p className="text-slate-400 text-sm">
            {metadata.filingType} · Filed {formatDate(metadata.filingDate)}
          </p>
        </div>
        <DealSignalBadge signal={memo.dealSignal} />
      </div>

      {/* Executive Summary */}
      <div className="mb-6 animate-fade-in-up">
        <ExecutiveSummaryCard summary={memo.executiveSummary} signal={memo.dealSignal} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 stagger">
        <div className="animate-fade-in-up"><FinancialHealthCard content={memo.financialHealth} /></div>
        <div className="animate-fade-in-up"><RiskFactorsCard risks={memo.riskFactors} /></div>
        <div className="animate-fade-in-up"><RedFlagsCard content={memo.redFlags} /></div>
        <div className="animate-fade-in-up"><CompetitivePositionCard content={memo.competitivePosition} /></div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-10 pt-6 border-t border-slate-100 animate-fade-in">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-all duration-200 active:scale-[0.98] shadow-sm"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Preparing...' : 'Download Memo'}
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-[0.98]"
        >
          <RotateCcw className="w-4 h-4" />
          New Analysis
        </button>
        <p className="ml-auto text-slate-400 text-xs">SEC EDGAR · {metadata.filingType} · {metadata.ticker}</p>
      </div>
    </div>
  );
}

function DealSignalBadge({ signal }: { signal: DealSignal }) {
  const map: Record<DealSignal, { bg: string; text: string; dot: string }> = {
    Favorable: { bg: 'bg-emerald-50 border-emerald-200/60', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    Neutral: { bg: 'bg-amber-50 border-amber-200/60', text: 'text-amber-700', dot: 'bg-amber-500' },
    Cautious: { bg: 'bg-red-50 border-red-200/60', text: 'text-red-600', dot: 'bg-red-500' },
  };
  const s = map[signal];
  return (
    <span className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      {signal}
    </span>
  );
}

function buildTextMemo(result: AnalysisResult): string {
  const { memo, metadata } = result;
  const lines: string[] = [
    'CONFIDENTIAL — For Internal Use Only',
    '═'.repeat(60),
    `M&A DUE DILIGENCE BRIEFING`,
    `Company: ${metadata.companyName} (${metadata.ticker})`,
    `Source: SEC EDGAR — ${metadata.filingType} filed ${metadata.filingDate}`,
    `Generated: ${new Date().toLocaleDateString()}`,
    '═'.repeat(60),
    '',
    'EXECUTIVE SUMMARY',
    '─'.repeat(40),
    memo.executiveSummary,
    '',
    `Deal Attractiveness: ${memo.dealSignal}`,
    '',
    'FINANCIAL HEALTH',
    '─'.repeat(40),
    memo.financialHealth,
    '',
    'RISK FACTORS',
    '─'.repeat(40),
    ...memo.riskFactors.map((r) => `• ${r.name} [${r.impact}]: ${r.description}`),
    '',
    'RED FLAGS',
    '─'.repeat(40),
    memo.redFlags.join('\n'),
    '',
    'COMPETITIVE POSITION',
    '─'.repeat(40),
    memo.competitivePosition,
  ];
  return lines.join('\n');
}
