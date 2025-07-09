import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const error = requestUrl.searchParams.get("error");
	const error_description = requestUrl.searchParams.get("error_description");

	console.log("Auth callback called with:", { 
		code: code ? "present" : "missing",
		error,
		error_description
	});

	// エラーがある場合はログインページにリダイレクト
	if (error) {
		console.error("Auth error:", error, error_description);
		return NextResponse.redirect(
			`${requestUrl.origin}/login?error=${encodeURIComponent(error_description || error)}`,
		);
	}

	// 認証コードがある場合は、クライアントサイドで処理するようにリダイレクト
	if (code) {
		const redirectUrl = `${requestUrl.origin}/complete-profile?code=${encodeURIComponent(code)}`;
		console.log("Redirecting to complete-profile with code:", redirectUrl);
		return NextResponse.redirect(redirectUrl);
	}

	console.log("No code, redirecting to login");
	// エラー時はログインページにリダイレクト
	return NextResponse.redirect(
		`${requestUrl.origin}/login?error=${encodeURIComponent("認証に失敗しました")}`,
	);
}
