import type { Browser } from '@playwright/test';

export interface ParityFileDiff {
  name: string;
  issue: string;
  diffPixels?: number;
  ratio?: number;
  tolerance?: number;
  gate?: 'pixel' | 'structural';
  keys?: string[];
  note?: string;
}

export function runLocalParityScenario(options: {
  browser: Browser;
  projectName: string;
  scenarioId: string;
  outDir: string;
  /** 'local' (default) or 'live' (archived, valid only at tag recovered-r180). */
  baselines?: 'local' | 'live';
}): Promise<{ compared: number; problems: ParityFileDiff[]; tolerated: ParityFileDiff[] }>;
