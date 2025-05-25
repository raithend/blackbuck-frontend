'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

function CompleteProfileContent() {
  const [accountId, setAccountId] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [accountIdStatus, setAccountIdStatus] = useState<'checking' | 'available' | 'unavailable' | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // セッションの確認
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          throw error
        }
        if (!session) {
          router.push('/login?error=セッションが無効です')
        }
      } catch (error) {
        console.error('セッションエラー:', error)
        router.push('/login?error=セッションの確認に失敗しました')
      }
    }
    checkSession()
  }, [router, supabase])

  // account_idのバリデーション
  useEffect(() => {
    if (!accountId) {
      setAccountIdStatus(null)
      return
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${accountId}`)
        if (response.ok) {
          setAccountIdStatus('unavailable')
        } else if (response.status === 404) {
          setAccountIdStatus('available')
        } else {
          setAccountIdStatus(null)
        }
      } catch (err) {
        console.error('アカウントIDチェックエラー:', err)
        setAccountIdStatus(null)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [accountId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // アカウントIDの重複チェック
      if (accountIdStatus !== 'available') {
        throw new Error('アカウントIDが使用できません')
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        throw sessionError
      }
      if (!session) {
        throw new Error('セッションが無効です')
      }

      // バックエンドにユーザー情報を送信
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          account_id: accountId,
          name: name,
          uuid: session.user.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'ユーザー情報の登録に失敗しました')
      }

      // ホームページにリダイレクト
      router.push('/')
    } catch (error) {
      console.error('プロフィール登録エラー:', error)
      setError(error instanceof Error ? error.message : 'プロフィールの登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = accountId && name && accountIdStatus === 'available'

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">プロフィールを完成させましょう</CardTitle>
          <CardDescription className="text-center">
            アカウントIDとユーザー名を設定してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountId">アカウントID</Label>
              <Input
                id="accountId"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
              />
              {accountIdStatus === 'checking' && (
                <p className="text-sm text-muted-foreground">チェック中...</p>
              )}
              {accountIdStatus === 'unavailable' && (
                <p className="text-sm text-destructive">そのアカウントIDは使用できません</p>
              )}
              {accountIdStatus === 'available' && (
                <p className="text-sm text-green-600">そのアカウントIDは使用可能です</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">ユーザー名</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || !isFormValid}>
              {isLoading ? '処理中...' : 'プロフィールを登録'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CompleteProfile() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <CompleteProfileContent />
    </Suspense>
  )
} 