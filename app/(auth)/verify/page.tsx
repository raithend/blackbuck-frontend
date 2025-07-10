"use client";

import { createClient } from "@/app/lib/supabase-browser";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@radix-ui/themes";

export default function VerifyPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [message, setMessage] = useState("認証を確認中...");

	useEffect(() => {
		const code = searchParams.get("code");
		const error = searchParams.get("error");
		const error_description = searchParams.get("error_description");

		console.log("Verify page - params:", { 
			code: code ? "present" : "missing",
			error,
			error_description
		});

		if (error) {
			console.error("Auth error:", error, error_description);
			setMessage("認証エラーが発生しました");
			setTimeout(() => {
				router.replace(`/login?error=${encodeURIComponent(error_description || error)}`);
			}, 2000);
			return;
		}

		if (code) {
			console.log("Processing auth code:", code);
			const supabase = createClient();
			
			// セッション確認のみを行う（コード交換は不要）
			supabase.auth.getSession().then(({ data: { session } }) => {
				if (session) {
					console.log("Session exists, redirecting to home");
					setMessage("認証完了！ホームページに移動します...");
					setTimeout(() => {
						router.replace("/");
					}, 1000);
				} else {
					console.log("No session found, redirecting to login");
					setMessage("認証に失敗しました");
					setTimeout(() => {
						router.replace(`/login?error=${encodeURIComponent("認証に失敗しました")}`);
					}, 2000);
				}
			});
		} else {
			console.log("No code, redirecting to login");
			setMessage("認証に失敗しました");
			setTimeout(() => {
				router.replace(`/login?error=${encodeURIComponent("認証に失敗しました")}`);
			}, 2000);
		}
	}, [searchParams, router]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<Spinner size="3" className="mx-auto mb-4" />
				<p className="text-gray-600">{message}</p>
			</div>
		</div>
	);
} 