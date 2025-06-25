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

		// 投稿を取得（ユーザー情報と画像情報を含む）
		const { data: posts, error: postsError } = await supabase
			.from("posts")
			.select(`
				*,
				users!posts_user_id_fkey (
					id,
					username,
					account_id,
					avatar_url
				),
				post_images (
					id,
					image_url
				)
			`)
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

		// 各投稿のいいね数を取得
		const postIds = posts?.map(post => post.id) || [];
		const { data: likeCounts, error: likeCountsError } = await supabase
			.from("likes")
			.select("post_id")
			.in("post_id", postIds);

		if (likeCountsError) {
			console.error("いいね数取得エラー:", likeCountsError);
		}

		// いいね数を集計
		const likeCountMap = new Map<string, number>();
		likeCounts?.forEach(like => {
			const count = likeCountMap.get(like.post_id) || 0;
			likeCountMap.set(like.post_id, count + 1);
		});

		// 投稿データを整形
		const formattedPosts = posts?.map(post => ({
			id: post.id,
			content: post.content,
			location: post.location,
			classification: post.classification,
			created_at: post.created_at,
			updated_at: post.updated_at,
			likeCount: likeCountMap.get(post.id) || 0,
			isLiked: userLikes.includes(post.id),
			user: {
				id: post.users.id,
				account_id: post.users.account_id,
				username: post.users.username,
				avatar_url: post.users.avatar_url,
			},
			post_images: post.post_images || [],
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
