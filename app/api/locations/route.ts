import { createClient } from "@/app/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const supabase = await createClient();

		// locationsテーブルからlocation一覧を取得
		const { data: locations, error } = await supabase
			.from("locations")
			.select("*")
			.order("name", { ascending: true });

		if (error) {
			console.error("location取得エラー:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ locations: locations || [] });
	} catch (error) {
		console.error("エラー:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const supabase = await createClient();

		// 認証トークンの取得
		const authHeader = request.headers.get("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
		}

		const token = authHeader.split(" ")[1];

		// トークンの検証
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser(token);
		if (authError || !user) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
		}

		const locationData = await request.json();

		// バリデーション
		if (!locationData.name || locationData.name.trim() === "") {
			return NextResponse.json({ error: "場所名は必須です" }, { status: 400 });
		}

		// locationを作成
		const { data: createdLocation, error } = await supabase
			.from("locations")
			.insert({
				name: locationData.name.trim(),
				description: locationData.description?.trim() || null,
				avatar_url: locationData.avatar_url || null,
				header_url: locationData.header_url || null,
			})
			.select()
			.single();

		if (error) {
			console.error("location作成エラー:", error);
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ location: createdLocation });
	} catch (error) {
		console.error("エラー:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
} 