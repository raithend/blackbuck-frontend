import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

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
		const { content, location, classification, imageUrls } = await request.json();

		// 投稿を更新
		const { error: updateError } = await supabase
			.from("posts")
			.update({
				content,
				location,
				classification,
				updated_at: new Date().toISOString(),
			})
			.eq("id", postId);

		if (updateError) {
			console.error("投稿更新エラー:", updateError);
			return NextResponse.json({ error: "投稿の更新に失敗しました" }, { status: 500 });
		}

		// 既存の画像を削除
		const { error: deleteImagesError } = await supabase
			.from("post_images")
			.delete()
			.eq("post_id", postId);

		if (deleteImagesError) {
			console.error("既存画像削除エラー:", deleteImagesError);
		}

		// 新しい画像を追加
		if (imageUrls && imageUrls.length > 0) {
			const imageData = imageUrls.map((imageUrl: string, index: number) => ({
				post_id: postId,
				image_url: imageUrl,
				order: index,
			}));

			const { error: insertImagesError } = await supabase
				.from("post_images")
				.insert(imageData);

			if (insertImagesError) {
				console.error("画像挿入エラー:", insertImagesError);
				return NextResponse.json({ error: "画像の更新に失敗しました" }, { status: 500 });
			}
		}

		return NextResponse.json({ message: "投稿を更新しました" });
	} catch (error) {
		console.error("投稿更新エラー:", error);
		return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
	}
}

export async function DELETE(
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
			return NextResponse.json({ error: "投稿の削除権限がありません" }, { status: 403 });
		}

		// 関連する画像を削除
		const { error: imageError } = await supabase
			.from("post_images")
			.delete()
			.eq("post_id", postId);

		if (imageError) {
			console.error("画像削除エラー:", imageError);
		}

		// 関連するいいねを削除
		const { error: likeError } = await supabase
			.from("likes")
			.delete()
			.eq("post_id", postId);

		if (likeError) {
			console.error("いいね削除エラー:", likeError);
		}

		// 投稿を削除
		const { error: deleteError } = await supabase
			.from("posts")
			.delete()
			.eq("id", postId);

		if (deleteError) {
			console.error("投稿削除エラー:", deleteError);
			return NextResponse.json({ error: "投稿の削除に失敗しました" }, { status: 500 });
		}

		return NextResponse.json({ message: "投稿を削除しました" });
	} catch (error) {
		console.error("投稿削除エラー:", error);
		return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
	}
} 