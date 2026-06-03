import { FileSearch, Cpu, BarChart3, ChevronRight } from 'lucide-react';

type LandingViewProps = {
  onSelectTicker: (ticker: string) => void;
};

const EXAMPLE_TICKERS = ['AAPL', 'JPM', 'TSLA'];

const FEATURES = [
  {
    icon: FileSearch,
    title: 'What It Does',
    description:
      'Automatically fetches the latest 10-K SEC filing for any U.S. public company and extracts the most relevant sections for M&A analysis.',
    color: 'text-navy',
    bg: 'bg-blue-50',
  },
  {
    icon: Cpu,
    title: 'How It Works',
    description:
      'Uses Retrieval-Augmented Generation (RAG) to match SEC filing excerpts to targeted queries, then calls Claude to synthesize structured memo sections.',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
  },
  {
    icon: BarChart3,
    title: 'Why It Matters',
    description:
      'Cuts due diligence prep time from days to minutes. Delivers a consulting-grade memo covering financials, risk factors, red flags, and competitive positioning.',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
  },
];

export default function LandingView({ onSelectTicker }: LandingViewProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16">
      {/* Hero */}
      <div className="text-center max-w-2xl mb-16">
        <span className="inline-block px-3 py-1 bg-navy/10 text-navy text-xs font-semibold rounded-full uppercase tracking-widest mb-4">
          AI-Powered M&A Intelligence
        </span>
        <h1 className="text-4xl font-bold text-slate-900 leading-tight mb-4">
          Due Diligence Memos,{' '}
          <span className="text-navy">In Minutes.</span>
        </h1>
        <p className="text-slate-500 text-lg leading-relaxed">
          Enter any S&P 500 ticker to generate a McKinsey-style due diligence briefing from live SEC EDGAR filings — financial health, risk factors, red flags, and competitive positioning.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-14">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${f.bg} rounded-lg flex items-center justify-center mb-4`}>
              <f.icon className={`w-5 h-5 ${f.color}`} />
            </div>
            <h3 className="text-slate-900 font-semibold text-base mb-2">{f.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>

      {/* Example tickers */}
      <div className="text-center">
        <p className="text-slate-400 text-sm mb-4 uppercase tracking-wider font-medium">Try an example</p>
        <div className="flex gap-3 justify-center flex-wrap">
          {EXAMPLE_TICKERS.map((t) => (
            <button
              key={t}
              onClick={() => onSelectTicker(t)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-white border border-slate-200 rounded-full text-slate-700 font-semibold text-sm hover:border-navy hover:text-navy hover:bg-blue-50 transition-all shadow-sm"
            >
              {t}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
