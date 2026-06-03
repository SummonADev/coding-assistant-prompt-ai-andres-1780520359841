import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type CompetitivePositionCardProps = {
  content: string;
};

export default function CompetitivePositionCard({ content }: CompetitivePositionCardProps) {
  const [open, setOpen] = useState(true);
  const lines = content.split('\n');

  return (
    <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-6 py-4 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🏆</span>
          <h2 className="text-slate-900 font-bold text-base">Competitive Position</h2>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-6 py-5">
          <div className="space-y-1.5 text-sm text-slate-700">
            {lines.map((line, i) => {
              if (line.startsWith('## ')) {
                return <h3 key={i} className="text-navy font-bold text-sm mt-4 mb-1 first:mt-0">{line.slice(3)}</h3>;
              }
              if (line.match(/^\d+\./)) {
                return (
                  <div key={i} className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-navy/10 text-navy rounded-full flex items-center justify-center text-xs font-bold">
                      {line[0]}
                    </span>
                    <p className="text-slate-700">{line.slice(3)}</p>
                  </div>
                );
              }
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} className="font-semibold text-slate-800">{line.slice(2, -2)}</p>;
              }
              if (line.startsWith('- ')) {
                return <p key={i} className="pl-3 border-l-2 border-slate-200 text-slate-600">{line.slice(2)}</p>;
              }
              if (line.trim() === '') return <div key={i} className="h-1" />;
              return <p key={i}>{line}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
