import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Facebook from "next-auth/providers/facebook"
import Google from "next-auth/providers/google"
import Twitter from "next-auth/providers/twitter"
import GitHub from "next-auth/providers/github"
import { saltAndHashPassword } from "@/utils/password"

export const config = {
  providers: [Facebook, Google, Twitter, GitHub, 
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user = null
 
        // logic to salt and hash password
        const pwHash = saltAndHashPassword(credentials.password)
 
        // logic to verify if the user exists
        user = await getUserFromDb(credentials.email, pwHash)
 
        if (!user) {
          // No user found, so this is their first attempt to login
          // meaning this is also the place you could do registration
          throw new Error("User not found.")
        }
 
        // return user object with their profile data
        return user
      },
    })
  ],
  pages: {
    signIn: "/login", 
    signOut: "/logout",
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth(config)