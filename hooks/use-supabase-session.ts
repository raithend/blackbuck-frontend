'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Session, User } from '@supabase/supabase-js'

interface UseSupabaseSessionReturn {
  session: Session | null
  user: User | null
  loading: boolean
  error: Error | null
  signOut: () => Promise<void>
}

export function useSupabaseSession(): UseSupabaseSessionReturn {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Supabaseクライアントの初期化
    const supabase = createClient()

    // 現在のセッション情報を取得
    const getSession = async () => {
      setLoading(true)
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          throw error
        }
        
        setSession(session)
        setUser(session?.user ?? null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('セッション取得中にエラーが発生しました'))
        console.error('セッション取得エラー:', err)
      } finally {
        setLoading(false)
      }
    }

    // 初回レンダリング時にセッション情報を取得
    getSession()

    // セッション変更のリスナーを設定
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    // クリーンアップ関数
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // ログアウト関数
  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  return { session, user, loading, error, signOut }
} 