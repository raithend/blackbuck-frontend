import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase-server";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const pageUrl = searchParams.get('page_url');

		if (!pageUrl) {
			return NextResponse.json(
				{ error: 'page_url parameter is required' },
				{ status: 400 }
			);
		}

		const supabase = await createClient();

		const { data: photoBubbles, error } = await supabase
			.from('photo_bubbles')
			.select('*')
			.eq('page_url', pageUrl)
			.order('created_at', { ascending: true });

		if (error) {
			return NextResponse.json(
				{ error: 'Failed to fetch photo bubbles' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ photoBubbles: photoBubbles || [] });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();
		
		// Authorizationヘッダーからアクセストークンを取得
		const authHeader = request.headers.get("authorization");
		const accessToken = authHeader?.replace("Bearer ", "");

		if (!accessToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// アクセストークンを使ってSupabaseクライアントを作成
		const supabaseWithAuth = await createClient(accessToken);

		// ユーザー情報を取得
		const {
			data: { user },
			error: userError,
		} = await supabaseWithAuth.auth.getUser();

		if (userError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// ユーザープロフィールを取得
		const { data: profile, error: profileError } = await supabaseWithAuth
			.from("users")
			.select("*")
			.eq("id", user.id)
			.single();

		if (profileError || !profile) {
			return NextResponse.json(
				{ error: "User profile not found" },
				{ status: 404 },
			);
		}

		// リクエストボディからデータを取得
		const body = await request.json();
		const { name, page_url, image_url, target_url, x_position, y_position } = body;

		if (!name || !page_url || !image_url) {
			return NextResponse.json(
				{ error: "name, page_url, and image_url are required" },
				{ status: 400 },
			);
		}

		// photo_bubblesテーブルにデータを挿入
		const { data: photoBubble, error: insertError } = await supabaseWithAuth
			.from("photo_bubbles")
			.insert({
				user_id: user.id,
				name,
				page_url,
				image_url,
				target_url: target_url || null,
				x_position: x_position || 0,
				y_position: y_position || 0,
			})
			.select()
			.single();

		if (insertError) {
			return NextResponse.json(
				{ error: insertError.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ photoBubble });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const supabase = await createClient();
		
		// Authorizationヘッダーからアクセストークンを取得
		const authHeader = request.headers.get("authorization");
		const accessToken = authHeader?.replace("Bearer ", "");

		if (!accessToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// アクセストークンを使ってSupabaseクライアントを作成
		const supabaseWithAuth = await createClient(accessToken);

		// ユーザー情報を取得
		const {
			data: { user },
			error: userError,
		} = await supabaseWithAuth.auth.getUser();

		if (userError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// クエリパラメータからIDを取得
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "ID is required" },
				{ status: 400 },
			);
		}

		// リクエストボディから更新データを取得
		const body = await request.json();
		const { name, page_url, image_url, target_url, x_position, y_position } = body;

		// photo_bubblesテーブルを更新
		const updateData: any = {};
		if (name !== undefined) updateData.name = name;
		if (page_url !== undefined) updateData.page_url = page_url;
		if (image_url !== undefined) updateData.image_url = image_url;
		if (target_url !== undefined) updateData.target_url = target_url;
		if (x_position !== undefined) updateData.x_position = x_position;
		if (y_position !== undefined) updateData.y_position = y_position;

		const { data: updatedPhotoBubble, error: updateError } = await supabaseWithAuth
			.from("photo_bubbles")
			.update(updateData)
			.eq("id", id)
			.eq("user_id", user.id)
			.select()
			.single();

		if (updateError) {
			return NextResponse.json(
				{ error: updateError.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ photoBubble: updatedPhotoBubble });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const supabase = await createClient();
		
		// Authorizationヘッダーからアクセストークンを取得
		const authHeader = request.headers.get("authorization");
		const accessToken = authHeader?.replace("Bearer ", "");

		if (!accessToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// アクセストークンを使ってSupabaseクライアントを作成
		const supabaseWithAuth = await createClient(accessToken);

		// ユーザー情報を取得
		const {
			data: { user },
			error: userError,
		} = await supabaseWithAuth.auth.getUser();

		if (userError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// クエリパラメータからIDを取得
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "ID is required" },
				{ status: 400 },
			);
		}

		// photo_bubblesテーブルから削除
		const { error: deleteError } = await supabaseWithAuth
			.from("photo_bubbles")
			.delete()
			.eq("id", id)
			.eq("user_id", user.id);

		if (deleteError) {
			return NextResponse.json(
				{ error: deleteError.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
} 