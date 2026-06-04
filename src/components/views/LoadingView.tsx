import type { AnalysisStep } from '@/types';

type LoadingViewProps = {
  step: AnalysisStep;
};

const STEPS = [
  { p: 0.1, label: 'SEC EDGAR lookup', icon: '🔍' },
  { p: 0.25, label: '10-K download', icon: '📥' },
  { p: 0.4, label: 'Chunk & embed', icon: '🧩' },
  { p: 0.55, label: 'Financial health', icon: '💰' },
  { p: 0.65, label: 'Risk factors', icon: '⚠️' },
  { p: 0.75, label: 'Red flags', icon: '🚩' },
  { p: 0.85, label: 'Competitive position', icon: '🏆' },
  { p: 0.95, label: 'Executive summary', icon: '📋' },
];

export default function LoadingView({ step }: LoadingViewProps) {
  const pct = Math.round(step.progress * 100);

  return (
    <div className="min-h-screen flex items-center justify-center px-8">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Animated orb */}
        <div className="flex justify-center mb-10">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 opacity-20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 opacity-30 animate-pulse" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-white font-bold text-sm">{pct}%</span>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-1.5 tracking-tight">Analyzing filing</h2>
          <p className="text-slate-400 text-sm">{step.label}</p>
        </div>

        {/* Progress bar */}
        <div className="bg-slate-100 rounded-full h-1 mb-8 overflow-hidden">
          <div
            className="bg-gradient-to-r from-violet-500 to-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Steps */}
        <div className="glass rounded-2xl overflow-hidden shadow-sm">
          {STEPS.map((s) => {
            const done = step.progress > s.p;
            const active = Math.abs(step.progress - s.p) < 0.01;
            return (
              <div
                key={s.label}
                className={`flex items-center gap-3 px-5 py-3 transition-all duration-300 ${
                  active ? 'bg-violet-50/80' : ''
                }`}
              >
                <span className="text-sm w-5 text-center flex-shrink-0">
                  {done ? (
                    <span className="text-emerald-500">✓</span>
                  ) : active ? (
                    <span className="inline-block w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                  ) : (
                    <span className="inline-block w-2 h-2 bg-slate-200 rounded-full" />
                  )}
                </span>
                <span
                  className={`text-sm transition-colors duration-300 ${
                    done
                      ? 'text-slate-400'
                      : active
                      ? 'text-violet-700 font-medium'
                      : 'text-slate-400'
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
