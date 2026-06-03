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
    <div className="flex min-h-screen bg-slate-50">
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
            <div className="max-w-lg w-full bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-700 text-base font-medium">{error}</p>
              <button
                onClick={handleReset}
                className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Try Another Ticker
              </button>
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
