import { createClient } from '@supabase/supabase-js'

// ブラウザ側で使用するクライアント
export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  // カスタムストレージの実装
  const customStorage = {
    getItem: (key: string) => {
      console.log(`[Browser] Storage getItem: ${key}`)
      if (typeof window === 'undefined') return null
      
      // 1. 通常のCookieチェック
      let cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${key}=`))
        ?.split('=')[1]
      
      if (cookieValue) {
        try {
          const decoded = decodeURIComponent(cookieValue)
          console.log(`[Browser] Cookieから値を取得: ${key} (長さ: ${decoded.length})`)
          
          // JSONとして解析できるか確認
          try {
            const parsed = JSON.parse(decoded)
            return parsed
          } catch (jsonErr) {
            console.error('[Browser] Cookie JSONパースエラー:', jsonErr)
          }
        } catch (e) {
          console.error('[Browser] Cookieのデコードエラー:', e)
        }
      }
      
      // 2. LocalStorageをバックアップとして使用
      try {
        const lsValue = localStorage.getItem(key)
        if (lsValue) {
          console.log(`[Browser] LocalStorageから値を取得: ${key} (長さ: ${lsValue.length})`)
          
          try {
            // JSONとして解析
            const jsonValue = JSON.parse(lsValue)
            
            // Cookieにも値を設定（同期を維持）
            const cookieStr = encodeURIComponent(lsValue)
            document.cookie = `${key}=${cookieStr}; path=/; max-age=2592000; SameSite=Lax; secure`
            console.log(`[Browser] LocalStorageの値をCookieにも同期しました: ${key}`)
            
            return jsonValue
          } catch (parseErr) {
            console.error('[Browser] LocalStorage JSONパースエラー:', parseErr)
          }
        }
      } catch (lsErr) {
        console.error('[Browser] LocalStorage取得エラー:', lsErr)
      }
      
      return null
    },
    setItem: (key: string, value: any) => {
      console.log(`[Browser] Storage setItem: ${key}`)
      if (typeof window === 'undefined') return
      
      // 保存するデータを確認
      console.log(`[Browser] 保存データの内容:`, {
        hasAccessToken: !!value?.access_token,
        hasRefreshToken: !!value?.refresh_token,
        hasSession: !!value?.session,
        expiresAt: value?.expires_at ? new Date(value.expires_at * 1000).toISOString() : 'なし'
      })
      
      // 文字列化してからエンコード
      const stringValue = JSON.stringify(value)
      const encodedValue = encodeURIComponent(stringValue)
      
      // セッションの有効期限を取得
      let maxAge = 2592000 // デフォルト: 30日
      if (value?.session?.expires_at) {
        const expiresAt = new Date(value.session.expires_at * 1000)
        const now = new Date()
        const secondsUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
        if (secondsUntilExpiry > 0) {
          maxAge = secondsUntilExpiry
        }
      } else if (value?.expires_at) {
        const expiresAt = new Date(value.expires_at * 1000)
        const now = new Date()
        const secondsUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
        if (secondsUntilExpiry > 0) {
          maxAge = secondsUntilExpiry
        }
      }
      
      // Cookieに設定
      document.cookie = `${key}=${encodedValue}; path=/; max-age=${maxAge}; SameSite=Lax; secure`
      
      // バックアップとしてLocalStorageにも保存
      try {
        localStorage.setItem(key, stringValue)
      } catch (lsErr) {
        console.error('[Browser] LocalStorage設定エラー:', lsErr)
      }
      
      console.log(`[Browser] Cookieとして保存: ${key} (長さ: ${encodedValue.length}, 有効期限: ${maxAge}秒)`)
    },
    removeItem: (key: string) => {
      console.log(`[Browser] Storage removeItem: ${key}`)
      if (typeof window === 'undefined') return
      
      // Cookieから削除
      document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; secure`
      
      // LocalStorageからも削除
      try {
        localStorage.removeItem(key)
      } catch (lsErr) {
        console.error('[Browser] LocalStorage削除エラー:', lsErr)
      }
      
      console.log(`[Browser] ストレージから削除: ${key}`)
    }
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      storageKey: 'supabase.auth.token',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: customStorage
    }
  })
} 