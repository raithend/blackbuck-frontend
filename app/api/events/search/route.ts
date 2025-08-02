import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q");

		if (!query || query.trim() === "") {
			return NextResponse.json({ events: [] });
		}

		const supabase = await createClient();

		// イベントを検索（名前で部分一致）
		const { data: events, error } = await supabase
			.from("events")
			.select("id, name, description")
			.ilike("name", `%${query.trim()}%`)
			.limit(10);

		if (error) {
			console.error("イベント検索エラー:", error);
			return NextResponse.json(
				{ error: "イベント検索に失敗しました" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ events: events || [] });
	} catch (error) {
		console.error("イベント検索エラー:", error);
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 },
		);
	}
}
