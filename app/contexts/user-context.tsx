'use client'

import { createContext, useContext } from 'react'
import { User } from '@/app/types/types'
import { getSession } from '@/app/lib/auth'
import { createClient } from '@/app/lib/supabase-browser'
import useSWR from 'swr'

interface UserContextType {
  user: User | null
  loading: boolean
  error: Error | null
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// セッションを取得するためのフェッチャー関数
const fetcher = async (url: string) => {
  const session = await getSession()
  if (!session?.user) return null

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
  const { data, error, mutate } = useSWR('/api/users/me', fetcher, {
    revalidateOnFocus: false, // フォーカス時に再検証しない
    revalidateOnReconnect: false, // 再接続時に再検証しない
  })

  const user = data?.user || null
  const loading = !data && !error

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