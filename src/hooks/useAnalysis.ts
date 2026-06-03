import { useState, useCallback, useRef } from 'react';
import type { AnalysisResult, AnalysisStatus, AnalysisStep } from '@/types';
import { MOCK_RESULTS, ANALYSIS_STEPS } from '@/lib/mockData';

type UseAnalysisReturn = {
  status: AnalysisStatus;
  currentStep: AnalysisStep | null;
  result: AnalysisResult | null;
  error: string | null;
  runAnalysis: (ticker: string) => void;
  reset: () => void;
};

export function useAnalysis(): UseAnalysisReturn {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [currentStep, setCurrentStep] = useState<AnalysisStep | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<any>(null);

  const runAnalysis = useCallback((ticker: string) => {
    const upper = ticker.trim().toUpperCase();
    if (!upper) return;

    setStatus('loading');
    setResult(null);
    setError(null);
    setCurrentStep(ANALYSIS_STEPS[0]);

    let stepIndex = 0;

    const advance = () => {
      stepIndex++;
      if (stepIndex < ANALYSIS_STEPS.length) {
        setCurrentStep(ANALYSIS_STEPS[stepIndex]);
        const delay = stepIndex === ANALYSIS_STEPS.length - 1 ? 600 : 900;
        timerRef.current = setTimeout(advance, delay);
      } else {
        const data = MOCK_RESULTS[upper];
        if (data) {
          setResult(data);
          setStatus('complete');
        } else {
          setError(
            `❌ Could not find SEC filings for ticker "${upper}". Please check the ticker and try again. Note: foreign filers may use Form 20-F instead of 10-K.`
          );
          setStatus('error');
        }
        setCurrentStep(null);
      }
    };

    timerRef.current = setTimeout(advance, 900);
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus('idle');
    setCurrentStep(null);
    setResult(null);
    setError(null);
  }, []);

  return { status, currentStep, result, error, runAnalysis, reset };
}
