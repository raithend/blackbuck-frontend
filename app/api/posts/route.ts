import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase-server'

// 投稿一覧取得
export async function GET() {
  const supabase = await createClient()
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, users(*), post_images(*)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ posts })
}

// 投稿作成
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // 認証トークンの取得
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // トークンの検証
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const post = await request.json()
    
    // バリデーション
    if (!post.image_urls || post.image_urls.length === 0) {
      return NextResponse.json({ error: '画像が必須です' }, { status: 400 })
    }

    // トランザクション開始
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: post.content || '',
        location: post.location || '',
        classification: post.classification || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (postError) {
      return NextResponse.json({ error: postError.message }, { status: 400 })
    }

    // 画像の登録
    const postImages = post.image_urls.map((url: string, index: number) => ({
      post_id: postData.id,
      image_url: url,
      order_index: index,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    const { error: imagesError } = await supabase
      .from('post_images')
      .insert(postImages)

    if (imagesError) {
      // 投稿を削除（ロールバック）
      await supabase
        .from('posts')
        .delete()
        .eq('id', postData.id)
      
      return NextResponse.json({ error: imagesError.message }, { status: 400 })
    }

    // 作成した投稿を取得（画像情報を含む）
    const { data: createdPost, error: fetchError } = await supabase
      .from('posts')
      .select('*, users(*), post_images(*)')
      .eq('id', postData.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 })
    }

    return NextResponse.json({ post: createdPost })
  } catch (error) {
    console.error('投稿エラー:', error)
    return NextResponse.json(
      { error: '投稿の作成に失敗しました' },
      { status: 500 }
    )
  }
} 