import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q");

		if (!query || query.trim() === "") {
			return NextResponse.json({ classifications: [] });
		}

		// postsテーブルから分類名を検索
		const { data: postClassifications, error: postError } = await supabase
			.from("posts")
			.select("classification")
			.not("classification", "is", null)
			.ilike("classification", `%${query}%`)
			.limit(10);

		if (postError) {
			console.error("投稿分類検索エラー:", postError);
			return NextResponse.json(
				{ error: "分類検索に失敗しました" },
				{ status: 500 },
			);
		}

		// classificationsテーブルから分類名を検索
		const { data: classificationData, error: classificationError } = await supabase
			.from("classifications")
			.select("name")
			.ilike("name", `%${query}%`)
			.limit(10);

		if (classificationError) {
			console.error("分類テーブル検索エラー:", classificationError);
			return NextResponse.json(
				{ error: "分類検索に失敗しました" },
				{ status: 500 },
			);
		}

		// 両方の結果を結合
		const postClassificationsList = postClassifications?.map((c) => c.classification).filter(Boolean) || [];
		const classificationNamesList = classificationData?.map((c) => c.name).filter(Boolean) || [];
		
		// 重複を除去してユニークな分類を取得
		const allClassifications = [...postClassificationsList, ...classificationNamesList];
		const uniqueClassifications = Array.from(new Set(allClassifications)).slice(0, 10);

		return NextResponse.json({ classifications: uniqueClassifications });
	} catch (error) {
		console.error("分類検索エラー:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
