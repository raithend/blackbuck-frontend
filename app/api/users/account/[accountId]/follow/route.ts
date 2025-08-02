import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ accountId: string }> },
) {
	try {
		console.log("=== フォローAPI POST開始 ===");

		// 認証トークンの取得
		const authHeader = request.headers.get("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			console.log("認証ヘッダーが不正:", authHeader);
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
		}

		const token = authHeader.split(" ")[1];
		console.log("トークン取得完了");

		// 認証コンテキスト付きでSupabaseクライアントを作成
		const supabase = await createClient(token);

		// トークンの検証
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError || !user) {
			console.log("認証エラー:", authError);
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
		}
		console.log("認証成功, ユーザーID:", user.id);

		// paramsをawait
		const { accountId } = await params;
		console.log("対象アカウントID:", accountId);

		// フォロー対象のユーザーを取得
		const { data: targetUser, error: targetError } = await supabase
			.from("users")
			.select("id")
			.eq("account_id", accountId)
			.single();

		if (targetError || !targetUser) {
			console.log("対象ユーザー取得エラー:", targetError);
			return NextResponse.json(
				{ error: "ユーザーが見つかりません" },
				{ status: 404 },
			);
		}
		console.log("対象ユーザー取得成功, ID:", targetUser.id);

		// 自分自身をフォローできないようにする
		if (user.id === targetUser.id) {
			console.log("自分自身をフォローしようとしました");
			return NextResponse.json(
				{ error: "自分自身をフォローすることはできません" },
				{ status: 400 },
			);
		}

		// 現在のユーザー情報を取得
		const { data: currentUser, error: currentUserError } = await supabase
			.from("users")
			.select("id")
			.eq("id", user.id)
			.single();

		if (currentUserError || !currentUser) {
			console.log("現在のユーザー情報取得エラー:", currentUserError);
			return NextResponse.json(
				{ error: "ユーザー情報が見つかりません" },
				{ status: 404 },
			);
		}
		console.log("現在のユーザー情報取得成功, ID:", currentUser.id);

		// フォロー関係を作成
		console.log("フォロー関係作成開始:", {
			follower_id: currentUser.id,
			following_id: targetUser.id,
		});

		const { error: followError } = await supabase.from("follows").insert({
			follower_id: currentUser.id,
			following_id: targetUser.id,
		});

		if (followError) {
			console.log("フォロー関係作成エラー:", followError);
			// 既にフォローしている場合はエラー
			if (followError.code === "23505") {
				return NextResponse.json(
					{ error: "既にフォローしています" },
					{ status: 409 },
				);
			}
			return NextResponse.json(
				{ error: "フォローに失敗しました" },
				{ status: 500 },
			);
		}

		console.log("フォロー関係作成成功");
		return NextResponse.json({ message: "フォローしました" }, { status: 201 });
	} catch (error) {
		console.error("フォローエラー:", error);
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ accountId: string }> },
) {
	try {
		// 認証トークンの取得
		const authHeader = request.headers.get("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
		}

		const token = authHeader.split(" ")[1];

		// 認証コンテキスト付きでSupabaseクライアントを作成
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
		const { accountId } = await params;

		// フォロー対象のユーザーを取得
		const { data: targetUser, error: targetError } = await supabase
			.from("users")
			.select("id")
			.eq("account_id", accountId)
			.single();

		if (targetError || !targetUser) {
			return NextResponse.json(
				{ error: "ユーザーが見つかりません" },
				{ status: 404 },
			);
		}

		// 現在のユーザー情報を取得
		const { data: currentUser, error: currentUserError } = await supabase
			.from("users")
			.select("id")
			.eq("id", user.id)
			.single();

		if (currentUserError || !currentUser) {
			return NextResponse.json(
				{ error: "ユーザー情報が見つかりません" },
				{ status: 404 },
			);
		}

		// フォロー関係を削除
		const { error: unfollowError } = await supabase
			.from("follows")
			.delete()
			.eq("follower_id", currentUser.id)
			.eq("following_id", targetUser.id);

		if (unfollowError) {
			return NextResponse.json(
				{ error: "アンフォローに失敗しました" },
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{ message: "アンフォローしました" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("アンフォローエラー:", error);
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 },
		);
	}
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ accountId: string }> },
) {
	try {
		console.log("=== フォロー状態確認API GET開始 ===");
		const supabase = await createClient();

		// 認証トークンの取得
		const authHeader = request.headers.get("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			console.log("認証ヘッダーが不正:", authHeader);
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
		}

		const token = authHeader.split(" ")[1];
		console.log("トークン取得完了");

		// トークンの検証
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser(token);
		if (authError || !user) {
			console.log("認証エラー:", authError);
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
		}
		console.log("認証成功, ユーザーID:", user.id);

		// paramsをawait
		const { accountId } = await params;
		console.log("対象アカウントID:", accountId);

		// フォロー対象のユーザーを取得
		const { data: targetUser, error: targetError } = await supabase
			.from("users")
			.select("id")
			.eq("account_id", accountId)
			.single();

		if (targetError || !targetUser) {
			console.log("対象ユーザー取得エラー:", targetError);
			return NextResponse.json(
				{ error: "ユーザーが見つかりません" },
				{ status: 404 },
			);
		}
		console.log("対象ユーザー取得成功, ID:", targetUser.id);

		// 現在のユーザー情報を取得
		const { data: currentUser, error: currentUserError } = await supabase
			.from("users")
			.select("id")
			.eq("id", user.id)
			.single();

		if (currentUserError || !currentUser) {
			console.log("現在のユーザー情報取得エラー:", currentUserError);
			return NextResponse.json(
				{ error: "ユーザー情報が見つかりません" },
				{ status: 404 },
			);
		}
		console.log("現在のユーザー情報取得成功, ID:", currentUser.id);

		// フォロー状態を確認
		console.log("フォロー状態確認開始:", {
			follower_id: currentUser.id,
			following_id: targetUser.id,
		});

		const { data: followStatus, error: followStatusError } = await supabase
			.from("follows")
			.select("id")
			.eq("follower_id", currentUser.id)
			.eq("following_id", targetUser.id)
			.single();

		if (followStatusError && followStatusError.code !== "PGRST116") {
			console.log("フォロー状態確認エラー:", followStatusError);
			return NextResponse.json(
				{ error: "フォロー状態の確認に失敗しました" },
				{ status: 500 },
			);
		}

		const isFollowing = !!followStatus;
		console.log("フォロー状態確認完了, isFollowing:", isFollowing);

		return NextResponse.json({ isFollowing }, { status: 200 });
	} catch (error) {
		console.error("フォロー状態確認エラー:", error);
		return NextResponse.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 },
		);
	}
}
