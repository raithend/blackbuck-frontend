import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'

export const app = new Hono()

// ミドルウェア
app.use('*', logger())
app.use('*', cors())

// エラーハンドリング
app.onError((err, c) => {
  console.error('API Error:', err)
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }
  return c.json({ error: err.message }, 500)
})

// 404ハンドリング
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
  }) 