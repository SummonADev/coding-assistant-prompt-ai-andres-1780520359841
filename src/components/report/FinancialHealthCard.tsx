import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type FinancialHealthCardProps = {
  content: string;
};

export default function FinancialHealthCard({ content }: FinancialHealthCardProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-6 py-4 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">💰</span>
          <h2 className="text-slate-900 font-bold text-base">Financial Health</h2>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-6 py-5">
          <MarkdownLite content={content} />
        </div>
      )}
    </div>
  );
}

function MarkdownLite({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1.5 text-sm text-slate-700">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <h3 key={i} className="text-navy font-bold text-sm mt-4 mb-1 first:mt-0">{line.slice(3)}</h3>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold text-slate-800">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('- ')) {
          return <p key={i} className="pl-3 border-l-2 border-slate-200 text-slate-600">{line.slice(2)}</p>;
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return <p key={i} className="text-slate-700">{line}</p>;
      })}
    </div>
  );
}
