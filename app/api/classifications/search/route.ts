import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q");

		if (!query || query.trim() === "") {
			return NextResponse.json({ classifications: [] });
		}

		// 投稿の分類で部分一致検索
		const { data: classifications, error } = await supabase
			.from("posts")
			.select("classification")
			.not("classification", "is", null)
			.ilike("classification", `%${query}%`)
			.limit(10);

		if (error) {
			console.error("分類検索エラー:", error);
			return NextResponse.json(
				{ error: "分類検索に失敗しました" },
				{ status: 500 }
			);
		}

		// 重複を除去してユニークな分類を取得
		const uniqueClassifications = Array.from(
			new Set(classifications?.map(c => c.classification).filter(Boolean))
		).slice(0, 10);

		return NextResponse.json({ classifications: uniqueClassifications });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
} 