import type { AnalysisStep } from '@/types';

type LoadingViewProps = {
  step: AnalysisStep;
};

export default function LoadingView({ step }: LoadingViewProps) {
  const pct = Math.round(step.progress * 100);

  return (
    <div className="min-h-screen flex items-center justify-center px-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-navy/10 rounded-full mb-5">
            <span className="text-3xl animate-pulse">📊</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Generating Due Diligence Memo</h2>
          <p className="text-slate-500 text-sm">Analyzing SEC filings and synthesizing insights...</p>
        </div>

        {/* Progress bar */}
        <div className="bg-slate-200 rounded-full h-2.5 mb-3 overflow-hidden">
          <div
            className="bg-navy h-full rounded-full transition-all duration-700 ease-in-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between items-center mb-8">
          <p className="text-slate-600 text-sm font-medium">{step.label}</p>
          <span className="text-navy font-bold text-sm">{pct}%</span>
        </div>

        {/* Steps list */}
        <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-50 shadow-sm">
          {[
            { p: 0.1, label: 'SEC EDGAR lookup' },
            { p: 0.25, label: '10-K download' },
            { p: 0.4, label: 'Chunk & embed' },
            { p: 0.55, label: 'Financial health' },
            { p: 0.65, label: 'Risk factors' },
            { p: 0.75, label: 'Red flags' },
            { p: 0.85, label: 'Competitive position' },
            { p: 0.95, label: 'Executive summary' },
          ].map((s) => {
            const done = step.progress > s.p;
            const active = Math.abs(step.progress - s.p) < 0.01;
            return (
              <div key={s.label} className="flex items-center gap-3 px-4 py-2.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                    done
                      ? 'bg-emerald-500 text-white'
                      : active
                      ? 'bg-navy text-white animate-pulse'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {done ? '✓' : ''}
                </span>
                <span
                  className={`text-sm ${
                    done ? 'text-slate-400 line-through' : active ? 'text-navy font-semibold' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
