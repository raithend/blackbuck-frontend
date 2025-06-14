import { Hono } from 'hono'

const healthRouter = new Hono()

// ヘルスチェックエンドポイント
healthRouter.get('/', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

export { healthRouter } 