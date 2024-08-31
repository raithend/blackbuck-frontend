import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Facebook from "next-auth/providers/facebook"
import Google from "next-auth/providers/google"
import Twitter from "next-auth/providers/twitter"
import Resend from "next-auth/providers/resend"

import { SupabaseAdapter } from "@auth/supabase-adapter"
 
export const config = {
  providers: [Google, Twitter, Facebook, Resend],
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL ?? '',
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  }),
}

export const { handlers, signIn, signOut, auth } = NextAuth(config)
