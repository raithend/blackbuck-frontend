import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// いいねの作成
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ postId: string }> },
) {
	try {
		// 認証トークンの取得
		const authHeader = request.headers.get("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
		}

		const token = authHeader.split(" ")[1];

		// 認証トークン付きでSupabaseクライアントを作成
		const supabase = await createClient(token);

		// トークンの検証
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
		}

		// paramsをawait
		const { postId } = await params;

		// 投稿の存在確認
		const { data: post, error: postError } = await supabase
			.from("posts")
			.select("id")
			.eq("id", postId)
			.single();

		if (postError || !post) {
			return NextResponse.json(
				{ error: "投稿が見つかりません" },
				{ status: 404 },
			);
		}

		// 既にいいねしているかチェック
		const { data: existingLike, error: checkError } = await supabase
			.from("likes")
			.select("id")
			.eq("user_id", user.id)
			.eq("post_id", postId)
			.single();

		if (existingLike) {
			return NextResponse.json(
				{ error: "既にいいねしています" },
				{ status: 400 },
			);
		}

		// いいねを作成
		const { data: like, error: likeError } = await supabase
			.from("likes")
			.insert({
				user_id: user.id,
				post_id: postId,
			})
			.select()
			.single();

		if (likeError) {
			console.error("いいね作成エラー:", likeError);
			return NextResponse.json(
				{ error: "いいねの作成に失敗しました" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true, like });
	} catch (error) {
		console.error("いいね作成エラー:", error);
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 },
		);
	}
}

// いいねの削除
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ postId: string }> },
) {
	try {
		// 認証トークンの取得
		const authHeader = request.headers.get("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
		}

		const token = authHeader.split(" ")[1];

		// 認証トークン付きでSupabaseクライアントを作成
		const supabase = await createClient(token);

		// トークンの検証
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
		}

		// paramsをawait
		const { postId } = await params;

		// いいねを削除
		const { error: deleteError } = await supabase
			.from("likes")
			.delete()
			.eq("user_id", user.id)
			.eq("post_id", postId);

		if (deleteError) {
			console.error("いいね削除エラー:", deleteError);
			return NextResponse.json(
				{ error: "いいねの削除に失敗しました" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("いいね削除エラー:", error);
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 },
		);
	}
}

// いいねの状態取得
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ postId: string }> },
) {
	try {
		// paramsをawait
		const { postId } = await params;

		// 認証ヘッダーを確認
		const authHeader = request.headers.get("Authorization");
		let supabase;
		let user = null;

		if (authHeader?.startsWith("Bearer ")) {
			const token = authHeader.split(" ")[1];
			// 認証トークン付きでSupabaseクライアントを作成
			supabase = await createClient(token);
			const {
				data: { user: authUser },
			} = await supabase.auth.getUser();
			user = authUser;
		} else {
			// 認証なしでSupabaseクライアントを作成
			supabase = await createClient();
		}

		// いいね数を取得
		const { data: likeCount, error: countError } = await supabase
			.from("likes")
			.select("id", { count: "exact" })
			.eq("post_id", postId);

		if (countError) {
			console.error("いいね数取得エラー:", countError);
			return NextResponse.json(
				{ error: "いいね数の取得に失敗しました" },
				{ status: 500 },
			);
		}

		// 認証済みユーザーの場合、いいね状態も取得
		let isLiked = false;

		if (user) {
			const { data: userLike, error: userLikeError } = await supabase
				.from("likes")
				.select("id")
				.eq("user_id", user.id)
				.eq("post_id", postId)
				.single();

			isLiked = !!userLike;
		}

		return NextResponse.json({
			likeCount: likeCount?.length || 0,
			isLiked,
		});
	} catch (error) {
		console.error("いいね状態取得エラー:", error);
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 },
		);
	}
}
