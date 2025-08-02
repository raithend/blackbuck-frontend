import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
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
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();

		// Authorizationヘッダーからアクセストークンを取得
		const authHeader = request.headers.get("Authorization");
		const accessToken = authHeader?.replace("Bearer ", "");

		if (!accessToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// アクセストークンを使ってSupabaseクライアントを作成
		const supabaseWithAuth = await createClient(accessToken);

		// ユーザー情報を取得
		const {
			data: { user },
			error: authError,
		} = await supabaseWithAuth.auth.getUser();
		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// リクエストボディからデータを取得
		const locationData = await request.json();
		const { name, description, address, latitude, longitude } = locationData;

		if (!name) {
			return NextResponse.json(
				{ error: "Location name is required" },
				{ status: 400 },
			);
		}

		// locationsテーブルにデータを挿入
		const { data: location, error: insertError } = await supabaseWithAuth
			.from("locations")
			.insert({
				name,
				description,
				address,
				latitude,
				longitude,
				created_by: user.id,
			})
			.select()
			.single();

		if (insertError) {
			return NextResponse.json({ error: insertError.message }, { status: 500 });
		}

		return NextResponse.json({ location });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
