import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import type { User, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types/database.types";

export interface AuthResult {
	user: User;
	supabase: SupabaseClient<Database>;
}

export async function authenticateUser(request: NextRequest): Promise<AuthResult> {
	// まずAuthorizationヘッダーからアクセストークンを確認
	const authHeader = request.headers.get("authorization");
	const accessToken = authHeader?.replace("Bearer ", "");

	if (accessToken) {
		// アクセストークンがある場合はそれを使用
		try {
			const supabase = await createClient(accessToken);
			const { data: { user }, error: userError } = await supabase.auth.getUser();

			if (userError || !user) {
				console.error("ユーザー取得エラー:", userError);
				throw new Error("認証が必要です");
			}

			return { user, supabase };
		} catch (error) {
			console.error("アクセストークン認証エラー:", error);
			throw new Error("認証が必要です");
		}
	}
	
	// アクセストークンがない場合はセッション認証を試行
	try {
		const supabase = await createClient();
		const { data: { user }, error: authError } = await supabase.auth.getUser();

		if (authError || !user) {
			console.error('Auth error:', authError);
			throw new Error("認証が必要です");
		}

		return { user, supabase };
	} catch (error) {
		console.error("セッション認証エラー:", error);
		throw new Error("認証が必要です");
	}
}

export async function authenticateUserWithToken(request: NextRequest): Promise<AuthResult> {
	// Authorizationヘッダーからアクセストークンを取得
	const authHeader = request.headers.get("authorization");
	const accessToken = authHeader?.replace("Bearer ", "");

	if (!accessToken) {
		throw new Error("認証が必要です");
	}

	// アクセストークンを使ってSupabaseクライアントを作成
	const supabase = await createClient(accessToken);

	// ユーザー情報を取得
	const { data: { user }, error: userError } = await supabase.auth.getUser();

	if (userError || !user) {
		console.error("ユーザー取得エラー:", userError);
		throw new Error("認証が必要です");
	}

	return { user, supabase };
} 