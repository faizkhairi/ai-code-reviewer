import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getGitHubApp } from "@/lib/github"

// GitHub redirects here after the user installs the App.
// URL params: ?installation_id=12345678&setup_action=install
export default async function CallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ installation_id?: string; setup_action?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { installation_id, setup_action } = await searchParams

  if (!installation_id || setup_action !== "install") {
    redirect("/github/install?error=invalid_callback")
  }

  const githubInstallId = parseInt(installation_id, 10)
  if (isNaN(githubInstallId)) {
    redirect("/github/install?error=invalid_installation_id")
  }

  // Fetch installation details from GitHub to get the account login and type
  let accountLogin = ""
  let accountType = "User"
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (getGitHubApp().octokit as any).rest.apps.getInstallation({
      installation_id: githubInstallId,
    })
    accountLogin = data.account && "login" in data.account ? (data.account.login ?? "") : ""
    accountType = data.account && "type" in data.account ? (data.account.type ?? "User") : "User"
  } catch {
    // Proceed without the details — webhook will fill them in later
  }

  await db.installation.upsert({
    where: { installationId: githubInstallId },
    create: {
      installationId: githubInstallId,
      accountLogin,
      accountType,
      userId: session.user.id,
    },
    update: {
      userId: session.user.id,
      accountLogin: accountLogin || undefined, // don't overwrite with empty string
      suspendedAt: null,
    },
  })

  redirect("/github/install?success=installed")
}
