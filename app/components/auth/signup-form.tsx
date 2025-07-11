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
import { createClient } from "@/app/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { validatePassword } from "@/app/lib/password-validation";
import { GoogleLoginButton } from "./google-login-button";

type SignUpParams = {
	email: string;
	password: string;
	name: string;
};

export function SignUpForm() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [password, setPassword] = useState("");
	const [retryCount, setRetryCount] = useState(0);

	const signUp = async ({ email, password, name }: SignUpParams) => {
		const supabase = createClient();
		
		// サインアップ処理
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					name,
				},
				emailRedirectTo: `${window.location.origin}/verify`,
			},
		});

		if (error) {
			throw error;
		}

		if (!data.user) {
			throw new Error("ユーザーが作成されませんでした");
		}

		// 少し待機してからユーザープロフィールを作成（APIレート制限を回避）
		await new Promise(resolve => setTimeout(resolve, 1000));

		// ユーザープロフィールを作成
		const response = await fetch("/api/users", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id: data.user.id, name, email }),
		});

		if (!response.ok) {
			const error = await response.json();
			console.error("ユーザー作成エラー:", error);
			throw new Error(error.message || "ユーザー作成に失敗しました");
		}

		return data;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		
		// 既に送信中の場合、重複送信を防ぐ
		if (isLoading) {
			return;
		}
		
		setError(null);
		setIsLoading(true);

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const name = formData.get("name") as string;

		// パスワードバリデーション
		if (password.length < 8) {
			setError("パスワードは8文字以上で入力してください");
			setIsLoading(false);
			return;
		}

		if (password.length > 128) {
			setError("パスワードは128文字以下で入力してください");
			setIsLoading(false);
			return;
		}

		try {
			const { session } = await signUp({ email, password, name });
			if (session) {
				// セッションがある場合（メール認証不要の場合）は直接ホームに遷移
				router.push("/");
			} else {
				// メール認証が必要な場合は確認ページに遷移
				router.push("/signup-confirmation");
			}
		} catch (error: any) {
			console.error("サインアップエラー:", error);
			
			// レート制限エラーの特別な処理
			if (error.message?.includes("rate limit") || error.message?.includes("429") || error.message?.includes("email rate limit exceeded")) {
				const retryMessage = retryCount > 0 
					? `（${retryCount}回目の再試行）` 
					: "";
				setError(
					`APIレート制限に達しました。${retryMessage}\n\n` +
					`• 数分待ってから再度お試しください\n` +
					`• 別のメールアドレスで試すこともできます\n` +
					`• Googleアカウントでの登録を推奨します（下のボタン）`
				);
				toast.error("APIレート制限に達しました。Googleログインをお試しください。");
				setRetryCount(prev => prev + 1);
			} else if (error.message?.includes("already registered")) {
				setError("このメールアドレスは既に登録されています。ログインページからサインインしてください。");
				toast.error("このメールアドレスは既に登録されています");
			} else {
				setError("アカウントの作成に失敗しました。もう一度お試しください。");
				toast.error("アカウントの作成に失敗しました");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-[400px]">
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl">アカウント作成</CardTitle>
				<CardDescription>
					メールアドレスとパスワードを入力してアカウントを作成してください
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">名前</Label>
						<Input
							id="name"
							name="name"
							type="text"
							placeholder="山田 太郎"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">メールアドレス</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="example@example.com"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">パスワード</Label>
						<Input 
							id="password" 
							name="password" 
							type="password" 
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="パスワードを入力（8文字以上）"
							required 
						/>
						<p className="text-xs text-gray-500">
							パスワードは8文字以上で入力してください
						</p>
					</div>

					{error && (
						<Alert variant="destructive">
							<AlertDescription className="whitespace-pre-line">
								{error}
							</AlertDescription>
						</Alert>
					)}
					
					<Button 
						type="submit" 
						className="w-full" 
						disabled={isLoading || !password || password.length < 8}
					>
						{isLoading ? (
							<div className="flex items-center space-x-2">
								<div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
								<span>登録中...</span>
							</div>
						) : (
							"新規登録"
						)}
					</Button>
					
					{/* レート制限エラーが発生した場合、Googleログインを推奨 */}
					{error && (error.includes("レート制限") || error.includes("rate limit") || error.includes("429") || error.includes("email rate limit exceeded")) && (
						<Alert className="border-orange-200 bg-orange-50">
							<AlertDescription className="text-orange-800">
								💡 推奨: Googleアカウントでの登録がより簡単で確実です
							</AlertDescription>
						</Alert>
					)}
					
					<div className="relative w-full">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								または
							</span>
						</div>
					</div>
					
					<GoogleLoginButton className="w-full">
						Googleでアカウント作成
					</GoogleLoginButton>
				</form>
			</CardContent>
		</Card>
	);
}
