import { createClient } from "@/app/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ accountId: string }> }
) {
	try {
		const { accountId } = await params;

		if (!accountId) {
			return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
		}

		// Supabaseクライアントを作成
		const supabase = await createClient();

		// Authorizationヘッダーを確認
		const authHeader = request.headers.get("Authorization");
		console.log(`API: Authorization header = ${authHeader ? 'present' : 'missing'}`);

		// まずユーザー情報を取得
		const { data: user, error: userError } = await supabase
			.from("users")
			.select("*")
			.eq("account_id", accountId)
			.single();

		if (userError || !user) {
			console.error("ユーザー取得エラー:", userError);
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// ユーザーの投稿を取得（画像も含む）
		const { data: posts, error: postsError } = await supabase
			.from("posts")
			.select(`
				*,
				post_images (
					id,
					image_url,
					order_index
				)
			`)
			.eq("user_id", user.id)
			.order("created_at", { ascending: false });

		if (postsError) {
			console.error("投稿取得エラー:", postsError);
			return NextResponse.json(
				{ error: postsError.message },
				{ status: 500 },
			);
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

		console.log(`API: Like counts for posts:`, Object.fromEntries(likeCountMap));

		// 認証済みユーザーの場合、いいね状態も取得
		let currentUser = null;
		let userLikes: string[] = [];

		// Authorizationヘッダーからトークンを取得
		if (authHeader?.startsWith("Bearer ")) {
			const token = authHeader.split(" ")[1];
			const { data: { user }, error: authError } = await supabase.auth.getUser(token);
			
			console.log(`API: Auth error = ${authError?.message || 'none'}`);
			console.log(`API: Current user = ${user?.id || 'null'}`);
			
			if (user && !authError) {
				currentUser = user;
				
				const { data: likes, error: likesError } = await supabase
					.from("likes")
					.select("post_id")
					.eq("user_id", user.id);

				if (!likesError) {
					userLikes = likes?.map(like => like.post_id) || [];
					console.log(`API: User likes = [${userLikes.join(', ')}]`);
				} else {
					console.error("いいね取得エラー:", likesError);
				}
			}
		} else {
			console.log("API: No Authorization header found");
		}

		// 投稿データを整形（ユーザー情報といいね情報を含める）
		const formattedPosts = posts?.map(post => {
			const isLiked = userLikes.includes(post.id);
			const likeCount = likeCountMap.get(post.id) || 0;
			
			// デバッグ情報をコンソールに出力
			console.log(`API: Post ${post.id}: isLiked = ${isLiked}, likeCount = ${likeCount}, userLikes = [${userLikes.join(', ')}]`);
			
			return {
				...post,
				user: user,
				post_images: post.post_images?.sort((a, b) => a.order_index - b.order_index) || [],
				likeCount,
				isLiked,
			};
		}) || [];

		return NextResponse.json({ posts: formattedPosts });
	} catch (error) {
		console.error("エラー:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
} 