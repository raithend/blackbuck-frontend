import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { deleteMultipleFromS3 } from "@/app/lib/s3-utils";

// コメントの更新
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ commentId: string }> }
) {
	try {
		const { commentId } = await params;

		// 認証ヘッダーを確認
		const authHeader = request.headers.get("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return NextResponse.json(
				{ error: "認証が必要です" },
				{ status: 401 }
			);
		}

		const token = authHeader.split(" ")[1];

		// 認証されたSupabaseクライアントを作成
		const supabase = await createClient(token);

		// トークンの検証
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json(
				{ error: "認証が必要です" },
				{ status: 401 }
			);
		}

		// コメントの存在確認と所有者確認
		const { data: comment, error: commentError } = await supabase
			.from("comments")
			.select("id, user_id")
			.eq("id", commentId)
			.single();

		if (commentError || !comment) {
			return NextResponse.json(
				{ error: "コメントが見つかりません" },
				{ status: 404 }
			);
		}

		// 所有者確認
		if (comment.user_id !== user.id) {
			return NextResponse.json(
				{ error: "コメントの編集権限がありません" },
				{ status: 403 }
			);
		}

		// リクエストボディを取得
		const { content, location, event, classification, imageUrls } = await request.json();

		if (!content || content.trim() === "") {
			return NextResponse.json(
				{ error: "コメント内容は必須です" },
				{ status: 400 }
			);
		}

		// コメントを更新
		const { data: updatedComment, error: updateError } = await supabase
			.from("comments")
			.update({
				content: content.trim(),
				location: location || null,
				event: event || null,
				classification: classification || null,
			})
			.eq("id", commentId)
			.select()
			.single();

		if (updateError) {
			console.error("コメント更新エラー:", updateError);
			return NextResponse.json(
				{ error: "コメントの更新に失敗しました" },
				{ status: 500 }
			);
		}

		// 画像がある場合は更新
		if (imageUrls && imageUrls.length > 0) {
			// 既存の画像を削除
			await supabase
				.from("comment_images")
				.delete()
				.eq("comment_id", commentId);

			// 新しい画像を追加
			const imageData = imageUrls.map((imageUrl: string, index: number) => ({
				comment_id: commentId,
				image_url: imageUrl,
				order_index: index,
			}));

			const { error: imageError } = await supabase
				.from("comment_images")
				.insert(imageData);

			if (imageError) {
				console.error("コメント画像更新エラー:", imageError);
				// 画像の更新に失敗してもコメントは更新されているので、警告のみ
			}
		}

		return NextResponse.json({ 
			message: "コメントを更新しました",
			comment: updatedComment 
		});
	} catch (error) {
		console.error("コメント更新エラー:", error);
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 }
		);
	}
}

// コメントの削除
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ commentId: string }> }
) {
	try {
		const { commentId } = await params;

		// 認証ヘッダーを確認
		const authHeader = request.headers.get("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return NextResponse.json(
				{ error: "認証が必要です" },
				{ status: 401 }
			);
		}

		const token = authHeader.split(" ")[1];

		// 認証されたSupabaseクライアントを作成
		const supabase = await createClient(token);

		// トークンの検証
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json(
				{ error: "認証が必要です" },
				{ status: 401 }
			);
		}

		// コメントの存在確認と所有者確認
		const { data: comment, error: commentError } = await supabase
			.from("comments")
			.select("id, user_id")
			.eq("id", commentId)
			.single();

		if (commentError || !comment) {
			return NextResponse.json(
				{ error: "コメントが見つかりません" },
				{ status: 404 }
			);
		}

		// 所有者確認
		if (comment.user_id !== user.id) {
			return NextResponse.json(
				{ error: "コメントの削除権限がありません" },
				{ status: 403 }
			);
		}

		// コメント画像のURLを取得してS3から削除
		const { data: commentImages, error: commentImagesError } = await supabase
			.from("comment_images")
			.select("image_url")
			.eq("comment_id", commentId);

		if (commentImagesError) {
			console.error("コメント画像URL取得エラー:", commentImagesError);
		}

		// S3からコメント画像を削除
		if (commentImages && commentImages.length > 0) {
			const imageUrls = commentImages.map(img => img.image_url);
			const deleteResults = await deleteMultipleFromS3(imageUrls);
			console.log("コメント削除時のS3削除結果:", deleteResults);
		}

		// コメント画像レコードを削除
		await supabase
			.from("comment_images")
			.delete()
			.eq("comment_id", commentId);

		// コメントのいいねを削除
		await supabase
			.from("comment_likes")
			.delete()
			.eq("comment_id", commentId);

		// コメントを削除
		const { error: deleteError } = await supabase
			.from("comments")
			.delete()
			.eq("id", commentId);

		if (deleteError) {
			console.error("コメント削除エラー:", deleteError);
			return NextResponse.json(
				{ error: "コメントの削除に失敗しました" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ 
			message: "コメントを削除しました" 
		});
	} catch (error) {
		console.error("コメント削除エラー:", error);
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 }
		);
	}
} 