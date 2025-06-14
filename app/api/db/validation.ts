import { z } from 'zod'

// ユーザー関連のバリデーションスキーマ
export const userSchema = z.object({
  id: z.string().uuid(),
  account_id: z.string().min(1),
  name: z.string().min(1),
  avatar_url: z.string().url().nullable(),
  header_url: z.string().url().nullable(),
  bio: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date()
})

export const createUserSchema = z.object({
  account_id: z.string().min(1),
  name: z.string().min(1),
  avatar_url: z.string().url().nullable().optional(),
  header_url: z.string().url().nullable().optional(),
  bio: z.string().nullable().optional()
})

export const updateUserSchema = z.object({
  account_id: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  avatar_url: z.string().url().nullable().optional(),
  header_url: z.string().url().nullable().optional(),
  bio: z.string().nullable().optional()
})

// 投稿関連のバリデーションスキーマ
export const postSchema = z.object({
  id: z.number(),
  content: z.string().min(1),
  location: z.string().nullable(),
  classification: z.string().nullable(),
  user_id: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date()
})

export const postImageSchema = z.object({
  id: z.number(),
  url: z.string().url(),
  post_id: z.number(),
  created_at: z.date(),
  updated_at: z.date()
})

export const createPostSchema = z.object({
  content: z.string().min(1),
  location: z.string().nullable(),
  classification: z.string().nullable(),
  images: z.array(z.string().url()).optional()
})

export const updatePostSchema = z.object({
  content: z.string().min(1).optional(),
  location: z.string().nullable().optional(),
  classification: z.string().nullable().optional(),
  images: z.array(z.string().url()).optional()
}) 