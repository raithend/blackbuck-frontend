'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Session, User } from '@supabase/supabase-js'
import useSWR from 'swr'

interface UserProfile {
  accountId: string
  username: string
}

interface UserContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  isLoading: boolean
  error: string | null
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

const fetcher = async (url: string): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include', // クッキーを含める
  })

  if (!response.ok) {
    throw new Error('ユーザー情報の取得に失敗しました')
  }

  const data = await response.json()
  
  // データの型チェック
  if (!data.accountId || !data.username) {
    throw new Error('無効なユーザー情報です')
  }
  
  return {
    accountId: data.accountId,
    username: data.username
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  // useSWRを使用してユーザープロフィールを取得
  const { data: userProfile, error: profileError } = useSWR<UserProfile>(
    session?.user ? `/api/v1/users/${session.user.id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      shouldRetryOnError: false,
      onError: (err) => {
        console.error('ユーザープロフィールの取得に失敗:', err)
      }
    }
  )

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(true)

      if (!session?.user) {
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // エラー状態の更新
  useEffect(() => {
    if (profileError) {
      setError(profileError.message)
    } else {
      setError(null)
    }
  }, [profileError])

  // ローディング状態の更新
  useEffect(() => {
    if (session?.user && !userProfile && !profileError) {
      setIsLoading(true)
    } else {
      setIsLoading(false)
    }
  }, [session, userProfile, profileError])

  const contextValue: UserContextType = {
    user,
    session,
    userProfile: userProfile || null,
    isLoading,
    error
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