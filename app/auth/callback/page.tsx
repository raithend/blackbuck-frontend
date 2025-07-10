"use client";

import { createClient } from "@/app/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@radix-ui/themes";
import { useUser } from "@/app/contexts/user-context";

export default function AuthCallbackPage() {
	const router = useRouter();
	const { refreshUser } = useUser();
	const [message, setMessage] = useState("認証を確認中...");

	useEffect(() => {
		const handleAuthCallback = async () => {
			try {
				const supabase = createClient();
				
				// ブラウザサイドでPKCEフローを処理
				const { data, error } = await supabase.auth.getSession();
				
				console.log("Auth callback - session check:", { 
					hasSession: !!data.session,
					user: data.session?.user?.id ? "present" : "missing",
					error: error?.message
				});

				if (error) {
					console.error("Session check error:", error);
					setMessage("認証に失敗しました");
					setTimeout(() => {
						router.replace("/login?error=認証に失敗しました");
					}, 2000);
					return;
				}

				if (data.session) {
					console.log("Auth successful, updating user context");
					setMessage("認証完了！ユーザー情報を更新中...");
					
					// ユーザーコンテキストを更新
					await refreshUser();
					
					setMessage("認証完了！ホームページに移動します...");
					setTimeout(() => {
						router.replace("/");
					}, 1000);
				} else {
					console.log("No session found, redirecting to login");
					setMessage("認証に失敗しました");
					setTimeout(() => {
						router.replace("/login?error=認証に失敗しました");
					}, 2000);
				}
			} catch (error) {
				console.error("Unexpected error during auth callback:", error);
				setMessage("認証に失敗しました");
				setTimeout(() => {
					router.replace("/login?error=認証に失敗しました");
				}, 2000);
			}
		};

		handleAuthCallback();
	}, [router, refreshUser]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<Spinner size="3" className="mx-auto mb-4" />
				<p className="text-gray-600">{message}</p>
			</div>
		</div>
	);
} 