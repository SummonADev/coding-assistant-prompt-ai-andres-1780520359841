import type { DealSignal } from '@/types';

type ExecutiveSummaryCardProps = {
  summary: string;
  signal: DealSignal;
};

export default function ExecutiveSummaryCard({ summary, signal }: ExecutiveSummaryCardProps) {
  const signalStyles: Record<DealSignal, { border: string; bg: string; label: string; text: string }> = {
    Favorable: {
      border: 'border-l-emerald-500',
      bg: 'bg-emerald-50',
      label: 'text-emerald-700',
      text: 'Favorable',
    },
    Neutral: {
      border: 'border-l-yellow-500',
      bg: 'bg-yellow-50',
      label: 'text-yellow-700',
      text: 'Neutral',
    },
    Cautious: {
      border: 'border-l-red-500',
      bg: 'bg-red-50',
      label: 'text-red-700',
      text: 'Cautious',
    },
  };
  const s = signalStyles[signal];

  return (
    <div className={`rounded-xl border border-slate-100 border-l-4 ${s.border} bg-white shadow-sm overflow-hidden`}>
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">📋</span>
          <h2 className="text-slate-900 font-bold text-base">Executive Summary</h2>
          <span className="text-slate-400 text-xs uppercase tracking-wider">Managing Director Brief</span>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.label}`}>
          Deal Signal: {s.text}
        </span>
      </div>
      <div className="px-6 py-5">
        <p className="text-slate-700 leading-relaxed text-sm">{summary}</p>
      </div>
    </div>
  );
}
