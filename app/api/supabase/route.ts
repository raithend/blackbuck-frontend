import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    // Supabaseクライアントの作成
    const supabase = await createClient()

    // セッションの確認
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // URLからクエリパラメータを取得
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    const query = searchParams.get('query')

    if (!table) {
      return NextResponse.json(
        { error: 'テーブル名が必要です' },
        { status: 400 }
      )
    }

    // データの取得
    const { data, error } = await supabase
      .from(table)
      .select(query || '*')
      .eq('user_id', session.user.id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Supabaseクライアントの作成
    const supabase = await createClient()

    // セッションの確認
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // リクエストボディの取得
    const body = await request.json()
    const { table, data } = body

    if (!table || !data) {
      return NextResponse.json(
        { error: 'テーブル名とデータが必要です' },
        { status: 400 }
      )
    }

    // データの挿入
    const { data: result, error } = await supabase
      .from(table)
      .insert({
        ...data,
        user_id: session.user.id
      })
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 