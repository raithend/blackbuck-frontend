'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { useUser } from '@/contexts/user-context'
import { toast } from 'sonner'

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function LogoutButton({ variant = 'default', size = 'default' }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { checkSession } = useUser()
  const supabase = createClient()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      // バックエンドのログアウト
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/logout`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('バックエンドのログアウトに失敗しました')
      }

      // Supabaseのログアウト
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw new Error('Supabaseのログアウトに失敗しました')
      }

      // セッションを再チェック
      await checkSession()

      // ログインページにリダイレクト
      router.push('/login')
      toast.success('ログアウトしました')
    } catch (error) {
      toast.error('ログアウトに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? 'ログアウト中...' : 'ログアウト'}
    </Button>
  )
} 