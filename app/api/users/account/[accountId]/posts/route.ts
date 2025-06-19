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

		// 投稿データを整形（ユーザー情報を含める）
		const formattedPosts = posts?.map(post => ({
			...post,
			user: user,
			post_images: post.post_images?.sort((a, b) => a.order_index - b.order_index) || []
		})) || [];

		return NextResponse.json({ posts: formattedPosts });
	} catch (error) {
		console.error("エラー:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
} 