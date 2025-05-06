'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountId, setAccountId] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [accountIdStatus, setAccountIdStatus] = useState<'checking' | 'available' | 'unavailable' | null>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // account_idのバリデーション
  useEffect(() => {
    if (!accountId) {
      setAccountIdStatus(null)
      return
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/v1/users/${accountId}`)
        if (response.ok) {
          setAccountIdStatus('unavailable')
        } else if (response.status >= 400 && response.status < 500) {
          setAccountIdStatus('available')
        }
      } catch (err) {
        setAccountIdStatus(null)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [accountId])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      // Supabaseでのサインアップ
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.session) {
        // バックエンドへのユーザー情報送信
        const response = await fetch('/api/v1/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.session.access_token}`
          },
          body: JSON.stringify({
            account_id: accountId,
            username: username
          })
        })

        if (!response.ok) {
          setError('ユーザー情報の登録に失敗しました')
          return
        }

        router.push('/login')
      }
    } catch (err) {
      setError('サインアップ中にエラーが発生しました')
    }
  }

  const isFormValid = email && password && accountId && username && accountIdStatus === 'available'

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>サインアップ</CardTitle>
        <CardDescription>新しいアカウントを作成してください</CardDescription>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="accountId">アカウントID</Label>
              <Input
                id="accountId"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
              />
              {accountIdStatus === 'checking' && (
                <p className="text-sm text-gray-500">チェック中...</p>
              )}
              {accountIdStatus === 'unavailable' && (
                <p className="text-sm text-red-500">そのアカウント名は使用できません</p>
              )}
              {accountIdStatus === 'available' && (
                <p className="text-sm text-green-500">そのアカウント名は使用可能です</p>
              )}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="username">ユーザー名</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={!isFormValid}>
            サインアップ
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 