import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q");

		if (!query || query.trim() === "") {
			return NextResponse.json({ users: [] });
		}

		// ユーザー名またはアカウントIDで部分一致検索
		const { data: users, error } = await supabase
			.from("users")
			.select(`
				id,
				username,
				account_id,
				avatar_url,
				created_at
			`)
			.or(`username.ilike.%${query}%,account_id.ilike.%${query}%`)
			.limit(10);

		if (error) {
			console.error("ユーザー検索エラー:", error);
			return NextResponse.json(
				{ error: "ユーザー検索に失敗しました" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ users: users || [] });
	} catch (error) {
		console.error("ユーザー検索エラー:", error);
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 }
		);
	}
} 