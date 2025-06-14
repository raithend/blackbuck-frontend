'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/app/types/types'
import { getSession } from '@/app/lib/auth'
import { createClient } from '@/app/lib/supabase-browser'

interface UserContextType {
  user: User | null
  loading: boolean
  error: Error | null
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refreshUser = async () => {
    try {
      setLoading(true)
      setError(null)

      const session = await getSession()
      console.log('Current session:', session)

      if (!session?.user) {
        console.log('No session found')
        setUser(null)
        setLoading(false)
        return
      }

      const response = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to fetch user:', error)
        setUser(null)
        setError(new Error(error.message))
        setLoading(false)
        return
      }

      const data = await response.json()
      console.log('User data:', data)
      setUser(data.user)
    } catch (err) {
      console.error('Error in refreshUser:', err)
      setError(err instanceof Error ? err : new Error('ユーザー情報の取得に失敗しました'))
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      try {
        console.log('Initializing UserContext')
        const session = await getSession()
        console.log('Initial session:', session)

        if (!mounted) return

        if (!session?.user) {
          console.log('No initial session')
          setUser(null)
          setLoading(false)
          return
        }

        await refreshUser()
      } catch (err) {
        console.error('Error in initialize:', err)
        if (mounted) {
          setError(err instanceof Error ? err : new Error('初期化に失敗しました'))
          setUser(null)
          setLoading(false)
        }
      }
    }

    // 即時実行
    initialize()

    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session)
      if (!mounted) return

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        await refreshUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setLoading(false)
        setError(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    loading,
    error,
    refreshUser
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