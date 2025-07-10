import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { handleUserFetchError, isValidUUID } from "@/app/lib/user-api-utils";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const { userId } = await params;

		if (!userId) {
			return NextResponse.json({ error: "User ID is required" }, { status: 400 });
		}

		// UUID形式の検証
		if (!isValidUUID(userId)) {
			return NextResponse.json({ error: "Invalid UUID format" }, { status: 400 });
		}

		// Supabaseクライアントを作成（認証不要でユーザー情報を取得）
		const supabase = await createClient();

		// idフィールドでユーザーを検索
		const { data: user, error } = await supabase
			.from("users")
			.select("*")
			.eq("id", userId)
			.single();

		// 共通エラーハンドリング
		const errorResponse = handleUserFetchError(error, user);
		if (errorResponse) return errorResponse;

		return NextResponse.json({ user });
	} catch (error) {
		console.error("エラー:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
} 