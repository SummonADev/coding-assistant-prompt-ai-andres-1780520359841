import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type FinancialHealthCardProps = {
  content: string;
};

export default function FinancialHealthCard({ content }: FinancialHealthCardProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="glass rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/40 transition-colors duration-200"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">💰</span>
          <h2 className="text-slate-900 font-semibold text-[15px] tracking-tight">Financial Health</h2>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`transition-all duration-300 overflow-hidden ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-5 pt-1 border-t border-slate-100/60">
          <MarkdownLite content={content} />
        </div>
      </div>
    </div>
  );
}

function MarkdownLite({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1 text-[13px] text-slate-600">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <h3 key={i} className="text-slate-800 font-semibold text-[13px] mt-4 mb-1 first:mt-1">{line.slice(3)}</h3>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold text-slate-700">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="w-1 h-1 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
              <p className="text-slate-600">{line.slice(2)}</p>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return <p key={i} className="text-slate-600 leading-relaxed">{line}</p>;
      })}
    </div>
  );
}
