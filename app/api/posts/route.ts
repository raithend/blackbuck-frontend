import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase-server'

// 投稿一覧取得
export async function GET() {
  const supabase = await createClient()
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, users(*)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ posts })
}

// 投稿作成
export async function POST(request: Request) {
  const post = await request.json()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...post,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ post: data })
} 