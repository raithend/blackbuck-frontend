import { createClient } from '@/app/lib/supabase-server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function GET() {
  try {
    const supabase = await createClient()

    // すべての投稿からclassificationを取得
    const { data: posts, error } = await supabase
      .from('posts')
      .select('classification')
      .not('classification', 'is', null)

    if (error) {
      throw error
    }

    // 重複を除去した分類名の配列を作成
    const classifications = Array.from(
      new Set(posts.map(post => post.classification))
    ).filter(Boolean) as string[]

    return NextResponse.json({ classifications })
  } catch (error) {
    console.error('Error fetching classifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch classifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { classification } = await request.json()

    const supabase = await createClient()

    // すべての投稿からclassificationを取得
    const { data: posts, error } = await supabase
      .from('posts')
      .select('classification')
      .not('classification', 'is', null)

    if (error) {
      throw error
    }

    // 重複を除去した分類名の配列を作成
    const classifications = Array.from(
      new Set(posts.map(post => post.classification))
    ).filter(Boolean) as string[]

    // Claude APIにリクエストを送信
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `以下の分類名のリストから、「${classification}」に属する生物名のみを抽出してください。
          結果はJSONの配列形式で返してください。
          
          分類名リスト：
          ${JSON.stringify(classifications)}`
        }
      ]
    })

    // Claude APIの応答をパース
    const response = message.content[0].type === 'text' ? message.content[0].text : ''
    const matchedClassifications = JSON.parse(response)

    return NextResponse.json({ classifications: matchedClassifications })
  } catch (error) {
    console.error('Error processing classification:', error)
    return NextResponse.json(
      { error: 'Failed to process classification' },
      { status: 500 }
    )
  }
} 