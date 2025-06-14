'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/app/types/types'
import { createClient } from '@/app/lib/supabase-browser'
import useSWR from 'swr'
import { Session } from '@supabase/supabase-js'

interface UserContextType {
  user: User | null
  loading: boolean
  error: Error | null
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const fetcher = async (url: string) => {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    return { user: null }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }

  return response.json()
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isSessionLoading, setIsSessionLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    // 初期セッションの取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsSessionLoading(false)
    })

    // セッション変更の監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // セッションの読み込みが完了していない場合は、データフェッチを行わない
  const shouldFetch = !isSessionLoading && session?.user
  const { data, error, mutate } = useSWR(
    shouldFetch ? '/api/users/me' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      errorRetryCount: 0
    }
  )

  const user = data?.user ?? null
  // セッションの読み込み中の場合のみloadingをtrueに
  const loading = isSessionLoading

  console.log('UserProvider state:', { 
    user, 
    loading, 
    error, 
    session,
    isSessionLoading,
    shouldFetch
  })

  const value = {
    user,
    loading,
    error,
    refreshUser: mutate
  }

  return (
    <UserContext.Provider value={value}>
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