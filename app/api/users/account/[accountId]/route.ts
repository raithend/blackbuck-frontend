import { createClient } from "@/app/lib/supabase-server";
import { handleUserFetchError } from "@/app/lib/user-api-utils";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ accountId: string }> },
) {
	try {
		const { accountId } = await params;

		if (!accountId) {
			return NextResponse.json(
				{ error: "Account ID is required" },
				{ status: 400 },
			);
		}

		// Supabaseクライアントを作成（認証不要でユーザー情報を取得）
		const supabase = await createClient();

		// account_idフィールドでユーザーを検索
		const { data: user, error } = await supabase
			.from("users")
			.select("*")
			.eq("account_id", accountId)
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
