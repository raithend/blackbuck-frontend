import NextAuth from "next-auth"
import Facebook from "next-auth/providers/facebook"
import Google from "next-auth/providers/google"
import Twitter from "next-auth/providers/twitter"
import GitHub from "next-auth/providers/github"

export const config = {
  providers: [Facebook, Google, Twitter, GitHub],
  pages: {
    signIn: "/login", 
    signOut: "/logout",
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth(config)