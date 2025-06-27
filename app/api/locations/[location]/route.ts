import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: { location: string } }
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
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { location: string } }
) {
	try {
		const { location: locationName } = await params;

		if (!locationName) {
			return NextResponse.json(
				{ error: "Location name is required" },
				{ status: 400 }
			);
		}

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
		const { data: { user }, error: authError } = await supabaseWithAuth.auth.getUser();
		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// リクエストボディから更新データを取得
		const updateData = await request.json();
		const { name, description, address, latitude, longitude } = updateData;

		// locationsテーブルを更新
		const { data: updatedLocation, error: updateError } = await supabaseWithAuth
			.from("locations")
			.update({
				name,
				description,
				address,
				latitude,
				longitude,
			})
			.eq("name", locationName)
			.eq("created_by", user.id)
			.select()
			.single();

		if (updateError) {
			return NextResponse.json(
				{ error: updateError.message },
				{ status: 500 }
			);
		}

		return NextResponse.json({ location: updatedLocation });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
} 