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
  refreshSession: () => Promise<void>
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    // Supabaseクライアントの初期化
    const client = createBrowserClient()
    setSupabase(client)

    // 現在のセッション情報を取得
    const getSession = async () => {
      setLoading(true)
      try {
        console.log('SupabaseAuthProvider: セッション取得中...')
        const { data: { session }, error } = await client.auth.getSession()
        if (error) {
          throw error
        }
        
        console.log('SupabaseAuthProvider: セッション取得成功', {
          hasSession: !!session,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'なし'
        })
        
        setSession(session)
        setUser(session?.user ?? null)
      } catch (err) {
        console.error('SupabaseAuthProvider: セッション取得エラー:', err)
        setError(err instanceof Error ? err : new Error('セッション取得中にエラーが発生しました'))
      } finally {
        setLoading(false)
      }
    }

    // 初回レンダリング時にセッション情報を取得
    getSession()

    // セッション変更のリスナーを設定
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      console.log('SupabaseAuthProvider: 認証状態変更:', { event, hasSession: !!session, userId: session?.user?.id })
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
    if (!supabase) return
    try {
      console.log('SupabaseAuthProvider: ログアウト実行中...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      console.log('SupabaseAuthProvider: ログアウト成功')
    } catch (err) {
      console.error('SupabaseAuthProvider: ログアウト中にエラーが発生しました:', err)
      setError(err instanceof Error ? err : new Error('ログアウト中にエラーが発生しました'))
    }
  }

  // セッションを手動で更新する関数
  const refreshSession = async () => {
    if (!supabase) return
    setLoading(true)
    try {
      console.log('SupabaseAuthProvider: セッション更新中...')
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        throw error
      }
      
      console.log('SupabaseAuthProvider: セッション更新成功', {
        hasSession: !!session,
        userId: session?.user?.id
      })
      
      setSession(session)
      setUser(session?.user ?? null)
    } catch (err) {
      console.error('SupabaseAuthProvider: セッション更新エラー:', err)
      setError(err instanceof Error ? err : new Error('セッション更新中にエラーが発生しました'))
    } finally {
      setLoading(false)
    }
  }

  const value = {
    session,
    user,
    loading,
    error,
    signOut,
    refreshSession
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