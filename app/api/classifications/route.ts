import { createClient } from '@/app/lib/supabase-server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    
    if (!name) {
      return NextResponse.json({ error: 'Classification name is required' }, { status: 400 })
    }

    const decodedName = decodeURIComponent(name)
    const supabase = await createClient()

    // 1. すべての投稿からclassificationを取得
    const { data: allPosts, error: classificationError } = await supabase
      .from('posts')
      .select('classification')
      .not('classification', 'is', null)

    if (classificationError) {
      throw classificationError
    }

    // 重複を除去した分類名の配列を作成
    const classifications = Array.from(
      new Set(allPosts.map(post => post.classification))
    ).filter(Boolean) as string[]

    // 2. Claude APIに分類名と配列を送信
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `あなたは生物分類の専門家です。以下の分類名のリストから、「${decodedName}」に属する生物名のみを抽出してください。

必ず以下の形式のJSONで返答してください：
{"matchedClassifications": ["分類名1", "分類名2", ...]}

分類名が見つからない場合は空配列を返してください：
{"matchedClassifications": []}

分類名リスト：
${JSON.stringify(classifications)}`
        }
      ]
    })

    // Claude APIの応答をパース
    const response = message.content[0].type === 'text' ? message.content[0].text : ''
    
    // JSONの部分を抽出（余分なテキストがある場合に対応）
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in response:', response)
      return NextResponse.json({ posts: [] })
    }

    const parsedResponse = JSON.parse(jsonMatch[0])
    const matchedClassifications = parsedResponse.matchedClassifications

    if (!Array.isArray(matchedClassifications)) {
      console.error('Invalid response format:', parsedResponse)
      return NextResponse.json({ posts: [] })
    }

    // 3. マッチした分類名を持つ投稿を取得
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        user:users (
          id,
          username,
          avatar_url,
          account_id,
          bio,
          created_at,
          header_url,
          updated_at
        ),
        post_images (
          id,
          image_url,
          order_index
        )
      `)
      .in('classification', matchedClassifications)
      .order('created_at', { ascending: false })

    if (postsError) {
      throw postsError
    }

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error processing classifications:', error)
    return NextResponse.json(
      { error: 'Failed to process classifications' },
      { status: 500 }
    )
  }
}

// POSTリクエストのハンドラは一旦削除（別途開発予定） 