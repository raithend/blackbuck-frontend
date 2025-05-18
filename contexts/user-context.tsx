'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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
    username: string
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
    
    if (!data) {
      return {
        session: null,
        userProfile: null
      }
    }

    // バックエンドからのレスポンスデータをSessionResponseの形式に変換
    const session: BackendSession = {
      user: {
        id: data.id,
        username: data.username,
        account_id: data.account_id,
        avatar_url: data.avatar_url || '',
        header_url: data.header_url || '',
        bio: data.bio || '',
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      },
      expires_at: data.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }

    const userProfile: UserProfile = {
      accountId: data.account_id,
      username: data.username
    }

    return {
      session,
      userProfile
    }
  } catch (error) {
    console.error('セッションチェックエラー:', error)
    throw error
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [backendSession, setBackendSession] = useState<BackendSession | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // セッションとユーザープロフィール取得用のSWR
  const { data: sessionData, error: sessionError, mutate } = useSWR<SessionResponse>(
    '/api/v1/sessions',
    sessionFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
      shouldRetryOnError: false,
      onError: (err) => {
        console.error('セッションの取得に失敗:', err)
      },
      onSuccess: (data) => {
        console.log('セッションの取得に成功:', data)
      }
    }
  )

  // セッションデータの更新
  useEffect(() => {
    if (sessionData) {
      if (sessionData.session === null) {
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

  // セッションチェック関数
  const checkSession = async () => {
    try {
      setIsLoading(true)
      await mutate()
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