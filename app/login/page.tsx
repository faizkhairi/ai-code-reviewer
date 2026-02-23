"use client"

import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Connect your GitHub account to use the bot reviewer.
          </p>
        </div>
        <button
          onClick={() => signIn("github", { callbackUrl: "/github/install" })}
          className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          Continue with GitHub
        </button>
        <p className="text-center text-xs text-zinc-400">
          The code reviewer tool works without sign-in.
          <br />
          GitHub sign-in is only needed for the bot reviewer.
        </p>
      </div>
    </div>
  )
}
