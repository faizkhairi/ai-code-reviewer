import { App } from "@octokit/app"

// Lazy getter — do NOT instantiate at module load time.
// Next.js evaluates imports during static build; App() validates appId immediately
// and throws if env vars are absent. Deferring to first call avoids the build error.
const globalForGitHub = globalThis as unknown as { githubApp: App | undefined }

export function getGitHubApp(): App {
  if (globalForGitHub.githubApp) return globalForGitHub.githubApp

  // PEM private keys stored in env vars have literal \n instead of real newlines.
  const privateKey = (process.env.GITHUB_APP_PRIVATE_KEY ?? "").replace(/\\n/g, "\n")

  const app = new App({
    appId: process.env.GITHUB_APP_ID!,
    privateKey,
    webhooks: {
      secret: process.env.GITHUB_WEBHOOK_SECRET!,
    },
  })

  globalForGitHub.githubApp = app
  return app
}
