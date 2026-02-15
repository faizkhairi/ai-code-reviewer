'use client';

import type { ReviewType } from '@/lib/prompts';

const reviewTypes: { id: ReviewType; label: string; icon: string }[] = [
  { id: 'general', label: 'General', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { id: 'performance', label: 'Performance', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'bugs', label: 'Bug Detection', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

interface ReviewTypeSelectorProps {
  reviewType: ReviewType;
  onChange: (type: ReviewType) => void;
  disabled?: boolean;
}

export default function ReviewTypeSelector({
  reviewType,
  onChange,
  disabled,
}: ReviewTypeSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Review Type
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {reviewTypes.map((rt) => {
          const active = reviewType === rt.id;
          return (
            <button
              key={rt.id}
              onClick={() => onChange(rt.id)}
              disabled={disabled}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all ${
                active
                  ? 'border-blue-500 bg-blue-50 font-medium text-blue-700 ring-1 ring-blue-500 dark:bg-blue-950/30 dark:text-blue-400'
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600'
              }`}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={rt.icon} />
              </svg>
              {rt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
