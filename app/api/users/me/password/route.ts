import { createClient } from "@/app/lib/supabase-server";
import { changePasswordSchema } from "@/app/api/db/validation";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
	try {
		// Authorizationヘッダーからアクセストークンを取得
		const authHeader = request.headers.get("authorization");
		const accessToken = authHeader?.replace("Bearer ", "");

		if (!accessToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// アクセストークンを使ってSupabaseクライアントを作成
		const supabase = await createClient(accessToken);

		// ユーザー情報を取得
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			console.error("ユーザー取得エラー:", userError);
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// リクエストボディを取得
		const body = await request.json();

		// zodスキーマでバリデーション
		const validationResult = changePasswordSchema.safeParse(body);
		if (!validationResult.success) {
			const errors = validationResult.error.errors;
			const errorMessage = errors.map(err => err.message).join(", ");
			return NextResponse.json(
				{ error: errorMessage },
				{ status: 400 },
			);
		}

		const { currentPassword, newPassword } = validationResult.data;

		// 現在のパスワードを確認（メールとパスワードでサインインを試行）
		if (!user.email) {
			return NextResponse.json(
				{ error: "メールアドレスが見つかりません" },
				{ status: 400 },
			);
		}

		const { error: signInError } = await supabase.auth.signInWithPassword({
			email: user.email,
			password: currentPassword,
		});

		if (signInError) {
			console.error("現在のパスワード確認エラー:", signInError);
			return NextResponse.json(
				{ error: "現在のパスワードが正しくありません" },
				{ status: 400 },
			);
		}

		// パスワードを更新
		const { error: updateError } = await supabase.auth.updateUser({
			password: newPassword,
		});

		if (updateError) {
			console.error("パスワード更新エラー:", updateError);
			return NextResponse.json(
				{ error: updateError.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ message: "パスワードが正常に更新されました" });
	} catch (error) {
		console.error("パスワード変更エラー:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
} 