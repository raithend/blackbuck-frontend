'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { useUser } from '@/contexts/user-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { checkSession } = useUser()
  const [supabase] = useState(() => createClient())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Supabaseでログイン
      const { data: { session }, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (supabaseError) {
        console.error('Supabase認証エラー:', supabaseError)
        throw new Error(supabaseError.message)
      }

      if (!session) {
        console.error('セッションが作成されませんでした')
        throw new Error('ログインに失敗しました')
      }

      console.log('Supabase認証成功:', {
        access_token: session.access_token?.substring(0, 10) + '...',
        refresh_token: session.refresh_token?.substring(0, 10) + '...'
      })

      // バックエンドのセッションを作成
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/login`
      console.log('バックエンドリクエスト:', {
        url: apiUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${session.access_token?.substring(0, 10)}...`
        }
      })

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('バックエンド認証エラー:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(errorData.error || 'バックエンドのセッション作成に失敗しました')
      }

      const responseData = await response.json()
      console.log('バックエンド認証成功:', responseData)

      // セッションを再チェック
      await checkSession()

      // ログイン成功後のリダイレクト
      router.push('/')
    } catch (err) {
      console.error('ログインエラー:', err)
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>ログイン</CardTitle>
        <CardDescription>アカウントにログインしてください</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
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
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 