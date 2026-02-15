'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReviewOutputProps {
  content: string;
  isStreaming: boolean;
}

export default function ReviewOutput({ content, isStreaming }: ReviewOutputProps) {
  if (!content && !isStreaming) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-200 text-zinc-400 dark:border-zinc-700">
        <p>Review output will appear here</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Review
        </h3>
        {isStreaming && (
          <span className="flex items-center gap-1.5 text-xs text-blue-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
            Streaming...
          </span>
        )}
      </div>
      <div className="prose prose-zinc mt-4 max-w-none dark:prose-invert prose-headings:text-base prose-pre:bg-zinc-50 dark:prose-pre:bg-zinc-950 prose-code:before:content-[''] prose-code:after:content-['']">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
        {isStreaming && (
          <span className="inline-block h-4 w-0.5 animate-pulse bg-blue-500" />
        )}
      </div>
    </div>
  );
}
