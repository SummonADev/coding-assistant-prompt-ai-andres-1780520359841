import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import type { RiskItem } from '@/types';

type RiskFactorsCardProps = {
  risks: RiskItem[];
};

const IMPACT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  High: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  Medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  Low: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

export default function RiskFactorsCard({ risks }: RiskFactorsCardProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-6 py-4 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <h2 className="text-slate-900 font-bold text-base">Risk Factors</h2>
          <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
            {risks.length} identified
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="divide-y divide-slate-50">
          {risks.map((risk, i) => {
            const style = IMPACT_STYLES[risk.impact] || IMPACT_STYLES['Medium'];
            return (
              <div key={i} className="px-6 py-4">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-900 font-semibold text-sm">{risk.name}</span>
                  </div>
                  <span
                    className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded border ${
                      style.bg
                    } ${style.text} ${style.border}`}
                  >
                    {risk.impact}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed pl-5.5">{risk.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
