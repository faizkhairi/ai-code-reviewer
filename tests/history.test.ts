import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getHistory, addToHistory, deleteFromHistory, clearHistory } from '@/lib/history';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
  length: 0,
  key: vi.fn(() => null),
};

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });
Object.defineProperty(globalThis, 'crypto', {
  value: { randomUUID: () => 'test-uuid-' + Math.random().toString(36).slice(2, 8) },
});

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe('getHistory', () => {
  it('returns empty array when no history', () => {
    expect(getHistory()).toEqual([]);
  });

  it('returns parsed history', () => {
    store['ai-code-reviewer-history'] = JSON.stringify([
      { id: '1', code: 'test', language: 'typescript', provider: 'openai', reviewType: 'general', review: 'Good', timestamp: 1 },
    ]);
    const history = getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].code).toBe('test');
  });
});

describe('addToHistory', () => {
  it('adds entry with id and timestamp', () => {
    const entry = addToHistory({
      code: 'const x = 1;',
      language: 'typescript',
      provider: 'openai',
      reviewType: 'general',
      review: 'Looks good',
    });
    expect(entry.id).toBeDefined();
    expect(entry.timestamp).toBeGreaterThan(0);
    expect(getHistory()).toHaveLength(1);
  });

  it('prepends new entries', () => {
    addToHistory({ code: 'first', language: 'python', provider: 'anthropic', reviewType: 'bugs', review: 'r1' });
    addToHistory({ code: 'second', language: 'go', provider: 'openai', reviewType: 'security', review: 'r2' });
    const history = getHistory();
    expect(history[0].code).toBe('second');
    expect(history[1].code).toBe('first');
  });
});

describe('deleteFromHistory', () => {
  it('removes entry by id', () => {
    const entry = addToHistory({ code: 'x', language: 'rust', provider: 'openai', reviewType: 'general', review: 'r' });
    expect(getHistory()).toHaveLength(1);
    deleteFromHistory(entry.id);
    expect(getHistory()).toHaveLength(0);
  });
});

describe('clearHistory', () => {
  it('removes all entries', () => {
    addToHistory({ code: 'a', language: 'go', provider: 'openai', reviewType: 'general', review: 'r' });
    addToHistory({ code: 'b', language: 'go', provider: 'openai', reviewType: 'general', review: 'r' });
    clearHistory();
    expect(getHistory()).toEqual([]);
  });
});
