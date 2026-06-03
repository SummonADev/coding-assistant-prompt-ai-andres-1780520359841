export type DealSignal = 'Favorable' | 'Neutral' | 'Cautious';

export type AnalysisStatus =
  | 'idle'
  | 'loading'
  | 'complete'
  | 'error';

export type AnalysisStep = {
  progress: number;
  label: string;
};

export type RiskItem = {
  name: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
};

export type MemoSection = {
  financialHealth: string;
  riskFactors: RiskItem[];
  redFlags: string[];
  competitivePosition: string;
  executiveSummary: string;
  dealSignal: DealSignal;
};

export type FilingMetadata = {
  companyName: string;
  ticker: string;
  cik: string;
  filingDate: string;
  fiscalYearEnd: string;
  filingType: string;
  secUrl: string;
};

export type AnalysisResult = {
  memo: MemoSection;
  metadata: FilingMetadata;
};
