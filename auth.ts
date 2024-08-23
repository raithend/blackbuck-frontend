import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Facebook from "next-auth/providers/facebook"
import Google from "next-auth/providers/google"
import Twitter from "next-auth/providers/twitter"
import GitHub from "next-auth/providers/github"

export const config = {
  providers: [
    Facebook, 
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Twitter, 
    GitHub
  ],
  pages: {
    signIn: "/sign-in", 
    signOut: "/sign-out",
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth(config)
