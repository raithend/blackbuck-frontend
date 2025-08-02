"use client";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { useUser } from "@/app/contexts/user-context";
import { passwordZod } from "@/app/lib/password-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// パスワード変更用のスキーマ
const changePasswordFormSchema = z.object({
	currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
	newPassword: passwordZod,
});

type ChangePasswordFormData = z.infer<typeof changePasswordFormSchema>;

export function SecuritySettings() {
	const { session } = useUser();
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
		watch,
		reset,
	} = useForm<ChangePasswordFormData>({
		resolver: zodResolver(changePasswordFormSchema),
		mode: "onChange",
	});

	const newPassword = watch("newPassword");

	const onSubmit = async (data: ChangePasswordFormData) => {
		if (!session) {
			toast.error("ログインが必要です");
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch("/api/users/me/password", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.access_token}`,
				},
				body: JSON.stringify({
					currentPassword: data.currentPassword,
					newPassword: data.newPassword,
				}),
			});

			const responseData = await response.json();

			if (!response.ok) {
				throw new Error(responseData.error || "パスワードの変更に失敗しました");
			}

			// 成功時の処理
			toast.success("パスワードを変更しました");

			// フォームをリセット
			reset();
		} catch (error) {
			console.error("パスワード変更エラー:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "パスワードの変更に失敗しました",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">パスワードの変更</h2>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					{/* 現在のパスワード */}
					<div className="space-y-2">
						<Label htmlFor="current-password">現在のパスワード</Label>
						<Input
							id="current-password"
							type="password"
							{...register("currentPassword")}
							placeholder="現在のパスワードを入力"
							disabled={isLoading}
						/>
						{errors.currentPassword && (
							<p className="text-sm text-red-500">
								{errors.currentPassword.message}
							</p>
						)}
					</div>

					{/* 新しいパスワード */}
					<div className="space-y-2">
						<Label htmlFor="new-password">新しいパスワード</Label>
						<Input
							id="new-password"
							type="password"
							{...register("newPassword")}
							placeholder="新しいパスワードを入力（8文字以上）"
							disabled={isLoading}
						/>
						<p className="text-xs text-gray-500">
							新しいパスワードは8文字以上で入力してください
						</p>
						{errors.newPassword && (
							<p className="text-sm text-red-500">
								{errors.newPassword.message}
							</p>
						)}
					</div>

					{/* 変更ボタン */}
					<Button
						type="submit"
						disabled={isLoading || !isValid}
						className="w-full"
					>
						{isLoading ? "変更中..." : "パスワードを変更"}
					</Button>
				</form>

				{/* 注意事項 */}
				<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<h3 className="text-sm font-medium text-blue-800 mb-2">注意事項</h3>
					<ul className="text-xs text-blue-700 space-y-1">
						<li>
							•
							パスワードを変更すると、他のデバイスからログアウトされる場合があります
						</li>
						<li>• 新しいパスワードは安全に保管してください</li>
						<li>
							• パスワードを忘れた場合は、ログインページから再設定できます
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
