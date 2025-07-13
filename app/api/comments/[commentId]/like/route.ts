import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// いいねの追加
export async function POST(
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

		// コメントの存在確認
		const { data: comment, error: commentError } = await supabase
			.from("comments")
			.select("id")
			.eq("id", commentId)
			.single();

		if (commentError || !comment) {
			return NextResponse.json(
				{ error: "コメントが見つかりません" },
				{ status: 404 }
			);
		}

		// 既存のいいねを確認
		const { data: existingLike, error: existingLikeError } = await supabase
			.from("comment_likes")
			.select("id")
			.eq("user_id", user.id)
			.eq("comment_id", commentId)
			.single();

		if (existingLikeError && existingLikeError.code !== "PGRST116") {
			console.error("既存いいね確認エラー:", existingLikeError);
			return NextResponse.json(
				{ error: "いいねの確認に失敗しました" },
				{ status: 500 }
			);
		}

		// 既にいいねしている場合はエラー
		if (existingLike) {
			return NextResponse.json(
				{ error: "既にいいねしています" },
				{ status: 400 }
			);
		}

		// いいねを追加
		const { data: like, error: likeError } = await supabase
			.from("comment_likes")
			.insert({
				user_id: user.id,
				comment_id: commentId,
			})
			.select()
			.single();

		if (likeError) {
			console.error("いいね追加エラー:", likeError);
			return NextResponse.json(
				{ error: "いいねの追加に失敗しました" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ 
			message: "いいねを追加しました",
			like 
		});
	} catch (error) {
		console.error("いいね追加エラー:", error);
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 }
		);
	}
}

// いいねの削除
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

		// いいねを削除
		const { error: deleteError } = await supabase
			.from("comment_likes")
			.delete()
			.eq("user_id", user.id)
			.eq("comment_id", commentId);

		if (deleteError) {
			console.error("いいね削除エラー:", deleteError);
			return NextResponse.json(
				{ error: "いいねの削除に失敗しました" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ 
			message: "いいねを削除しました" 
		});
	} catch (error) {
		console.error("いいね削除エラー:", error);
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 }
		);
	}
}

// いいねの状態取得
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ commentId: string }> }
) {
	try {
		// paramsをawait
		const { commentId } = await params;

		// 認証ヘッダーを確認
		const authHeader = request.headers.get("Authorization");
		let supabase;
		let user = null;

		if (authHeader?.startsWith("Bearer ")) {
			const token = authHeader.split(" ")[1];
			// 認証トークン付きでSupabaseクライアントを作成
			supabase = await createClient(token);
			const { data: { user: authUser } } = await supabase.auth.getUser();
			user = authUser;
		} else {
			// 認証なしでSupabaseクライアントを作成
			supabase = await createClient();
		}

		// いいね数を取得
		const { data: likeCount, error: countError } = await supabase
			.from("comment_likes")
			.select("id", { count: "exact" })
			.eq("comment_id", commentId);

		if (countError) {
			console.error("いいね数取得エラー:", countError);
			return NextResponse.json(
				{ error: "いいね数の取得に失敗しました" },
				{ status: 500 }
			);
		}

		// 認証済みユーザーの場合、いいね状態も取得
		let isLiked = false;

		if (user) {
			const { data: userLike, error: userLikeError } = await supabase
				.from("comment_likes")
				.select("id")
				.eq("user_id", user.id)
				.eq("comment_id", commentId)
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
			{ status: 500 }
		);
	}
} 