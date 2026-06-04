import { Search, Sparkles, ExternalLink, Info } from 'lucide-react';
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
    <aside className="w-[280px] min-h-screen glass-dark flex flex-col">
      {/* Brand */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-[15px] leading-tight tracking-tight">Due Diligence</h1>
            <p className="text-slate-500 text-[10px] font-medium tracking-widest uppercase">AI Assistant</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 pb-6">
        <label className="block text-slate-500 text-[10px] font-semibold uppercase tracking-[0.15em] mb-2.5">
          Enter Ticker
        </label>
        <div className="relative">
          <input
            type="text"
            value={ticker}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={handleKey}
            placeholder="AAPL"
            maxLength={10}
            className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm font-medium focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.08] transition-all duration-200"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
        </div>
        <button
          onClick={() => onGenerate()}
          disabled={isLoading || !ticker.trim()}
          className="mt-3 w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-violet-500/20"
        >
          {isLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-white/80">Analyzing...</span>
            </>
          ) : (
            'Analyze'
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-white/[0.06]" />

      {/* Filing Metadata */}
      {metadata && (
        <div className="px-6 py-5 animate-fade-in">
          <h2 className="text-slate-500 text-[10px] font-semibold uppercase tracking-[0.15em] mb-3">Filing Details</h2>
          <div className="space-y-2.5">
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
            className="mt-4 flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-xs font-medium transition-colors duration-200"
          >
            <ExternalLink className="w-3 h-3" />
            View on SEC EDGAR
          </a>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Disclaimer */}
      <div className="px-6 py-5">
        <div className="flex gap-2.5">
          <Info className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Research purposes only. Not financial or legal advice.
          </p>
        </div>
      </div>
    </aside>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-600 text-[11px] flex-shrink-0">{label}</span>
      <span className="text-slate-300 text-[11px] font-medium text-right truncate">{value}</span>
    </div>
  );
}
