'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createBrowserClient } from '@/lib/supabase-browser'
import { Session, User } from '@supabase/supabase-js'

interface SupabaseAuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  error: Error | null
  signOut: () => Promise<void>
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Supabaseクライアントの初期化
    const supabase = createBrowserClient()

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
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user,
    loading,
    error,
    signOut
  }

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  )
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
} 