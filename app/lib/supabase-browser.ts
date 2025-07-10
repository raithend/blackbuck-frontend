import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		"Supabaseの環境変数が設定されていません。NEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYを設定してください。",
	);
}

// 接続テスト
const testClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
testClient.auth.getSession().then(({ data, error }) => {
	if (error) {
		console.error("Supabase接続エラー:", error);
	}
});

export function createClient() {
	return createBrowserClient(supabaseUrl as string, supabaseAnonKey as string, {
		auth: {
			persistSession: true,
			autoRefreshToken: true,
			detectSessionInUrl: true,
			flowType: "pkce",
		},
		cookies: {
			get: (name) => {
				const cookie = document.cookie
					.split("; ")
					.find((c) => c.startsWith(`${name}=`));
				return cookie ? cookie.split("=")[1] : undefined;
			},
			set: (name, value, options) => {
				document.cookie = `${name}=${value}; path=/; ${options?.expires ? `expires=${options.expires.toUTCString()};` : ""}`;
			},
			remove: (name) => {
				document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
			},
		},
	});
}
