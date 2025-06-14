import { Hono } from 'hono'
import { createClient } from '@/app/lib/supabase-server'
import { HTTPException } from 'hono/http-exception'

const posts = new Hono()

// 投稿一覧取得
posts.get('/', async (c) => {
  const supabase = await createClient()
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, users(*)')
    .order('created_at', { ascending: false })

  if (error) {
    throw new HTTPException(400, { message: error.message })
  }

  return c.json({ posts })
})

// 投稿詳細取得
posts.get('/:id', async (c) => {
  const id = c.req.param('id')
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('posts')
    .select('*, users(*)')
    .eq('id', id)
    .single()

  if (error) {
    throw new HTTPException(400, { message: error.message })
  }

  return c.json({ post })
})

// 投稿作成
posts.post('/', async (c) => {
  const post = await c.req.json()
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
    throw new HTTPException(400, { message: error.message })
  }

  return c.json({ post: data })
})

// 投稿更新
posts.put('/:id', async (c) => {
  const id = c.req.param('id')
  const updates = await c.req.json()
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('posts')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
})
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new HTTPException(400, { message: error.message })
  }

  return c.json({ post })
})

// 投稿削除
posts.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const supabase = await createClient()

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) {
    throw new HTTPException(400, { message: error.message })
  }

  return c.json({ message: '投稿を削除しました' })
})

export const postsRouter = posts 