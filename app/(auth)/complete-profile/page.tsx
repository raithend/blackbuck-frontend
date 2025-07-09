"use client";

import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Button } from "@/app/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { completeProfile, getSession } from "@/app/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase-browser";


function CompleteProfileContent() {
	const [accountId, setAccountId] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [accountIdStatus, setAccountIdStatus] = useState<
		"checking" | "available" | "unavailable" | null
	>(null);
	const router = useRouter();
	const searchParams = useSearchParams();

	// セッションの確認 & setSession
	useEffect(() => {
		const access_token = searchParams.get("access_token");
		const refresh_token = searchParams.get("refresh_token");
		const code = searchParams.get("code");
		
		console.log("Complete profile page - params:", { 
			hasAccessToken: !!access_token, 
			hasRefreshToken: !!refresh_token,
			hasCode: !!code
		});
		
		if (access_token && refresh_token) {
			console.log("setSession: access_token, refresh_tokenをセットします");
			const supabase = createClient();
			supabase.auth.setSession({ access_token, refresh_token }).then((result) => {
				console.log("Session set result:", result);
				// クエリを消してリロード
				router.replace("/complete-profile");
			}).catch((error) => {
				console.error("Session set error:", error);
			});
		} else if (code) {
			console.log("Processing auth code:", code);
			const supabase = createClient();
			
			// PKCEエラーを回避するため、認証状態を確認
			supabase.auth.getSession().then(({ data: { session } }) => {
				if (session) {
					console.log("Session already exists");
				} else {
					console.log("No existing session, trying code exchange");
					// コード交換を試行
					supabase.auth.exchangeCodeForSession(code).then((result) => {
						console.log("Code exchange result:", result);
						if (result.error) {
							console.error("Code exchange error:", result.error);
							// PKCEエラーの場合、ユーザーに再ログインを促す
							if (result.error.message.includes("code verifier")) {
								console.log("PKCE error detected, redirecting to login");
								router.replace(`/login?error=${encodeURIComponent("認証リンクが無効です。再度ログインしてください。")}`);
							} else {
								router.replace(`/login?error=${encodeURIComponent(result.error.message)}`);
							}
						} else if (result.data.session) {
							console.log("Code exchange successful");
						} else {
							console.log("No session in result");
							router.replace(`/login?error=${encodeURIComponent("セッションの設定に失敗しました")}`);
						}
					}).catch((error) => {
						console.error("Code exchange catch error:", error);
						router.replace(`/login?error=${encodeURIComponent("認証に失敗しました")}`);
					});
				}
			});
		} else {
			console.log("setSession: トークンがURLにありません");
		}
	}, [searchParams, router]);

	// account_idのバリデーション
	useEffect(() => {
		if (!accountId) {
			setAccountIdStatus(null);
			return;
		}

		const timer = setTimeout(async () => {
			try {
				const response = await fetch(`/api/users/account/${accountId}`);
				if (response.ok) {
					setAccountIdStatus("unavailable");
				} else if (response.status === 404) {
					setAccountIdStatus("available");
				} else {
					setAccountIdStatus(null);
				}
			} catch (err) {
				setAccountIdStatus(null);
			}
		}, 1000);

		return () => clearTimeout(timer);
	}, [accountId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		try {
			// アカウントIDの重複チェック
			if (accountIdStatus !== "available") {
				throw new Error("アカウントIDが使用できません");
			}

			await completeProfile({ accountId, name });
			router.push("/");
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: "プロフィールの登録に失敗しました",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const isFormValid = accountId && name && accountIdStatus === "available";

	return (
		<div className="container flex h-screen w-screen flex-col items-center justify-center">
			<Card className="w-[400px]">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl text-center">
						プロフィールを完成させましょう
					</CardTitle>
					<CardDescription className="text-center">
						アカウントIDとユーザー名を設定してください
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="accountId">アカウントID</Label>
							<Input
								id="accountId"
								value={accountId}
								onChange={(e) => setAccountId(e.target.value)}
								required
							/>
							{accountIdStatus === "checking" && (
								<p className="text-sm text-muted-foreground">チェック中...</p>
							)}
							{accountIdStatus === "unavailable" && (
								<p className="text-sm text-destructive">
									そのアカウントIDは使用できません
								</p>
							)}
							{accountIdStatus === "available" && (
								<p className="text-sm text-green-600">
									そのアカウントIDは使用可能です
								</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="name">ユーザー名</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>
						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}
						<Button
							type="submit"
							className="w-full"
							disabled={isLoading || !isFormValid}
						>
							{isLoading ? "処理中..." : "プロフィールを登録"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

export default function CompleteProfile() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center h-screen">
					Loading...
				</div>
			}
		>
			<CompleteProfileContent />
		</Suspense>
	);
}
