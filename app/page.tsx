'use client';

import { useState, useRef } from 'react';
import CodeEditor from '@/components/CodeEditor';
import ProviderToggle from '@/components/ProviderToggle';
import ReviewTypeSelector from '@/components/ReviewTypeSelector';
import ReviewOutput from '@/components/ReviewOutput';
import { addToHistory } from '@/lib/history';
import type { SupportedLanguage, ReviewType } from '@/lib/prompts';
import type { Provider } from '@/lib/providers';

export default function Home() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('typescript');
  const [provider, setProvider] = useState<Provider>('openai');
  const [reviewType, setReviewType] = useState<ReviewType>('general');
  const [review, setReview] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function handleSubmit() {
    if (!code.trim() || isStreaming) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsStreaming(true);
    setReview('');

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, provider, reviewType }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error('Failed to get review');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullReview = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullReview += chunk;
        setReview(fullReview);
      }

      addToHistory({ code, language, provider, reviewType, review: fullReview });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setReview('Error: Failed to get review. Check your API keys.');
      }
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Review Your Code</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Paste code, pick a provider and review type, then get instant AI feedback.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <CodeEditor
            code={code}
            language={language}
            onCodeChange={setCode}
            onLanguageChange={setLanguage}
            disabled={isStreaming}
          />
          <ProviderToggle
            provider={provider}
            onChange={setProvider}
            disabled={isStreaming}
          />
          <ReviewTypeSelector
            reviewType={reviewType}
            onChange={setReviewType}
            disabled={isStreaming}
          />
          <button
            onClick={handleSubmit}
            disabled={!code.trim() || isStreaming}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStreaming ? 'Reviewing...' : 'Review Code'}
          </button>
        </div>

        <div>
          <ReviewOutput content={review} isStreaming={isStreaming} />
        </div>
      </div>
    </div>
  );
}
