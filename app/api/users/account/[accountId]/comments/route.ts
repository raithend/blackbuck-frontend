import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ accountId: string }> }
) {
	try {
		const { accountId } = await params;

		if (!accountId) {
			return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
		}

		// Supabaseクライアントを作成
		const supabase = await createClient();

		// まずユーザー情報を取得
		const { data: user, error: userError } = await supabase
			.from("users")
			.select("*")
			.eq("account_id", accountId)
			.single();

		if (userError || !user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// ユーザーのコメントを取得（投稿情報と画像も含む）
		const { data: comments, error: commentsError } = await supabase
			.from("comments")
			.select(`
				*,
				posts (
					id,
					content,
					location,
					classification,
					event,
					created_at,
					updated_at,
					users (
						id,
						username,
						account_id,
						avatar_url
					),
					post_images (
						id,
						image_url,
						order_index
					)
				),
				comment_images (
					id,
					image_url,
					order_index
				)
			`)
			.eq("user_id", user.id)
			.order("created_at", { ascending: false });

		if (commentsError) {
			console.error("コメント取得エラー:", commentsError);
			return NextResponse.json(
				{ error: "コメントの取得に失敗しました" },
				{ status: 500 }
			);
		}

		// 各コメントのいいね数を取得
		const commentIds = comments?.map(comment => comment.id) || [];
		const { data: commentLikeCounts, error: commentLikeCountsError } = await supabase
			.from("comment_likes")
			.select("comment_id")
			.in("comment_id", commentIds);

		if (commentLikeCountsError) {
			console.error("コメントいいね数取得エラー:", commentLikeCountsError);
		}

		// コメントいいね数を集計
		const commentLikeCountMap = new Map<string, number>();
		for (const like of commentLikeCounts || []) {
			const count = commentLikeCountMap.get(like.comment_id) || 0;
			commentLikeCountMap.set(like.comment_id, count + 1);
		}

		// 認証済みユーザーの場合、いいね状態も取得
		let currentUser = null;
		let userCommentLikes: string[] = [];

		// Authorizationヘッダーからトークンを取得
		const authHeader = request.headers.get("Authorization");
		if (authHeader?.startsWith("Bearer ")) {
			const token = authHeader.split(" ")[1];
			const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
			
			if (authUser && !authError) {
				currentUser = authUser;
				
				const { data: userLikes, error: userLikesError } = await supabase
					.from("comment_likes")
					.select("comment_id")
					.eq("user_id", authUser.id);

				if (!userLikesError) {
					userCommentLikes = userLikes?.map(like => like.comment_id) || [];
				}
			}
		}

		// コメントデータを整形
		const formattedComments = comments?.map(comment => ({
			id: comment.id,
			content: comment.content,
			location: comment.location,
			event: (comment as any).event, // 型定義にeventフィールドが含まれていないためanyを使用
			classification: comment.classification,
			created_at: comment.created_at,
			updated_at: comment.updated_at,
			likeCount: commentLikeCountMap.get(comment.id) || 0,
			isLiked: userCommentLikes.includes(comment.id),
			post_id: comment.post_id,
			user: {
				id: user.id,
				account_id: user.account_id,
				username: user.username,
				avatar_url: user.avatar_url,
			},
			post: comment.posts ? {
				id: comment.posts.id,
				content: comment.posts.content,
				location: comment.posts.location,
				event: comment.posts.event,
				classification: comment.posts.classification,
				created_at: comment.posts.created_at,
				updated_at: comment.posts.updated_at,
				user: comment.posts.users,
				post_images: comment.posts.post_images?.sort((a, b) => a.order_index - b.order_index) || [],
			} : null,
			comment_images: comment.comment_images?.sort((a, b) => a.order_index - b.order_index) || [],
		})) || [];

		return NextResponse.json({ comments: formattedComments });
	} catch (error) {
		console.error("コメント取得エラー:", error);
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 }
		);
	}
} 