'use client';

import { providers, type Provider } from '@/lib/providers';

interface ProviderToggleProps {
  provider: Provider;
  onChange: (provider: Provider) => void;
  disabled?: boolean;
}

export default function ProviderToggle({
  provider,
  onChange,
  disabled,
}: ProviderToggleProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        AI Provider
      </label>
      <div className="flex gap-2">
        {(Object.keys(providers) as Provider[]).map((id) => {
          const p = providers[id];
          const active = provider === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              disabled={disabled}
              className={`flex-1 rounded-xl border px-4 py-3 text-left transition-all ${
                active
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:bg-blue-950/30'
                  : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
              }`}
            >
              <span className="block text-sm font-medium">{p.label}</span>
              <span className="block text-xs text-zinc-500">{p.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
