import { useState, useCallback, useRef } from 'react';
import type { AnalysisResult, AnalysisStatus, AnalysisStep } from '@/types';
import { ANALYSIS_STEPS } from '@/lib/mockData';

const BACKEND_URL = 'http://localhost:8000';

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
  const abortRef = useRef<AbortController | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Advance through the loading steps at a fixed cadence while the backend
   * fetch is in-flight. We cycle through all steps except the last one
   * ("Report complete!"), which is only shown once the fetch resolves.
   */
  const startStepAnimation = useCallback(() => {
    let stepIndex = 0;
    // All steps except the final "complete" step
    const animSteps = ANALYSIS_STEPS.slice(0, ANALYSIS_STEPS.length - 1);

    const advance = () => {
      setCurrentStep(animSteps[stepIndex % animSteps.length]);
      stepIndex++;
      stepTimerRef.current = setTimeout(advance, 6000);
    };

    setCurrentStep(animSteps[0]);
    stepTimerRef.current = setTimeout(advance, 6000);
  }, []);

  const stopStepAnimation = useCallback(() => {
    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  }, []);

  const runAnalysis = useCallback(
    (ticker: string) => {
      const upper = ticker.trim().toUpperCase();
      if (!upper) return;

      // Cancel any in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus('loading');
      setResult(null);
      setError(null);

      startStepAnimation();

      fetch(`${BACKEND_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: upper }),
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) {
            let detail = `Backend error (HTTP ${res.status})`;
            try {
              const body = await res.json();
              if (body?.detail) detail = body.detail;
            } catch {
              // ignore JSON parse errors on error responses
            }
            throw new Error(detail);
          }
          return res.json() as Promise<AnalysisResult>;
        })
        .then((data) => {
          stopStepAnimation();
          // Show the final "complete" step briefly before displaying the report
          const finalStep = ANALYSIS_STEPS[ANALYSIS_STEPS.length - 1];
          setCurrentStep(finalStep);
          setTimeout(() => {
            setResult(data);
            setStatus('complete');
            setCurrentStep(null);
          }, 600);
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name === 'AbortError') {
            // Request was cancelled — do nothing
            return;
          }
          stopStepAnimation();
          const message =
            err instanceof Error
              ? err.message
              : 'An unexpected error occurred. Please try again.';
          setError(`❌ ${message}`);
          setStatus('error');
          setCurrentStep(null);
        });
    },
    [startStepAnimation, stopStepAnimation]
  );

  const reset = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    stopStepAnimation();
    setStatus('idle');
    setCurrentStep(null);
    setResult(null);
    setError(null);
  }, [stopStepAnimation]);

  return { status, currentStep, result, error, runAnalysis, reset };
}
