'use client';

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/prompts';

interface CodeEditorProps {
  code: string;
  language: SupportedLanguage;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: SupportedLanguage) => void;
  disabled?: boolean;
}

export default function CodeEditor({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  disabled,
}: CodeEditorProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Code
        </label>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
          disabled={disabled}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        disabled={disabled}
        placeholder="Paste your code here..."
        rows={16}
        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        spellCheck={false}
      />
      <p className="text-right text-xs text-zinc-400">
        {code.split('\n').length} lines
      </p>
    </div>
  );
}
