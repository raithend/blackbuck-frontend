import { createClient } from "@/app/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ location: string }> }
) {
	try {
		const { location } = await params;

		if (!location) {
			return NextResponse.json({ error: "Location is required" }, { status: 400 });
		}

		const supabase = await createClient();

		// URLデコードしてlocationを取得
		const decodedLocation = decodeURIComponent(location);

		// locationsテーブルからlocationの詳細情報を取得
		const { data: locationData, error: locationError } = await supabase
			.from("locations")
			.select("*")
			.eq("name", decodedLocation)
			.single();

		// エラーが発生した場合でも、データが見つからない場合はnullを返す（404エラーは返さない）
		if (locationError) {
			// データが見つからない場合はnullを返す
			if (locationError.code === 'PGRST116') {
				return NextResponse.json({ location: null });
			}
			// その他のエラーの場合は500エラーを返す
			console.error("location取得エラー:", locationError);
			return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
		}

		return NextResponse.json({ location: locationData });
	} catch (error) {
		console.error("エラー:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ location: string }> }
) {
	try {
		const { location } = await params;

		if (!location) {
			return NextResponse.json({ error: "Location is required" }, { status: 400 });
		}

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

		// URLデコードしてlocationを取得
		const decodedLocation = decodeURIComponent(location);

		const updateData = await request.json();

		// バリデーション
		if (updateData.name !== undefined && (updateData.name.trim() === "")) {
			return NextResponse.json({ error: "場所名は空にできません" }, { status: 400 });
		}

		// locationを更新
		const { data: updatedLocation, error } = await supabase
			.from("locations")
			.update({
				name: updateData.name?.trim(),
				description: updateData.description?.trim() || null,
				avatar_url: updateData.avatar_url || null,
				header_url: updateData.header_url || null,
			})
			.eq("name", decodedLocation)
			.select()
			.single();

		if (error) {
			console.error("location更新エラー:", error);
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ location: updatedLocation });
	} catch (error) {
		console.error("エラー:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
} 