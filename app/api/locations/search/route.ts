import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q");

		if (!query || query.trim() === "") {
			return NextResponse.json({ locations: [] });
		}

		// 場所名で部分一致検索
		const { data: locations, error } = await supabase
			.from("locations")
			.select(`
				id,
				name,
				description,
				avatar_url,
				header_url,
				created_at
			`)
			.ilike("name", `%${query}%`)
			.limit(10);

		if (error) {
			console.error("場所検索エラー:", error);
			return NextResponse.json(
				{ error: "場所検索に失敗しました" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ locations: locations || [] });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
} 