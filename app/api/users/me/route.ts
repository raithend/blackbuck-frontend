import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		// Authorizationヘッダーからアクセストークンを取得
		const authHeader = request.headers.get("authorization");
		const accessToken = authHeader?.replace("Bearer ", "");

		if (!accessToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// アクセストークンを使ってSupabaseクライアントを作成
		const supabase = await createClient(accessToken);

		// ユーザー情報を取得
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			console.error("ユーザー取得エラー:", userError);
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// usersテーブルからプロフィール取得
		const { data: profile, error: profileError } = await supabase
			.from("users")
			.select("*")
			.eq("id", user.id)
			.single();

		// プロフィールが存在しない場合、自動的に作成
		if (profileError && profileError.code === 'PGRST116') {
			console.log("プロフィールが存在しないため、自動作成します:", user.id);
			
			// OAuthユーザーの場合、名前を取得
			const name = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'ユーザー';
			const accountId = user.email || `user_${user.id}`;
			
			// プロフィールを作成
			const { data: newProfile, error: createError } = await supabase
				.from("users")
				.insert({
					id: user.id,
					username: name,
					account_id: accountId,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				})
				.select()
				.single();

			if (createError) {
				console.error("プロフィール作成エラー:", createError);
				return NextResponse.json(
					{ error: createError.message },
					{ status: 500 },
				);
			}

			console.log("プロフィール作成成功:", newProfile);
			return NextResponse.json({ user: newProfile });
		}

		if (profileError) {
			console.error("プロフィール取得エラー:", profileError);
			return NextResponse.json(
				{ error: profileError.message },
				{ status: 500 },
			);
		}

		if (!profile) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json({ user: profile });
	} catch (error) {
		console.error("エラー:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		// Authorizationヘッダーからアクセストークンを取得
		const authHeader = request.headers.get("authorization");
		const accessToken = authHeader?.replace("Bearer ", "");

		if (!accessToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// アクセストークンを使ってSupabaseクライアントを作成
		const supabase = await createClient(accessToken);

		// ユーザー情報を取得
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			console.error("ユーザー取得エラー:", userError);
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// リクエストボディから更新データを取得
		const { username, bio, header_url, avatar_url } = await request.json();

		// 更新データのバリデーション
		if (username !== undefined && (typeof username !== "string" || username.length > 50)) {
			return NextResponse.json(
				{ error: "ユーザー名は50文字以内で入力してください" },
				{ status: 400 },
			);
		}

		if (bio !== undefined && (typeof bio !== "string" || bio.length > 500)) {
			return NextResponse.json(
				{ error: "自己紹介は500文字以内で入力してください" },
				{ status: 400 },
			);
		}

		if (header_url !== undefined && typeof header_url !== "string") {
			return NextResponse.json(
				{ error: "ヘッダー画像URLは文字列で入力してください" },
				{ status: 400 },
			);
		}

		if (avatar_url !== undefined && typeof avatar_url !== "string") {
			return NextResponse.json(
				{ error: "アバター画像URLは文字列で入力してください" },
				{ status: 400 },
			);
		}

		// 更新するフィールドを準備
		const updateData: { 
			username?: string; 
			bio?: string; 
			header_url?: string | null; 
			avatar_url?: string | null; 
		} = {};
		if (username !== undefined) updateData.username = username;
		if (bio !== undefined) updateData.bio = bio;
		if (header_url !== undefined) updateData.header_url = header_url;
		if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

		// usersテーブルを更新
		const { data: updatedProfile, error: updateError } = await supabase
			.from("users")
			.update(updateData)
			.eq("id", user.id)
			.select()
			.single();

		if (updateError) {
			console.error("プロフィール更新エラー:", updateError);
			return NextResponse.json(
				{ error: updateError.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ user: updatedProfile });
	} catch (error) {
		console.error("エラー:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
