"use client";

import { LogoutButton } from "@/app/components/auth/logout-button";
import { ModeRadioGroup } from "@/app/components/settings/mode-radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { ProfileImageUpload } from "@/app/components/settings/profile-image-upload";
import { useUser } from "@/app/contexts/user-context";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function AccountSettings() {
	const { user, loading, error, refreshUser, session } = useUser();
	const [username, setUsername] = useState("");
	const [bio, setBio] = useState("");
	const [headerUrl, setHeaderUrl] = useState("");
	const [avatarUrl, setAvatarUrl] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [isHeaderSaving, setIsHeaderSaving] = useState(false);
	const [isAvatarSaving, setIsAvatarSaving] = useState(false);
	const [hasNetworkError, setHasNetworkError] = useState(false);

	// ユーザー情報が取得されたらフォームに設定
	useEffect(() => {
		if (user) {
			setUsername(user.username || "");
			setBio(user.bio || "");
			setHeaderUrl(user.header_url || "");
			setAvatarUrl(user.avatar_url || "");
		}
	}, [user]);

	// エラー状態の監視
	useEffect(() => {
		if (error) {
			// ネットワークエラーの場合は既存データを保持
			if (error.message.includes('fetch') || error.message.includes('network')) {
				setHasNetworkError(true);
			}
		} else {
			setHasNetworkError(false);
		}
	}, [error]);

	// ヘッダー画像保存
	const handleHeaderSave = async (url: string) => {
		if (!session) {
			toast.error("ログインが必要です");
			return;
		}
		setIsHeaderSaving(true);
		try {
			const response = await fetch("/api/users/me", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.access_token}`,
				},
				body: JSON.stringify({ header_url: url || null }),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "ヘッダー画像の保存に失敗しました");
			}
			await refreshUser();
			toast.success("ヘッダー画像を更新しました");
		} catch (error) {
			console.error("ヘッダー画像更新エラー:", error);
			toast.error(error instanceof Error ? error.message : "ヘッダー画像の保存に失敗しました");
		} finally {
			setIsHeaderSaving(false);
		}
	};

	// アバター画像保存
	const handleAvatarSave = async (url: string) => {
		if (!session) {
			toast.error("ログインが必要です");
			return;
		}
		setIsAvatarSaving(true);
		try {
			const response = await fetch("/api/users/me", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.access_token}`,
				},
				body: JSON.stringify({ avatar_url: url || null }),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "アバター画像の保存に失敗しました");
			}
			await refreshUser();
			toast.success("アバター画像を更新しました");
		} catch (error) {
			console.error("アバター画像更新エラー:", error);
			toast.error(error instanceof Error ? error.message : "アバター画像の保存に失敗しました");
		} finally {
			setIsAvatarSaving(false);
		}
	};

	// プロフィール（ユーザー名・自己紹介）を保存
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
				body: JSON.stringify({ 
					username, 
					bio
				}),
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

	// 再試行処理
	const handleRetry = async () => {
		try {
			await refreshUser();
			setHasNetworkError(false);
		} catch (error) {
			console.error("再試行エラー:", error);
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

	// ネットワークエラーがあるが、ユーザーデータがある場合は表示を継続
	if (hasNetworkError && user) {
		return (
			<div className="space-y-6">
				{/* ネットワークエラー警告 */}
				<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-yellow-800 text-sm">
								サーバーとの接続が不安定です。表示されている内容は最新ではない可能性があります。
							</p>
						</div>
						<button 
							onClick={handleRetry}
							className="ml-4 px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-colors"
						>
							更新
						</button>
					</div>
				</div>

				{/* 既存のユーザー情報を表示 */}
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">プロフィール情報</h2>
					
					{/* ヘッダー画像 */}
					<ProfileImageUpload
						type="header"
						currentUrl={headerUrl}
						onUploadComplete={(url) => {
							setHeaderUrl(url);
							handleHeaderSave(url);
						}}
					>
						<div className="w-32 h-20 bg-gray-200 rounded-lg overflow-hidden">
							{headerUrl ? (
								<img 
									src={headerUrl} 
									alt="ヘッダー画像" 
									className="w-full h-full object-cover"
									onError={(e) => {
										e.currentTarget.style.display = 'none';
									}}
								/>
							) : (
								<div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs">
									プレビュー
								</div>
							)}
						</div>
					</ProfileImageUpload>

					{/* アバター画像 */}
					<ProfileImageUpload
						type="avatar"
						currentUrl={avatarUrl}
						onUploadComplete={(url) => {
							setAvatarUrl(url);
							handleAvatarSave(url);
						}}
					>
						<Avatar className="w-16 h-16">
							<AvatarImage src={avatarUrl || undefined} alt="アバター" />
							<AvatarFallback>
								{username ? username.charAt(0).toUpperCase() : "U"}
							</AvatarFallback>
						</Avatar>
					</ProfileImageUpload>

					{/* ユーザー名 */}
					<div className="space-y-2">
						<Label htmlFor="username">ユーザー名</Label>
						<Input
							id="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="ユーザー名を入力"
						/>
					</div>

					{/* 自己紹介 */}
					<div className="space-y-2">
						<Label htmlFor="bio">自己紹介</Label>
						<Textarea
							id="bio"
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							placeholder="自己紹介を入力"
							rows={4}
						/>
					</div>

					{/* 保存ボタン */}
					<Button onClick={handleSave} disabled={isSaving}>
						{isSaving ? "保存中..." : "保存"}
					</Button>
				</div>
			</div>
		);
	}

	// 完全なエラー状態（データがない場合）
	if (error && !user) {
		return (
			<div className="space-y-6">
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">プロフィール情報</h2>
					<div className="text-center">
						<p className="text-red-500 mb-4">プロフィールの読み込みに失敗しました</p>
						<button 
							onClick={handleRetry}
							className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
						>
							再試行
						</button>
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
				
				{/* ヘッダー画像 */}
				<ProfileImageUpload
					type="header"
					currentUrl={headerUrl}
					onUploadComplete={(url) => {
						setHeaderUrl(url);
						handleHeaderSave(url);
					}}
				>
					<div className="w-32 h-20 bg-gray-200 rounded-lg overflow-hidden">
						{headerUrl ? (
							<img 
								src={headerUrl} 
								alt="ヘッダー画像" 
								className="w-full h-full object-cover"
								onError={(e) => {
									e.currentTarget.style.display = 'none';
								}}
							/>
						) : (
							<div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs">
								プレビュー
							</div>
						)}
					</div>
				</ProfileImageUpload>

				{/* アバター画像 */}
				<ProfileImageUpload
					type="avatar"
					currentUrl={avatarUrl}
					onUploadComplete={(url) => {
						setAvatarUrl(url);
						handleAvatarSave(url);
					}}
				>
					<Avatar className="w-16 h-16">
						<AvatarImage src={avatarUrl || undefined} alt="アバター" />
						<AvatarFallback>
							{username ? username.charAt(0).toUpperCase() : "U"}
						</AvatarFallback>
					</Avatar>
				</ProfileImageUpload>

				{/* ユーザー名 */}
				<div className="space-y-2">
					<Label htmlFor="username">ユーザー名</Label>
					<Input
						id="username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						placeholder="ユーザー名を入力"
					/>
				</div>

				{/* 自己紹介 */}
				<div className="space-y-2">
					<Label htmlFor="bio">自己紹介</Label>
					<Textarea
						id="bio"
						value={bio}
						onChange={(e) => setBio(e.target.value)}
						placeholder="自己紹介を入力"
						rows={4}
					/>
				</div>

				{/* 保存ボタン */}
				<Button onClick={handleSave} disabled={isSaving}>
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
