'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-browser'

// バックエンドのユーザー情報の型定義
interface UserProfile {
  accountId: string
  name: string
}

// バックエンドのセッション情報の型定義
interface BackendSession {
  user: {
    id: number
    name: string
    account_id: string
    avatar_url: string
    header_url: string
    bio: string
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
  backendSession: BackendSession | null
  userProfile: UserProfile | null
  isLoading: boolean
  error: string | null
  checkSession: () => Promise<void>
  getAuthToken: () => Promise<string | null>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// セッションとユーザープロフィール取得用のフェッチャー
const sessionFetcher = async (url: string): Promise<SessionResponse> => {
  try {
    console.log('セッション確認開始')
    const supabase = createClient()
    const { data: { session: supabaseSession } } = await supabase.auth.getSession()

    console.log('Supabaseセッション確認:', {
      hasSession: !!supabaseSession,
      token: supabaseSession?.access_token?.substring(0, 10) + '...'
    })

    if (!supabaseSession) {
      console.log('Supabaseセッションなし')
      return {
        session: null,
        userProfile: null
      }
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}${url}`
    console.log('バックエンドセッション確認リクエスト:', {
      url: apiUrl,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${supabaseSession.access_token?.substring(0, 10)}...`
      }
    })

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${supabaseSession.access_token}`
      },
      credentials: 'include',
    })

    if (!response.ok) {
      console.error('バックエンドセッション確認エラー:', {
        status: response.status,
        statusText: response.statusText
      })
      if (response.status === 401) {
        return {
          session: null,
          userProfile: null
        }
      }
      throw new Error(`APIエラー: ${response.status}`)
    }

    const data = await response.json()
    console.log('バックエンドセッション確認成功:', data)
    
    if (!data) {
      console.log('バックエンドセッションデータなし')
      return {
        session: null,
        userProfile: null
      }
    }

    // バックエンドからのレスポンスデータをそのまま使用
    const backendSession: BackendSession = data.session
    const userProfile: UserProfile = data.userProfile

    console.log('セッション確認完了:', {
      session: backendSession,
      userProfile
    })

    return {
      session: backendSession,
      userProfile
    }
  } catch (error) {
    console.error('セッション取得エラー:', error)
    throw error
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [backendSession, setBackendSession] = useState<BackendSession | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // 認証トークンを取得する関数
  const getAuthToken = async (): Promise<string | null> => {
    try {
      console.log('認証トークン取得開始')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('認証トークン取得エラー:', error)
        return null
      }

      if (!session) {
        console.log('セッションなし')
        return null
      }

      if (!session.access_token) {
        console.error('アクセストークンなし')
        return null
      }

      // トークンの形式を確認
      const tokenParts = session.access_token.split('.')
      if (tokenParts.length !== 3) {
        console.error('トークン形式が不正:', {
          parts: tokenParts.length,
          tokenPreview: session.access_token.substring(0, 10) + '...'
        })
        return null
      }

      // トークンの有効期限を確認
      if (session.expires_at) {
        const expiresAt = new Date(session.expires_at)
        if (expiresAt < new Date()) {
          console.error('トークンの有効期限が切れています:', {
            expiresAt: expiresAt.toISOString(),
            now: new Date().toISOString()
          })
          return null
        }
      }

      console.log('認証トークン取得成功:', {
        token: session.access_token.substring(0, 10) + '...',
        expires_at: session.expires_at,
        tokenLength: session.access_token.length,
        tokenParts: tokenParts.length
      })

      return session.access_token
    } catch (error) {
      console.error('認証トークン取得エラー:', error)
      return null
    }
  }

  // セッションとユーザープロフィール取得用のSWR
  const { data: sessionData, error: sessionError, mutate } = useSWR<SessionResponse>(
    '/api/v1/sessions',
    sessionFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
      shouldRetryOnError: false
    }
  )

  // セッションデータの更新
  useEffect(() => {
    console.log('セッションデータ更新:', sessionData)
    if (sessionData) {
      if (sessionData.session === null) {
        console.log('セッションなし - 状態をクリア')
        setBackendSession(null)
        setUserProfile(null)
      } else {
        console.log('セッションあり - 状態を更新:', {
          session: sessionData.session,
          userProfile: sessionData.userProfile
        })
        setBackendSession(sessionData.session)
        setUserProfile(sessionData.userProfile)
      }
    }
  }, [sessionData])

  // エラー状態の更新
  useEffect(() => {
    if (sessionError) {
      console.error('セッションエラー:', sessionError)
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

  // セッションチェック関数
  const checkSession = async () => {
    try {
      console.log('セッションチェック開始')
      setIsLoading(true)
      await mutate()
      console.log('セッションチェック完了')
    } catch (error) {
      console.error('セッションチェックエラー:', error)
      setError('セッションの確認に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const contextValue: UserContextType = {
    backendSession,
    userProfile,
    isLoading,
    error,
    checkSession,
    getAuthToken
  }

  console.log('UserContext現在の状態:', contextValue)

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