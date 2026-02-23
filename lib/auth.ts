import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [GitHub],
  // JWT strategy is required for Edge-compatible proxy/middleware.
  // Database strategy needs Prisma (not available in Edge Runtime).
  // With JWT: sessions live in a signed cookie — no DB call for auth checks.
  // OAuth accounts + users are still written to DB via the adapter.
  session: { strategy: "jwt" },
  callbacks: {
    // Save user.id into the JWT on first sign-in
    jwt({ token, user }) {
      if (user?.id) token.id = user.id
      return token
    },
    // Expose user.id on the session object read by server components
    session({ session, token }) {
      session.user.id = token.id as string
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
