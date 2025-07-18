import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ postId: string }> }
) {
	try {
		const { postId } = await params;
		const supabase = await createClient();

		// 認証トークンの取得
		const authHeader = request.headers.get("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return NextResponse.json(
				{ error: "認証が必要です" },
				{ status: 401 }
			);
		}

		const token = authHeader.split(" ")[1];

		// トークンの検証
		const { data: { user }, error: authError } = await supabase.auth.getUser(token);
		if (authError || !user) {
			return NextResponse.json(
				{ error: "認証が必要です" },
				{ status: 401 }
			);
		}

		// 投稿の所有者チェック
		const { data: post, error: postError } = await supabase
			.from("posts")
			.select("user_id")
			.eq("id", postId)
			.single();

		if (postError || !post) {
			return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
		}

		if (post.user_id !== user.id) {
			return NextResponse.json({ error: "投稿の編集権限がありません" }, { status: 403 });
		}

		// リクエストボディを取得
		const { content, location, classification, event, imageUrls } = await request.json();

		// 投稿を更新
		const { error: updateError } = await supabase
			.from("posts")
			.update({
				content,
				location,
				classification,
				event,
				updated_at: new Date().toISOString(),
			})
			.eq("id", postId);

		if (updateError) {
			return NextResponse.json(
				{ error: updateError.message },
				{ status: 500 }
			);
		}

		// 既存の画像を削除
		const { error: deleteImagesError } = await supabase
			.from("post_images")
			.delete()
			.eq("post_id", postId);

		// 新しい画像を挿入
		if (imageUrls && imageUrls.length > 0) {
			const imageData = imageUrls.map((url: string, index: number) => ({
				post_id: postId,
				image_url: url,
				order_index: index,
			}));

			const { error: insertImagesError } = await supabase
				.from("post_images")
				.insert(imageData);

			if (insertImagesError) {
				return NextResponse.json(
					{ error: insertImagesError.message },
					{ status: 500 }
				);
			}
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ postId: string }> }
) {
	try {
		const { postId } = await params;

		if (!postId) {
			return NextResponse.json(
				{ error: "Post ID is required" },
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

		// 投稿の所有者を確認
		const { data: post, error: postError } = await supabaseWithAuth
			.from("posts")
			.select("user_id")
			.eq("id", postId)
			.single();

		if (postError || !post) {
			return NextResponse.json(
				{ error: "Post not found" },
				{ status: 404 }
			);
		}

		if (post.user_id !== user.id) {
			return NextResponse.json(
				{ error: "You can only delete your own posts" },
				{ status: 403 }
			);
		}

		// 関連する画像を削除
		const { error: imageError } = await supabaseWithAuth
			.from("post_images")
			.delete()
			.eq("post_id", postId);

		// 関連するいいねを削除
		const { error: likeError } = await supabaseWithAuth
			.from("likes")
			.delete()
			.eq("post_id", postId);

		// 投稿を削除
		const { error: deleteError } = await supabaseWithAuth
			.from("posts")
			.delete()
			.eq("id", postId);

		if (deleteError) {
			return NextResponse.json(
				{ error: deleteError.message },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
} 