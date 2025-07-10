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
		accessToken ? supabaseServiceKey : anonKey,
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

	return supabase;
};
