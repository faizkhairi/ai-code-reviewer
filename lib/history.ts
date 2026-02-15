import type { ReviewType } from './prompts';
import type { Provider } from './providers';

export interface ReviewEntry {
  id: string;
  code: string;
  language: string;
  provider: Provider;
  reviewType: ReviewType;
  review: string;
  timestamp: number;
}

const STORAGE_KEY = 'ai-code-reviewer-history';
const MAX_ENTRIES = 50;

export function getHistory(): ReviewEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(entry: Omit<ReviewEntry, 'id' | 'timestamp'>): ReviewEntry {
  const full: ReviewEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  const history = getHistory();
  history.unshift(full);
  if (history.length > MAX_ENTRIES) history.length = MAX_ENTRIES;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return full;
}

export function deleteFromHistory(id: string): void {
  const history = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
