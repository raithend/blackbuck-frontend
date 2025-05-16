'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignUpConfirmation() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const code = searchParams.get('code')
      if (!code) return

      setIsLoading(true)
      setError(null)

      try {
        // メール認証の完了
        const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)
        if (authError) throw authError

        if (data.session) {
          // ローカルストレージからアカウント情報を取得
          const accountId = localStorage.getItem('temp_account_id')
          const username = localStorage.getItem('temp_username')

          if (!accountId || !username) {
            throw new Error('アカウント情報が見つかりません')
          }

          // バックエンドにユーザー情報を送信
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
            throw new Error('ユーザー情報の登録に失敗しました')
          }

          // 一時データを削除
          localStorage.removeItem('temp_account_id')
          localStorage.removeItem('temp_username')

          // ホームページにリダイレクト
          router.push('/')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '認証処理に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    handleEmailConfirmation()
  }, [searchParams, router])

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">メールを確認してください</CardTitle>
          <CardDescription className="text-center">
            認証メールが送信されました。メールをご確認ください。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            メールに記載されているリンクをクリックして、アカウントの認証を完了してください。
          </p>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {isLoading && (
            <p className="text-sm text-muted-foreground">処理中...</p>
          )}
          <Button asChild variant="link">
            <Link href="/login">
              ログインページに戻る
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 