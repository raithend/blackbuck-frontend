import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Supabaseクライアントの初期化
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          })
        },
      },
    }
  )

  try {
    // セッションの確認
    const { data: { session } } = await supabase.auth.getSession()

    // 認証が必要なページへのアクセスを制限
    const authRequiredPages = ['/dashboard', '/profile', '/settings']
    const isAuthRequiredPage = authRequiredPages.some(page => 
      request.nextUrl.pathname.startsWith(page)
    )

    if (isAuthRequiredPage && !session) {
      // 認証が必要なページにアクセスしようとしているが、セッションがない場合はログインページにリダイレクト
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // ログイン済みユーザーがログインページやサインアップページにアクセスしようとした場合はダッシュボードにリダイレクト
    const authPages = ['/login', '/signup']
    const isAuthPage = authPages.some(page => 
      request.nextUrl.pathname.startsWith(page)
    )

    if (isAuthPage && session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch (error) {
    console.error('ミドルウェアでのセッション確認エラー:', error)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}
