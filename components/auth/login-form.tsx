'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [supabase, setSupabase] = useState<any>(null)
  const { refreshSession } = useSupabaseAuth()

  useEffect(() => {
    const client = createBrowserClient()
    setSupabase(client)
    
    // セッション状態を確認
    const checkSession = async () => {
      const { data } = await client.auth.getSession()
      console.log('LoginForm: 現在のセッション状態', { 
        hasSession: !!data.session,
        sessionExpires: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : 'なし'
      })
    }
    
    checkSession()
  }, [])

  // Cookieの存在をチェックする関数
  const checkCookies = () => {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim())
    console.log('現在のCookies:', cookies)
    
    // supabase.auth.tokenが存在するか確認
    const hasAuthToken = cookies.some(cookie => cookie.startsWith('supabase.auth.token='))
    
    return {
      hasAuthToken,
      allCookies: cookies
    }
  }

  // Cookieの内容をデバッグ出力する関数
  const debugCookieContent = (key: string) => {
    try {
      const cookieStr = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${key}=`))
        ?.split('=')[1]
      
      if (cookieStr) {
        try {
          const decodedValue = decodeURIComponent(cookieStr)
          console.log(`Cookie '${key}' デコード値:`, decodedValue.substring(0, 100) + '...')
          
          try {
            const parsedValue = JSON.parse(decodedValue)
            console.log(`Cookie '${key}' 解析結果:`, {
              hasAccessToken: !!parsedValue.access_token,
              hasRefreshToken: !!parsedValue.refresh_token,
              hasSession: !!parsedValue.session,
              expiresAt: parsedValue.expires_at ? new Date(parsedValue.expires_at * 1000).toISOString() : 'なし'
            })
            return parsedValue
          } catch (jsonErr) {
            console.error(`Cookie '${key}' の解析エラー:`, jsonErr)
          }
        } catch (decodeErr) {
          console.error(`Cookie '${key}' のデコードエラー:`, decodeErr)
        }
      } else {
        console.log(`Cookie '${key}' は存在しません`)
      }
      return null
    } catch (err) {
      console.error('Cookie確認エラー:', err)
      return null
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    
    setLoading(true)
    setError(null)

    try {
      console.log('ログイン試行中...', { email })
      
      // セッション確認（事前）
      checkCookies()
      
      // サインイン試行
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('ログインエラー:', error.message)
        setError(error.message)
        setLoading(false)
        return
      }

      console.log('ログイン成功:', { 
        user: data.user?.id,
        session: !!data.session,
        expiresAt: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : 'なし'
      })

      // 正しいトークン形式を手動で保存する
      try {
        if (data.session) {
          // セッションデータを整形して保存
          const sessionData = {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
            session: data.session
          }
          
          // localStorage経由で保存（カスタムストレージがこれを処理）
          localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData))
          
          // Cookie形式でも直接保存
          const encodedValue = encodeURIComponent(JSON.stringify(sessionData))
          const maxAge = Math.floor((new Date(data.session.expires_at * 1000).getTime() - Date.now()) / 1000)
          
          document.cookie = `supabase.auth.token=${encodedValue}; path=/; max-age=${maxAge}; SameSite=Lax; secure`
          
          console.log('セッショントークンを手動で保存しました。有効期限:', new Date(data.session.expires_at * 1000).toISOString())
        }
      } catch (storageErr) {
        console.error('トークン保存エラー:', storageErr)
      }
      
      // セッション確認とデバッグ
      setTimeout(() => {
        const tokenData = debugCookieContent('supabase.auth.token')
        console.log('保存されたトークンの確認:', !!tokenData)
        
        // コンテキストのセッションを更新
        refreshSession().then(() => {
          console.log('セッションコンテキストを更新しました')
          
          // ダッシュボードにリダイレクト
          router.push('/')
          router.refresh()
        })
      }, 500)
    } catch (err) {
      console.error('ログイン処理中の予期せぬエラー:', err)
      setError('ログイン中にエラーが発生しました。もう一度お試しください。')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">ログイン</h1>
        <p className="text-gray-500 dark:text-gray-400">
          アカウントにログインしてください
        </p>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">パスワード</Label>
            <Button variant="link" className="p-0 h-auto" asChild>
              <a href="/reset-password">パスワードをお忘れですか？</a>
            </Button>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading || !supabase}>
          {loading ? 'ログイン中...' : 'ログイン'}
        </Button>
      </form>
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          アカウントをお持ちでないですか？{' '}
          <Button variant="link" className="p-0 h-auto" asChild>
            <a href="/signup">サインアップ</a>
          </Button>
        </p>
      </div>
    </div>
  )
} 