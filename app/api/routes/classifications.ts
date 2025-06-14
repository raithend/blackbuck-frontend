import { Hono } from 'hono'

const classifications = new Hono()

classifications.get('/', async (c) => {
  return c.json({ message: 'Classifications endpoint' })
})

export { classifications } 