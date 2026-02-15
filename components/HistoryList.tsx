'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { getHistory, deleteFromHistory, clearHistory, type ReviewEntry } from '@/lib/history';

// Reactive store for history — triggers re-render on mutations
const listeners = new Set<() => void>();
function emitChange() {
  listeners.forEach((l) => l());
}

interface HistoryListProps {
  onSelect: (entry: ReviewEntry) => void;
}

export default function HistoryList({ onSelect }: HistoryListProps) {
  const subscribe = useCallback((listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  const entries = useSyncExternalStore(
    subscribe,
    () => getHistory(),
    () => [] as ReviewEntry[]
  );

  function handleDelete(id: string) {
    deleteFromHistory(id);
    emitChange();
  }

  function handleClear() {
    if (!confirm('Clear all review history?')) return;
    clearHistory();
    emitChange();
  }

  if (entries.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-200 text-zinc-400 dark:border-zinc-700">
        <p>No reviews yet. Start by reviewing some code!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-zinc-500">{entries.length} reviews</p>
        <button
          onClick={handleClear}
          className="text-xs text-red-500 hover:text-red-600"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start justify-between rounded-xl border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
          >
            <button
              onClick={() => onSelect(entry)}
              className="flex-1 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">
                  {entry.language}
                </span>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                  {entry.provider}
                </span>
                <span className="rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-950/30 dark:text-green-400">
                  {entry.reviewType}
                </span>
              </div>
              <p className="mt-2 truncate font-mono text-xs text-zinc-500">
                {entry.code.slice(0, 100)}...
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {new Date(entry.timestamp).toLocaleString()}
              </p>
            </button>
            <button
              onClick={() => handleDelete(entry.id)}
              className="ml-3 shrink-0 text-xs text-red-400 hover:text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
