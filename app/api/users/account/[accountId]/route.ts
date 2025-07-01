import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ accountId: string }> }
) {
	try {
		const { accountId } = await params;

		if (!accountId) {
			return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
		}

		// Supabaseクライアントを作成（認証不要でユーザー情報を取得）
		const supabase = await createClient();

		// account_idでユーザーを検索
		const { data: user, error } = await supabase
			.from("users")
			.select("*")
			.eq("account_id", accountId)
			.single();

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

		return NextResponse.json({ user });
	} catch (error) {
		console.error("エラー:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
} 