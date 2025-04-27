"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");

	if (code) {
		const cookieStore = await cookies();

		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				cookies: cookieStore,
			},
		);

		// code をセッションに交換
		await supabase.auth.exchangeCodeForSession(code);
	}

	// ダッシュボードにリダイレクト
	return NextResponse.redirect(new URL("/", request.url));
}
