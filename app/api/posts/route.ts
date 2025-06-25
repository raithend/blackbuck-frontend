import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// 投稿一覧取得
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		
		// クエリパラメータを取得
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get('limit') || '20');
		const offset = parseInt(searchParams.get('offset') || '0');

		// 投稿を取得（いいね数も含める）
		const { data: posts, error: postsError } = await supabase
			.from("post_like_counts")
			.select("*")
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		if (postsError) {
			console.error("投稿取得エラー:", postsError);
			return NextResponse.json(
				{ error: "投稿の取得に失敗しました" },
				{ status: 500 }
			);
		}

		// 認証済みユーザーの場合、いいね状態も取得
		const { data: { user } } = await supabase.auth.getUser();
		let userLikes: string[] = [];

		if (user) {
			const { data: likes, error: likesError } = await supabase
				.from("likes")
				.select("post_id")
				.eq("user_id", user.id);

			if (!likesError) {
				userLikes = likes?.map(like => like.post_id) || [];
			}
		}

		// 投稿データを整形
		const formattedPosts = posts?.map(post => ({
			id: post.post_id,
			content: post.content,
			locationName: post.location,
			createdAt: post.created_at,
			likeCount: post.like_count,
			isLiked: userLikes.includes(post.post_id || ''),
			user: {
				id: post.user_id,
				accountId: post.account_id,
				username: post.username,
				avatarUrl: post.avatar_url,
			},
		})) || [];

		return NextResponse.json({ posts: formattedPosts });
	} catch (error) {
		console.error("投稿取得エラー:", error);
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 }
		);
	}
}

// 投稿作成
export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();
		
		// 認証チェック
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json(
				{ error: "認証が必要です" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { content, classification, location } = body;

		if (!content) {
			return NextResponse.json(
				{ error: "投稿内容は必須です" },
				{ status: 400 }
			);
		}

		// 投稿を作成
		const { data: post, error: postError } = await supabase
			.from("posts")
			.insert({
				user_id: user.id,
				content,
				classification,
				location,
			})
			.select()
			.single();

		if (postError) {
			console.error("投稿作成エラー:", postError);
			return NextResponse.json(
				{ error: "投稿の作成に失敗しました" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, post });
	} catch (error) {
		console.error("投稿作成エラー:", error);
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 }
		);
	}
}
