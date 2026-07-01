import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    signIn({ user, account, profile }) {
      if (account?.provider !== "google") {
        return false
      }

      const authorizedEmail = "edwinwamukoya88@gmail.com"

      const email = user.email ?? profile?.email ?? null

      if (email !== authorizedEmail) {
        return false
      }

      return true
    },
  },
})
