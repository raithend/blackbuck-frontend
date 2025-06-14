'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, completeProfile } from '@/app/lib/auth'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Alert, AlertDescription } from '@/app/components/ui/alert'

function CompleteProfileContent() {
  const [accountId, setAccountId] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [accountIdStatus, setAccountIdStatus] = useState<'checking' | 'available' | 'unavailable' | null>(null)
  const router = useRouter()

  // セッションの確認
  useEffect(() => {
    const checkSession = async () => {
      try {
        await getSession()
      } catch (error) {
        router.push('/login?error=セッションが無効です')
      }
    }
    checkSession()
  }, [router])

  // account_idのバリデーション
  useEffect(() => {
    if (!accountId) {
      setAccountIdStatus(null)
      return
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/users/account/${accountId}`)
        if (response.ok) {
          setAccountIdStatus('unavailable')
        } else if (response.status === 404) {
          setAccountIdStatus('available')
        } else {
          setAccountIdStatus(null)
        }
      } catch (err) {
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

      await completeProfile({ accountId, name })
      router.push('/')
    } catch (error) {
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