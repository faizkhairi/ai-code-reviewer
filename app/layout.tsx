import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Code Reviewer',
  description: 'Get instant AI-powered code reviews with OpenAI GPT-4o or Claude Sonnet',
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

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
              {session ? (
                <>
                  <Link
                    href="/reviews"
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Bot Reviews
                  </Link>
                  <Link
                    href="/github/install"
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    GitHub App
                  </Link>
                  <form
                    action={async () => {
                      'use server';
                      await signOut({ redirectTo: '/' });
                    }}
                  >
                    <button
                      type="submit"
                      className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Connect GitHub
                </Link>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-400 dark:border-zinc-800">
          Built with Next.js + Vercel AI SDK ·{' '}
          <Link href="/github/install" className="hover:underline">
            Install GitHub Bot
          </Link>
        </footer>
      </body>
    </html>
  );
}
