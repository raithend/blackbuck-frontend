import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ accountId: string }> }
) {
	try {
		const supabase = await createClient();
		
		// paramsをawait
		const { accountId } = await params;

		// 対象ユーザーを取得
		const { data: targetUser, error: targetError } = await supabase
			.from("users")
			.select("id")
			.eq("account_id", accountId)
			.single();

		if (targetError || !targetUser) {
			console.error("対象ユーザー取得エラー:", targetError);
			return NextResponse.json(
				{ error: "ユーザーが見つかりません" },
				{ status: 404 }
			);
		}

		// ユーザーがいいねした投稿を取得
		const { data: likedPosts, error: likesError } = await supabase
			.from("likes")
			.select(`
				created_at,
				posts (
					id,
					content,
					location,
					classification,
					created_at,
					updated_at,
					user_id,
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
				)
			`)
			.eq("user_id", targetUser.id)
			.order("created_at", { ascending: false });

		if (likesError) {
			console.error("いいね投稿取得エラー:", likesError);
			return NextResponse.json(
				{ error: "いいねした投稿の取得に失敗しました" },
				{ status: 500 }
			);
		}

		// 各投稿のいいね数を取得
		const postIds = likedPosts?.map(like => like.posts.id) || [];
		const { data: likeCounts, error: likeCountsError } = await supabase
			.from("likes")
			.select("post_id")
			.in("post_id", postIds);

		if (likeCountsError) {
			console.error("いいね数取得エラー:", likeCountsError);
		}

		// いいね数を集計
		const likeCountMap = new Map<string, number>();
		for (const like of likeCounts || []) {
			const count = likeCountMap.get(like.post_id) || 0;
			likeCountMap.set(like.post_id, count + 1);
		}

		// 各投稿のコメント数を取得
		const { data: commentCounts, error: commentCountsError } = await supabase
			.from("comments")
			.select("post_id")
			.in("post_id", postIds);

		if (commentCountsError) {
			console.error("コメント数取得エラー:", commentCountsError);
		}

		// コメント数を集計
		const commentCountMap = new Map<string, number>();
		for (const comment of commentCounts || []) {
			if (comment.post_id) {
				const count = commentCountMap.get(comment.post_id) || 0;
				commentCountMap.set(comment.post_id, count + 1);
			}
		}

		// 投稿データを整形
		const formattedPosts = likedPosts?.map(like => ({
			id: like.posts.id,
			content: like.posts.content,
			location: like.posts.location,
			classification: like.posts.classification,
			created_at: like.posts.created_at,
			updated_at: like.posts.updated_at,
			likeCount: likeCountMap.get(like.posts.id) || 0,
			commentCount: commentCountMap.get(like.posts.id) || 0,
			isLiked: true, // いいねした投稿なので常にtrue
			likedAt: like.created_at,
			user: {
				id: like.posts.users.id,
				account_id: like.posts.users.account_id,
				username: like.posts.users.username,
				avatar_url: like.posts.users.avatar_url,
			},
			post_images: like.posts.post_images?.sort((a, b) => a.order_index - b.order_index) || [],
		})) || [];

		return NextResponse.json({ posts: formattedPosts });
	} catch (error) {
		console.error("いいね投稿取得エラー:", error);
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 }
		);
	}
} 