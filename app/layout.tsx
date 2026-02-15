import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Code Reviewer',
  description: 'Get instant AI-powered code reviews with OpenAI GPT-4o or Claude Sonnet',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-zinc-50 font-sans antialiased dark:bg-zinc-950`}>
        <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <Link href="/" className="font-semibold tracking-tight">
              AI Code Reviewer
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Review
              </Link>
              <Link
                href="/history"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                History
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-400 dark:border-zinc-800">
          Built with Next.js + Vercel AI SDK
        </footer>
      </body>
    </html>
  );
}
