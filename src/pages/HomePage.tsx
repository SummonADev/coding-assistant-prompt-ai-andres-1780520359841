import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import LandingView from '@/components/views/LandingView';
import LoadingView from '@/components/views/LoadingView';
import ReportView from '@/components/views/ReportView';
import { useAnalysis } from '@/hooks/useAnalysis';

export default function HomePage() {
  const [ticker, setTicker] = useState('');
  const { status, currentStep, result, error, runAnalysis, reset } = useAnalysis();

  const handleGenerate = (t?: string) => {
    const val = (t ?? ticker).trim().toUpperCase();
    if (val) {
      setTicker(val);
      runAnalysis(val);
    }
  };

  const handleReset = () => {
    reset();
    setTicker('');
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa] mesh-gradient">
      <Sidebar
        ticker={ticker}
        setTicker={setTicker}
        onGenerate={handleGenerate}
        isLoading={status === 'loading'}
        metadata={result?.metadata ?? null}
      />
      <main className="flex-1 overflow-auto">
        {status === 'idle' && (
          <LandingView onSelectTicker={handleGenerate} />
        )}
        {status === 'loading' && currentStep && (
          <LoadingView step={currentStep} />
        )}
        {status === 'error' && (
          <div className="flex items-center justify-center min-h-screen p-8">
            <div className="max-w-md w-full animate-scale-in">
              <div className="glass rounded-2xl p-8 text-center shadow-lg">
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-slate-900 font-semibold text-lg mb-2">Something went wrong</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{error}</p>
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all duration-200 active:scale-[0.98]"
                >
                  Try Another Ticker
                </button>
              </div>
            </div>
          </div>
        )}
        {status === 'complete' && result && (
          <ReportView result={result} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}
