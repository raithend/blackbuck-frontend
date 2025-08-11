"use server";

import type { Database } from "@/app/types/database.types";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// 環境変数のチェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
	throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

// Note: Service Role Key is NOT required on the frontend/serverless API routes of this app.
// Avoid forcing its presence to prevent runtime crashes on Vercel.

export const createClient = async (accessToken?: string) => {
	const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!anonKey) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
	}

    // Vercelで occasionally misconfigured URLs (e.g., http://localhost) を早期検知
    if (process.env.NODE_ENV === "production") {
        try {
            const url = new URL(supabaseUrl as string);
            if (url.hostname === "localhost") {
                console.error("Invalid production SUPABASE URL points to localhost:", supabaseUrl);
            }
            if (url.protocol !== "https:") {
                console.error("Supabase URL should use https in production:", supabaseUrl);
            }
        } catch (_) {
            console.error("Invalid SUPABASE URL format:", supabaseUrl);
        }
    }

    const supabase = createSupabaseClient<Database>(
		supabaseUrl,
		anonKey, // 常にanon keyを使用
		{
			auth: {
                // Server-side recommended settings
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false,
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
			const {
				data: { session },
				error,
			} = await supabase.auth.setSession({
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
