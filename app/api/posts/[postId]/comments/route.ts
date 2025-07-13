import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(
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

		// 認証されたSupabaseクライアントを作成
		const supabaseWithAuth = await createClient(token);

		// トークンの検証
		const { data: { user }, error: authError } = await supabaseWithAuth.auth.getUser();
		if (authError || !user) {
			return NextResponse.json(
				{ error: "認証が必要です" },
				{ status: 401 }
			);
		}

		// 投稿の存在確認
		const { data: post, error: postError } = await supabaseWithAuth
			.from("posts")
			.select("id")
			.eq("id", postId)
			.single();

		if (postError || !post) {
			return NextResponse.json(
				{ error: "投稿が見つかりません" },
				{ status: 404 }
			);
		}

		// リクエストボディを取得
		const { content, location, event, classification, imageUrls, parentCommentId } = await request.json();

		// コメント内容または画像のいずれかが必要
		if ((!content || content.trim() === "") && (!imageUrls || imageUrls.length === 0)) {
			return NextResponse.json(
				{ error: "コメント内容または画像のいずれかが必要です" },
				{ status: 400 }
			);
		}

		// コメントを作成
		const { data: comment, error: commentError } = await supabaseWithAuth
			.from("comments")
			.insert({
				content: content ? content.trim() : "",
				location: location || null,
				event: event || null,
				classification: classification || null,
				user_id: user.id,
				post_id: postId,
				parent_comment_id: parentCommentId || null,
			})
			.select()
			.single();

		if (commentError) {
			console.error("コメント作成エラー:", commentError);
			return NextResponse.json(
				{ error: "コメントの作成に失敗しました" },
				{ status: 500 }
			);
		}

		// 画像がある場合は追加
		if (imageUrls && imageUrls.length > 0) {
			const imageData = imageUrls.map((imageUrl: string, index: number) => ({
				comment_id: comment.id,
				image_url: imageUrl,
				order_index: index,
			}));

			const { error: imageError } = await supabaseWithAuth
				.from("comment_images")
				.insert(imageData);

			if (imageError) {
				console.error("コメント画像挿入エラー:", imageError);
				// 画像の挿入に失敗してもコメントは作成されているので、警告のみ
			}
		}

		return NextResponse.json({ 
			message: "コメントを投稿しました",
			comment 
		});
	} catch (error) {
		console.error("コメント投稿エラー:", error);
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 }
		);
	}
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ postId: string }> }
) {
	try {
		const { postId } = await params;
		const supabase = await createClient();

		// 投稿の存在確認
		const { data: post, error: postError } = await supabase
			.from("posts")
			.select("id")
			.eq("id", postId)
			.single();

		if (postError || !post) {
			return NextResponse.json(
				{ error: "投稿が見つかりません" },
				{ status: 404 }
			);
		}

		// コメントを取得（ユーザー情報と画像を含む）
		const { data: comments, error: commentsError } = await supabase
			.from("comments")
			.select(`
				*,
				user:users!comments_user_id_fkey (
					id,
					username,
					account_id,
					avatar_url
				),
				comment_images (
					id,
					image_url,
					order_index
				)
			`)
			.eq("post_id", postId)
			.order("created_at", { ascending: true });

		if (commentsError) {
			console.error("コメント取得エラー:", commentsError);
			return NextResponse.json(
				{ error: "コメントの取得に失敗しました" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ comments: comments || [] });
	} catch (error) {
		console.error("コメント取得エラー:", error);
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 }
		);
	}
} 