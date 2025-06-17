"use server";

import { createClient } from "@/app/lib/supabase-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");

	if (code) {
		const supabase = await createClient();
		const { data, error } = await supabase.auth.exchangeCodeForSession(code);

		if (error) {
			return NextResponse.redirect(
				`${requestUrl.origin}/login?error=${error.message}`,
			);
		}

		if (data.session) {
			// プロフィール入力ページにリダイレクト
			return NextResponse.redirect(`${requestUrl.origin}/complete-profile`);
		}
	}

	// エラー時はログインページにリダイレクト
	return NextResponse.redirect(
		`${requestUrl.origin}/login?error=認証に失敗しました`,
	);
}
