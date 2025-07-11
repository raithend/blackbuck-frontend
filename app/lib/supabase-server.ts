"use server";

import type { Database } from "@/app/types/database.types";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// 環境変数のチェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
	throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseServiceKey) {
	throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
}

export const createClient = async (accessToken?: string) => {
	const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!anonKey) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
	}
	
	const supabase = createSupabaseClient<Database>(
		supabaseUrl,
		anonKey, // 常にanon keyを使用
		{
			auth: {
				autoRefreshToken: true,
				persistSession: true,
				detectSessionInUrl: true,
				flowType: "pkce",
			},
			global: {
				headers: accessToken
					? {
							Authorization: `Bearer ${accessToken}`,
						}
					: undefined,
			},
		},
	);

	// アクセストークンが提供されている場合、セッションを設定
	if (accessToken) {
		try {
			// セッション設定を試行
			const { data: { session }, error } = await supabase.auth.setSession({
				access_token: accessToken,
				refresh_token: "",
			});
			
			if (error) {
				console.error("セッション設定エラー:", error);
				// エラーが発生してもクライアントを返す（認証は別途チェック）
			}
		} catch (error) {
			console.error("セッション設定中にエラーが発生:", error);
			// エラーが発生してもクライアントを返す
		}
	}

	return supabase;
};
