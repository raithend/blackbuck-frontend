"use client";

import { LogoutButton } from "@/app/components/auth/logout-button";
import { ModeRadioGroup } from "@/app/components/settings/mode-radio-group";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { useUser } from "@/app/contexts/user-context";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function AccountSettings() {
	const { user, loading, error, refreshUser, session } = useUser();
	const [username, setUsername] = useState("");
	const [bio, setBio] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	// ユーザー情報が取得されたらフォームに設定
	useEffect(() => {
		if (user) {
			setUsername(user.username || "");
			setBio(user.bio || "");
		}
	}, [user]);

	// プロフィールを保存
	const handleSave = async () => {
		if (!session) {
			toast.error("ログインが必要です");
			return;
		}

		setIsSaving(true);
		try {
			const response = await fetch("/api/users/me", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.access_token}`,
				},
				body: JSON.stringify({ username, bio }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "保存に失敗しました");
			}

			// ユーザー情報を再取得してコンテキストを更新
			await refreshUser();
			
			toast.success("プロフィールを更新しました");
		} catch (error) {
			console.error("プロフィール更新エラー:", error);
			toast.error(error instanceof Error ? error.message : "保存に失敗しました");
		} finally {
			setIsSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">プロフィール情報</h2>
					<div className="space-y-2">
						<Label htmlFor="username">ユーザー名</Label>
						<Input id="username" placeholder="読み込み中..." disabled />
					</div>
					<div className="space-y-2">
						<Label htmlFor="bio">自己紹介</Label>
						<Textarea id="bio" placeholder="読み込み中..." disabled />
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">プロフィール情報</h2>
					<div className="text-center text-red-500">
						プロフィールの読み込みに失敗しました
					</div>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="space-y-6">
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">プロフィール情報</h2>
					<div className="text-center text-red-500">
						ログインが必要です
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">プロフィール情報</h2>
				<div className="space-y-2">
					<Label htmlFor="username">ユーザー名</Label>
					<Input
						id="username"
						placeholder="ユーザー名を入力"
						value={username || ""}
						onChange={(e) => setUsername(e.target.value)}
						maxLength={50}
					/>
					<p className="text-xs text-muted-foreground">
						{username.length}/50文字
					</p>
				</div>
				<div className="space-y-2">
					<Label htmlFor="bio">自己紹介</Label>
					<Textarea
						id="bio"
						placeholder="自己紹介を入力"
						value={bio || ""}
						onChange={(e) => setBio(e.target.value)}
						maxLength={500}
						rows={4}
					/>
					<p className="text-xs text-muted-foreground">
						{bio.length}/500文字
					</p>
				</div>
				<Button
					onClick={handleSave}
					disabled={isSaving}
					className="w-full"
				>
					{isSaving ? "保存中..." : "保存"}
				</Button>
			</div>
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">表示</h2>
				<ModeRadioGroup />
			</div>
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">ログアウト</h2>
				<LogoutButton />
			</div>
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">アカウントの削除</h2>
				<p className="text-sm text-gray-500">
					アカウントを削除すると、すべてのデータが永久に削除されます。この操作は元に戻せません。
				</p>
				<Button variant="destructive">アカウントを削除</Button>
			</div>
		</div>
	);
}
