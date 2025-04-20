'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// サーバー側で使用するクライアント
export const createServerSupabaseClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          try {
            const cookieStore = cookies()
            return cookieStore.get(name)?.value
          } catch (error) {
            console.error('Cookie取得エラー:', error)
            return undefined
          }
        },
        set(name, value, options) {
          try {
            const cookieStore = cookies()
            cookieStore.set(name, value, options)
          } catch (error) {
            console.error('Cookie設定エラー:', error)
          }
        },
        remove(name, options) {
          try {
            const cookieStore = cookies()
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            console.error('Cookie削除エラー:', error)
          }
        },
      },
    }
  )
} 