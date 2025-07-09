import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
	try {
		const supabase = await createClient();
		
		// 認証トークンの取得
		const authHeader = request.headers.get("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return NextResponse.json(
				{ error: "認証が必要です" },
				{ status: 401 }
			);
		}

		const token = authHeader.split(" ")[1];

		// トークンの検証
		const { data: { user }, error: authError } = await supabase.auth.getUser(token);
		if (authError || !user) {
			return NextResponse.json(
				{ error: "認証が必要です" },
				{ status: 401 }
			);
		}

		// ユーザーのアカウントを削除
		const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

		if (deleteError) {
			console.error("アカウント削除エラー:", deleteError);
			return NextResponse.json(
				{ error: "アカウントの削除に失敗しました" },
				{ status: 500 }
			);
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