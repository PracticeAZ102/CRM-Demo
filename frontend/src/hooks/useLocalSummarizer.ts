import { useCallback, useState } from 'react';

/**
 * Minimal typings for the browser's built-in Summarizer API (Opera WebAI,
 * Chrome built-in AI). Confirm exact option names against Opera's WebAI docs;
 * everything is feature-detected, so an API mismatch just falls back.
 */
interface SummarizerInstance {
  summarize(text: string, options?: { context?: string }): Promise<string>;
  destroy?: () => void;
}
interface SummarizerStatic {
  availability(): Promise<'unavailable' | 'downloadable' | 'downloading' | 'available'>;
  create(options?: Record<string, unknown>): Promise<SummarizerInstance>;
}

const getSummarizer = (): SummarizerStatic | null =>
  (globalThis as unknown as { Summarizer?: SummarizerStatic }).Summarizer ?? null;

export type SummarySource = 'on-device' | 'fallback';

export interface SummaryResult {
  text: string;
  source: SummarySource;
}

export const isLocalAiSupported = (): boolean => getSummarizer() !== null;

/** Try the on-device model; resolve to null if it is missing, unavailable, or fails. */
const summarizeOnDevice = async (text: string): Promise<string | null> => {
  const api = getSummarizer();
  if (!api) return null;
  try {
    if ((await api.availability()) === 'unavailable') return null;
    const summarizer = await api.create({
      type: 'key-points',
      format: 'plain-text',
      length: 'short',
      sharedContext: 'B2B industrial machinery sales CRM (air compressors, chillers, dryers).',
    });
    try {
      const out = (await summarizer.summarize(text)).trim();
      return out || null;
    } finally {
      summarizer.destroy?.();
    }
  } catch (err) {
    console.warn('Local summarizer failed, using fallback', err);
    return null;
  }
};

/**
 * Summarize text on-device when possible. If that is not possible, `fallback()`
 * supplies a deterministic summary so the UI always shows something useful.
 */
export const useLocalSummarizer = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);

  const run = useCallback(async (text: string, fallback: () => string) => {
    setLoading(true);
    setResult(null);
    try {
      const local = await summarizeOnDevice(text);
      setResult(
        local
          ? { text: local, source: 'on-device' }
          : { text: fallback(), source: 'fallback' },
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => setResult(null), []);

  return { run, loading, result, reset };
};