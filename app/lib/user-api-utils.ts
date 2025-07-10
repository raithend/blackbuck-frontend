import { NextResponse } from "next/server";
import type { PostgrestError } from "@supabase/supabase-js";

// ユーザー取得エラーハンドリングの共通処理
export function handleUserFetchError(error: PostgrestError | null, user: any) {
	if (error) {
		console.error("ユーザー取得エラー:", error);
		if (error.code === "PGRST116") {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}
		return NextResponse.json(
			{ error: error.message },
			{ status: 500 },
		);
	}

	if (!user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	return null; // エラーがない場合
}

// UUID形式の検証
export function isValidUUID(uuid: string): boolean {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
} 