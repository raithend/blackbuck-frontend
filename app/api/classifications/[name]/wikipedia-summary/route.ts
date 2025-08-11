import { createClient } from "@/app/lib/supabase-server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ name: string }> },
) {
	try {
		const { name } = await params;
		
		// Authorizationヘッダーからアクセストークンを取得
		const authHeader = request.headers.get("authorization");
		const accessToken = authHeader?.replace("Bearer ", "");

		if (!accessToken) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
		}

		// アクセストークンを使ってSupabaseクライアントを作成
		const supabase = await createClient(accessToken);

		// ユーザー情報を取得
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
		}

		const decodedName = decodeURIComponent(name);

		// Wikipedia APIを使用して概要を取得
		const wikipediaResponse = await fetch(
			`https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(decodedName)}`,
			{
				headers: {
					"User-Agent":
						"BlackBuck-Frontend/1.0 (https://blackbuck-frontend.vercel.app)",
				},
			},
		);

		if (!wikipediaResponse.ok) {
			// Wikipediaに記事が見つからない場合、英語版を試す
			const englishResponse = await fetch(
				`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(decodedName)}`,
				{
					headers: {
						"User-Agent":
							"BlackBuck-Frontend/1.0 (https://blackbuck-frontend.vercel.app)",
					},
				},
			);

			if (!englishResponse.ok) {
				return NextResponse.json(
					{ error: "Wikipediaに該当する記事が見つかりませんでした" },
					{ status: 404 },
				);
			}

			const englishData = await englishResponse.json();
			return NextResponse.json({
				summary: englishData.extract,
				title: englishData.title,
				url: englishData.content_urls?.desktop?.page,
				language: "en",
			});
		}

		const data = await wikipediaResponse.json();

		return NextResponse.json({
			summary: data.extract,
			title: data.title,
			url: data.content_urls?.desktop?.page,
			language: "ja",
		});
	} catch (error) {
		console.error("Wikipedia API エラー:", error);
		return NextResponse.json(
			{ error: "Wikipedia APIの呼び出しに失敗しました" },
			{ status: 500 },
		);
	}
}
