import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const accountId = searchParams.get("account_id");

		if (!accountId) {
			return NextResponse.json(
				{ error: "account_id is required" },
				{ status: 400 },
			);
		}

		const supabase = await createClient();

		// プロフィールページ用のビューを使用
		const { data: photoBubbles, error } = await supabase
			.from("profile_photo_bubbles")
			.select("*")
			.eq("profile_user_id", accountId)
			.order("created_at", { ascending: true });

		if (error) {
			console.error("Error fetching profile photo bubbles:", error);
			return NextResponse.json(
				{ error: "Failed to fetch profile photo bubbles" },
				{ status: 500 },
			);
		}

		return NextResponse.json(photoBubbles);
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
