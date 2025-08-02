import { z } from "zod";

// 共通バリデーション関数
export function validatePassword(password: string): string | null {
	if (password.length < 8) {
		return "パスワードは8文字以上で入力してください";
	}
	if (password.length > 128) {
		return "パスワードは128文字以下で入力してください";
	}
	return null;
}

// 共通zodスキーマ
export const passwordZod = z
	.string()
	.min(8, "パスワードは8文字以上で入力してください")
	.max(128, "パスワードは128文字以下で入力してください");
