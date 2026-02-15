'use client';

import { useState } from 'react';
import HistoryList from '@/components/HistoryList';
import ReviewOutput from '@/components/ReviewOutput';
import type { ReviewEntry } from '@/lib/history';

export default function HistoryPage() {
  const [selected, setSelected] = useState<ReviewEntry | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Review History</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Browse your past code reviews (stored locally in your browser).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <HistoryList onSelect={setSelected} />
        <div>
          {selected ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">
                  {selected.language}
                </span>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                  {selected.provider}
                </span>
                <span className="rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-950/30 dark:text-green-400">
                  {selected.reviewType}
                </span>
              </div>
              <pre className="max-h-48 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs dark:border-zinc-800 dark:bg-zinc-900">
                {selected.code}
              </pre>
              <ReviewOutput content={selected.review} isStreaming={false} />
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-200 text-zinc-400 dark:border-zinc-700">
              <p>Select a review to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
