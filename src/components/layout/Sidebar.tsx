import { Search, TrendingUp, ExternalLink, AlertCircle } from 'lucide-react';
import type { FilingMetadata } from '@/types';
import { formatDate } from '@/lib/utils';

type SidebarProps = {
  ticker: string;
  setTicker: (v: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  metadata: FilingMetadata | null;
};

export default function Sidebar({ ticker, setTicker, onGenerate, isLoading, metadata }: SidebarProps) {
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onGenerate();
  };

  return (
    <aside className="w-72 min-h-screen bg-navy flex flex-col shadow-xl">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-6 h-6 text-gold" />
          <h1 className="text-white font-bold text-lg leading-tight">M&A Due Diligence AI</h1>
        </div>
        <p className="text-blue-200 text-xs mt-1">Powered by Claude + SEC EDGAR</p>
      </div>

      {/* Search */}
      <div className="px-6 py-6 border-b border-white/10">
        <label className="block text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2">
          Stock Ticker
        </label>
        <div className="relative">
          <input
            type="text"
            value={ticker}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={handleKey}
            placeholder="e.g. AAPL"
            maxLength={10}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-blue-300/60 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/60" />
        </div>
        <button
          onClick={() => onGenerate()}
          disabled={isLoading || !ticker.trim()}
          className="mt-3 w-full bg-gold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-navy font-bold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            'Generate Report'
          )}
        </button>
      </div>

      {/* Filing Metadata */}
      {metadata && (
        <div className="px-6 py-5 border-b border-white/10">
          <h2 className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-3">Filing Info</h2>
          <div className="space-y-2">
            <MetaRow label="Company" value={metadata.companyName} />
            <MetaRow label="CIK" value={metadata.cik} />
            <MetaRow label="Filing" value={metadata.filingType} />
            <MetaRow label="Filed" value={formatDate(metadata.filingDate)} />
            <MetaRow label="FY End" value={metadata.fiscalYearEnd} />
          </div>
          <a
            href={metadata.secUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-1.5 text-blue-300 hover:text-gold text-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View on SEC EDGAR
          </a>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Disclaimer */}
      <div className="px-6 py-5 border-t border-white/10">
        <div className="flex gap-2">
          <AlertCircle className="w-4 h-4 text-blue-300/70 flex-shrink-0 mt-0.5" />
          <p className="text-blue-300/70 text-xs leading-relaxed">
            This tool is for research purposes only and does not constitute financial or legal advice.
          </p>
        </div>
      </div>
    </aside>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-blue-300/70 text-xs flex-shrink-0">{label}</span>
      <span className="text-white text-xs font-medium text-right truncate">{value}</span>
    </div>
  );
}
