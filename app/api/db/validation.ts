import { z } from "zod";

// パスワードバリデーションスキーマ
export const passwordSchema = z
	.string()
	.min(8, "パスワードは8文字以上で入力してください")
	.max(128, "パスワードは128文字以下で入力してください");

// パスワード変更用スキーマ
export const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
	newPassword: passwordSchema,
});

// ユーザー関連のバリデーションスキーマ
export const userSchema = z.object({
	id: z.string().uuid(),
	account_id: z.string().min(1),
	name: z.string().min(1),
	avatar_url: z.string().url().nullable(),
	header_url: z.string().url().nullable(),
	bio: z.string().nullable(),
	created_at: z.date(),
	updated_at: z.date(),
});

export const createUserSchema = z.object({
	account_id: z.string().min(1),
	name: z.string().min(1),
	avatar_url: z.string().url().nullable().optional(),
	header_url: z.string().url().nullable().optional(),
	bio: z.string().nullable().optional(),
});

export const updateUserSchema = z.object({
	account_id: z.string().min(1).optional(),
	name: z.string().min(1).optional(),
	avatar_url: z.string().url().nullable().optional(),
	header_url: z.string().url().nullable().optional(),
	bio: z.string().nullable().optional(),
});

// 投稿関連のバリデーションスキーマ
export const postSchema = z.object({
	id: z.number(),
	content: z.string().min(1),
	location: z.string().nullable(),
	classification: z.string().nullable(),
	user_id: z.string().uuid(),
	created_at: z.date(),
	updated_at: z.date(),
});

export const postImageSchema = z.object({
	id: z.number(),
	url: z.string().url(),
	post_id: z.number(),
	created_at: z.date(),
	updated_at: z.date(),
});

export const createPostSchema = z.object({
	content: z.string().min(1, "投稿内容を入力してください"),
	location: z.string().nullable().optional(),
	classification: z.string().nullable().optional(),
	images: z.array(z.string().url()).optional(),
});

export const updatePostSchema = z.object({
	content: z.string().min(1).optional(),
	location: z.string().nullable().optional(),
	classification: z.string().nullable().optional(),
	images: z.array(z.string().url()).optional(),
});
