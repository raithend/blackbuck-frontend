import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
	try {
		// Authorizationヘッダーからアクセストークンを取得
		const authHeader = request.headers.get("authorization");
		const accessToken = authHeader?.replace("Bearer ", "");

		if (!accessToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// アクセストークンを使ってSupabaseクライアントを作成
		const supabase = await createClient(accessToken);
		
		// 認証チェック
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json(
				{ error: "認証が必要です" },
				{ status: 401 }
			);
		}

		// ユーザーのアカウントIDを取得
		const { data: userProfile, error: userError } = await supabase
			.from("users")
			.select("account_id")
			.eq("id", user.id)
			.single();

		if (userError || !userProfile) {
			return NextResponse.json(
				{ error: "ユーザーが見つかりません" },
				{ status: 404 }
			);
		}

		const accountId = userProfile.account_id;

		// 関連データを削除（外部キー制約があるため順序が重要）
		
		// 1. コメントのいいねを削除
		await supabase
			.from("comment_likes")
			.delete()
			.eq("account_id", accountId);

		// 2. コメント画像を削除
		await supabase
			.from("comment_images")
			.delete()
			.eq("account_id", accountId);

		// 3. コメントを削除
		await supabase
			.from("comments")
			.delete()
			.eq("account_id", accountId);

		// 4. 投稿のいいねを削除
		await supabase
			.from("likes")
			.delete()
			.eq("account_id", accountId);

		// 5. 投稿画像を削除
		await supabase
			.from("post_images")
			.delete()
			.eq("account_id", accountId);

		// 6. 投稿を削除
		await supabase
			.from("posts")
			.delete()
			.eq("account_id", accountId);

		// 7. フォロー関係を削除
		await supabase
			.from("follows")
			.delete()
			.or(`follower_id.eq.${accountId},following_id.eq.${accountId}`);

		// 8. フォトバブルを削除
		await supabase
			.from("photo_bubbles")
			.delete()
			.eq("account_id", accountId);

		// 9. イベントを削除
		await supabase
			.from("events")
			.delete()
			.eq("account_id", accountId);

		// 10. 場所を削除
		await supabase
			.from("locations")
			.delete()
			.eq("account_id", accountId);

		// 11. 分類データを削除
		await supabase
			.from("classifications")
			.delete()
			.eq("account_id", accountId);

		// 12. 系統樹データを削除
		await supabase
			.from("phylogenetic_trees")
			.delete()
			.eq("account_id", accountId);

		// 13. 生息地データを削除
		await supabase
			.from("habitat_data")
			.delete()
			.eq("account_id", accountId);

		// 14. ユーザーを削除
		const { error: deleteUserTableError } = await supabase
			.from("users")
			.delete()
			.eq("id", user.id);

		if (deleteUserTableError) {
			console.error("ユーザーテーブル削除エラー:", deleteUserTableError);
			return NextResponse.json(
				{ error: "ユーザーの削除に失敗しました" },
				{ status: 500 }
			);
		}

		// 15. Supabase Authのユーザーを削除
		const { error: deleteAuthUserError } = await supabase.auth.admin.deleteUser(user.id);
		
		if (deleteAuthUserError) {
			console.error("認証ユーザー削除エラー:", deleteAuthUserError);
			// ユーザーテーブルは削除済みなので、エラーでも成功として扱う
		}

		return NextResponse.json(
			{ message: "アカウントが正常に削除されました" },
			{ status: 200 }
		);

	} catch (error) {
		console.error("アカウント削除エラー:", error);
		return NextResponse.json(
			{ error: "アカウントの削除に失敗しました" },
			{ status: 500 }
		);
	}
} 