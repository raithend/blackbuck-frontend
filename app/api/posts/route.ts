import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// 投稿一覧取得
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		
		// クエリパラメータを取得
		const { searchParams } = new URL(request.url);
		const limit = Number.parseInt(searchParams.get('limit') || '20');
		const offset = Number.parseInt(searchParams.get('offset') || '0');
		const event = searchParams.get('event');
		const location = searchParams.get('location');
		const classification = searchParams.get('classification');

		// クエリビルダーを作成
		let query = supabase
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
			`);

		// フィルタリング条件を追加
		if (event) {
			query = query.eq('event', event);
		}
		if (location) {
			query = query.eq('location', location);
		}
		if (classification) {
			query = query.eq('classification', classification);
		}

		// 投稿を取得
		const { data: posts, error: postsError } = await query
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
		for (const like of likeCounts || []) {
			const count = likeCountMap.get(like.post_id) || 0;
			likeCountMap.set(like.post_id, count + 1);
		}

		// 投稿データを整形
		const formattedPosts = posts?.map(post => ({
			id: post.id,
			content: post.content,
			location: post.location,
			event: post.event,
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
		
		// Authorizationヘッダーからアクセストークンを取得
		const authHeader = request.headers.get("authorization");
		const accessToken = authHeader?.replace("Bearer ", "");

		if (!accessToken) {
			return NextResponse.json(
				{ error: "認証が必要です" },
				{ status: 401 }
			);
		}

		// アクセストークンを使ってSupabaseクライアントを作成
		const supabaseWithAuth = await createClient(accessToken);

		// ユーザー情報を取得
		const { data: { user }, error: authError } = await supabaseWithAuth.auth.getUser();
		if (authError || !user) {
			return NextResponse.json(
				{ error: "認証が必要です" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { content, classification, location, event, image_urls } = body;

		// 投稿内容または画像のいずれかが必要
		if (!content && (!image_urls || image_urls.length === 0)) {
			return NextResponse.json(
				{ error: "投稿内容または画像のいずれかが必要です" },
				{ status: 400 }
			);
		}

		// 投稿を作成
		const { data: post, error: postError } = await supabaseWithAuth
			.from("posts")
			.insert({
				user_id: user.id,
				content: content || "",
				classification,
				location,
				event,
			})
			.select()
			.single();

		if (postError) {
			return NextResponse.json(
				{ error: "投稿の作成に失敗しました" },
				{ status: 500 }
			);
		}

		// 画像がある場合はpost_imagesテーブルに挿入
		if (image_urls && image_urls.length > 0) {
			const imageData = image_urls.map((url: string, index: number) => ({
				post_id: post.id,
				image_url: url,
				order_index: index,
			}));

			const { error: imageError } = await supabaseWithAuth
				.from("post_images")
				.insert(imageData);

			if (imageError) {
				return NextResponse.json(
					{ error: "画像の保存に失敗しました" },
					{ status: 500 }
				);
			}
		}

		return NextResponse.json({ success: true, post });
	} catch (error) {
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 }
		);
	}
}
