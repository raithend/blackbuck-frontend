'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js'
import useSWR from 'swr'

// バックエンドのユーザー情報の型定義
interface UserProfile {
  accountId: string
  username: string
}

// バックエンドのセッション情報の型定義
interface BackendSession {
  user: {
    id: number
    email: string
    username: string
    account_id: string
    created_at: string
    updated_at: string
  }
  expires_at: string
}

// バックエンドからのレスポンス型
interface SessionResponse {
  session: BackendSession | null
  userProfile: UserProfile | null
}

// コンテキストの型定義
interface UserContextType {
  user: SupabaseUser | null  // Supabaseのユーザー情報
  supabaseUser: SupabaseUser | null  // Supabaseのユーザー情報
  supabaseSession: SupabaseSession | null  // Supabaseのセッション情報
  backendSession: BackendSession | null  // バックエンドのセッション情報
  userProfile: UserProfile | null  // バックエンドのユーザープロフィール
  isLoading: boolean
  error: string | null
  checkSession: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// セッションとユーザープロフィール取得用のフェッチャー
const sessionFetcher = async (url: string): Promise<SessionResponse> => {
  try {
    console.log('セッションフェッチャー: リクエスト開始', {
      url: `${process.env.NEXT_PUBLIC_API_URL}${url}`,
      credentials: 'include'
    })

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
    })

    console.log('セッションフェッチャー: レスポンス受信', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })

    if (!response.ok) {
      if (response.status === 401) {
        // 401エラーの場合は、ログインしていないと判定
        return {
          session: null,
          userProfile: null
        }
      }
      const errorText = await response.text()
      console.error('セッションフェッチャー: エラーレスポンス', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      throw new Error(`APIエラー: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('セッションフェッチャー: データ取得成功', data)
    
    if (!data.session || !data.userProfile) {
      throw new Error('無効なセッション情報です')
    }

    if (!data.userProfile.accountId || !data.userProfile.username) {
      throw new Error('無効なユーザー情報です')
    }
    
    return data
  } catch (error) {
    console.error('セッションチェックエラー:', error)
    throw error
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [supabaseSession, setSupabaseSession] = useState<SupabaseSession | null>(null)
  const [backendSession, setBackendSession] = useState<BackendSession | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  // セッションとユーザープロフィール取得用のSWR
  const { data: sessionData, error: sessionError, mutate } = useSWR<SessionResponse>(
    '/api/v1/sessions',
    sessionFetcher,
    {
      revalidateOnFocus: false,  // フォーカス時の再検証を無効化
      revalidateOnReconnect: false,  // 再接続時の再検証を無効化
      dedupingInterval: 5000,
      shouldRetryOnError: false,  // エラー時の再試行を無効化
      onError: (err) => {
        console.error('セッションの取得に失敗:', err)
      },
      onSuccess: (data) => {
        console.log('セッションの取得に成功:', data)
      }
    }
  )

  // コンポーネントマウント時にセッションをチェック
  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        console.log('初期セッションチェック開始')
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        console.log('Supabaseセッション:', currentSession)
        
        if (currentSession) {
          console.log('セッションが存在するため、データを再取得します')
          // セッションが存在する場合、データを再取得
          await mutate()
        } else {
          console.log('セッションが存在しません')
          // セッションが存在しない場合は、バックエンドのセッションもクリア
          setBackendSession(null)
          setUserProfile(null)
        }
      } catch (error) {
        console.error('初期セッションチェックエラー:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkInitialSession()
  }, [supabase, mutate])

  // セッションチェック関数
  const checkSession = async () => {
    try {
      setIsLoading(true)
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      setSupabaseSession(currentSession)
      setSupabaseUser(currentSession?.user ?? null)
    } catch (error) {
      console.error('セッションチェックエラー:', error)
      setError('セッションの確認に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // セッション状態の監視
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseSession(session)
      setSupabaseUser(session?.user ?? null)
      setIsLoading(true)

      if (!session?.user) {
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // セッションデータの更新
  useEffect(() => {
    if (sessionData) {
      if (sessionData.session === null) {
        // 401エラーの場合（ログインしていない場合）
        setBackendSession(null)
        setUserProfile(null)
      } else {
        setBackendSession(sessionData.session)
        setUserProfile(sessionData.userProfile)
      }
    }
  }, [sessionData])

  // エラー状態の更新
  useEffect(() => {
    if (sessionError) {
      setError(sessionError.message)
    } else {
      setError(null)
    }
  }, [sessionError])

  // ローディング状態の更新
  useEffect(() => {
    if (!sessionData) {
      setIsLoading(true)
    } else {
      setIsLoading(false)
    }
  }, [sessionData])

  const contextValue: UserContextType = {
    user: supabaseUser,
    supabaseUser,
    supabaseSession,
    backendSession,
    userProfile,
    isLoading,
    error,
    checkSession
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
} 