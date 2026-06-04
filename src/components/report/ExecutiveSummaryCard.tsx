import type { DealSignal } from '@/types';

type ExecutiveSummaryCardProps = {
  summary: string;
  signal: DealSignal;
};

export default function ExecutiveSummaryCard({ summary, signal }: ExecutiveSummaryCardProps) {
  const signalConfig: Record<DealSignal, { accent: string; badge: string; badgeText: string }> = {
    Favorable: {
      accent: 'from-emerald-500/20 to-emerald-500/5',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      badgeText: 'Favorable',
    },
    Neutral: {
      accent: 'from-amber-500/20 to-amber-500/5',
      badge: 'bg-amber-50 text-amber-700 border-amber-200/60',
      badgeText: 'Neutral',
    },
    Cautious: {
      accent: 'from-red-500/20 to-red-500/5',
      badge: 'bg-red-50 text-red-600 border-red-200/60',
      badgeText: 'Cautious',
    },
  };
  const s = signalConfig[signal];

  return (
    <div className="glass rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Gradient accent top bar */}
      <div className={`h-1 bg-gradient-to-r ${s.accent}`} />
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100/80">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">📋</span>
          <h2 className="text-slate-900 font-semibold text-[15px] tracking-tight">Executive Summary</h2>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${s.badge}`}>
          {s.badgeText}
        </span>
      </div>
      <div className="px-6 py-5">
        <p className="text-slate-600 leading-[1.7] text-[13px]">{summary}</p>
      </div>
    </div>
  );
}
