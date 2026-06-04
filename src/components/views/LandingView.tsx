import { ArrowRight, FileSearch, Cpu, BarChart3 } from 'lucide-react';

type LandingViewProps = {
  onSelectTicker: (ticker: string) => void;
};

const EXAMPLE_TICKERS = ['AAPL', 'JPM', 'TSLA', 'MSFT', 'NVDA'];

const FEATURES = [
  {
    icon: FileSearch,
    title: 'SEC Filing Extraction',
    description: 'Fetches and parses the latest 10-K filing directly from SEC EDGAR in real time.',
    gradient: 'from-blue-500/10 to-cyan-500/10',
    iconColor: 'text-blue-600',
  },
  {
    icon: Cpu,
    title: 'RAG + Claude Analysis',
    description: 'Retrieval-augmented generation matches filing excerpts to structured memo queries.',
    gradient: 'from-violet-500/10 to-purple-500/10',
    iconColor: 'text-violet-600',
  },
  {
    icon: BarChart3,
    title: 'Instant Memo Output',
    description: 'Generates a consulting-grade briefing covering financials, risks, and positioning.',
    gradient: 'from-emerald-500/10 to-teal-500/10',
    iconColor: 'text-emerald-600',
  },
];

export default function LandingView({ onSelectTicker }: LandingViewProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-20">
      {/* Hero */}
      <div className="text-center max-w-xl mb-20 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 border border-violet-100 rounded-full mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-violet-700 text-[11px] font-semibold tracking-wide uppercase">AI-Powered Analysis</span>
        </div>
        <h1 className="text-[42px] font-bold text-slate-900 leading-[1.1] tracking-tight mb-5">
          Due diligence,
          <br />
          <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">reimagined.</span>
        </h1>
        <p className="text-slate-500 text-base leading-relaxed max-w-md mx-auto">
          Enter any public company ticker to generate a comprehensive M&A briefing from live SEC filings.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-16 stagger">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group glass rounded-2xl p-5 hover:shadow-lg transition-all duration-300 cursor-default animate-fade-in-up"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <f.icon className={`w-5 h-5 ${f.iconColor}`} />
            </div>
            <h3 className="text-slate-900 font-semibold text-sm mb-1.5">{f.title}</h3>
            <p className="text-slate-500 text-[13px] leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>

      {/* Example tickers */}
      <div className="text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
        <p className="text-slate-400 text-[11px] mb-4 uppercase tracking-[0.15em] font-medium">Quick Start</p>
        <div className="flex gap-2.5 justify-center flex-wrap">
          {EXAMPLE_TICKERS.map((t) => (
            <button
              key={t}
              onClick={() => onSelectTicker(t)}
              className="group flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200/80 rounded-xl text-slate-600 font-medium text-sm hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50/50 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.97]"
            >
              {t}
              <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
