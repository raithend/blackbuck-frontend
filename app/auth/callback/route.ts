'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    try {
      const supabase = createServerClient(
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

      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error('認証コードの交換中にエラーが発生しました:', error)
    }
  }

  // ユーザーをダッシュボードページにリダイレクト
  return NextResponse.redirect(new URL('/dashboard', request.url))
} 