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

	const signUp = async ({ email, password, name }: SignUpParams) => {
		const supabase = createClient();
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					name,
				},
				emailRedirectTo: `${window.location.origin}/auth/verify`,
			},
		});

		if (error) {
			throw error;
		}

		if (!data.user) {
			throw new Error("ユーザーが作成されませんでした");
		}

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
		} catch (error) {
			console.error("サインアップエラー:", error);
			setError("アカウントの作成に失敗しました");
			toast.error("アカウントの作成に失敗しました");
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
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					<Button 
						type="submit" 
						className="w-full" 
						disabled={isLoading || !password || password.length < 8}
					>
						{isLoading ? "登録中..." : "新規登録"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
