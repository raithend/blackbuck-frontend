'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/app/types/database.types'

// 環境変数のチェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
}

export const createClient = async (accessToken?: string) => {
  const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`
      } : undefined
    }
  })

  return supabase
} 