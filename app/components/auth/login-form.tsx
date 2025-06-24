"use client";

import { Button } from "@/app/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { createClient } from "@/app/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type SignInParams = {
	email: string;
	password: string;
};

export function LoginForm() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const signIn = async ({ email, password }: SignInParams) => {
		const supabase = createClient();
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			throw error;
		}

		if (!data.session) {
			throw new Error("セッションが作成されませんでした");
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

		try {
			await signIn({ email, password });
			router.push("/");
			router.refresh();
		} catch (error: any) {
			let errorMessage = "ログインに失敗しました";
			
			if (error?.message) {
				if (error.message.includes("Invalid login credentials")) {
					errorMessage = "メールアドレスまたはパスワードが正しくありません";
				} else if (error.message.includes("Email not confirmed")) {
					errorMessage = "メールアドレスの確認が完了していません";
				} else if (error.message.includes("User not found")) {
					errorMessage = "アカウントが見つかりません";
				} else {
					errorMessage = error.message;
				}
			}
			
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-[350px]">
			<CardHeader>
				<CardTitle>ログイン</CardTitle>
				<CardDescription>アカウントにログインしてください</CardDescription>
			</CardHeader>
			<form onSubmit={handleSubmit} className="space-y-4">
				<CardContent>
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
						<Input id="password" name="password" type="password" required />
					</div>
					{error && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-sm text-red-600">{error}</p>
							{error.includes("アカウントが見つかりません") && (
								<p className="text-xs text-red-500 mt-1">
									新規アカウント作成は下のボタンからお進みください
								</p>
							)}
						</div>
					)}
				</CardContent>
				<CardFooter>
					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? "ログイン中..." : "ログイン"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
