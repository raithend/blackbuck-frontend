"use client";

import { Button } from "@/app/components/ui/button";
import { useUser } from "@/app/contexts/user-context";
import { UserPlus, UserMinus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { ButtonProps } from "@/app/components/ui/button";

interface FollowButtonProps extends Omit<ButtonProps, 'onClick'> {
	targetAccountId: string;
	initialIsFollowing?: boolean;
}

export function FollowButton({
	targetAccountId,
	initialIsFollowing = false,
	className,
	variant = "outline",
	size = "default",
	...buttonProps
}: FollowButtonProps) {
	const { user } = useUser();
	const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
	const [isLoading, setIsLoading] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);

	// 初期状態でフォロー状態を取得
	useEffect(() => {
		const fetchFollowStatus = async () => {
			if (!user || isInitialized || user?.account_id === targetAccountId) return;

			try {
				// 認証トークンを取得
				const { createClient } = await import("@/app/lib/supabase-browser");
				const supabase = createClient();
				const { data: { session } } = await supabase.auth.getSession();
				
				if (!session?.access_token) {
					return;
				}

				const response = await fetch(`/api/users/account/${targetAccountId}/follow`, {
					method: "GET",
					headers: {
						"Authorization": `Bearer ${session.access_token}`,
					},
				});

				if (response.ok) {
					const data = await response.json();
					setIsFollowing(data.isFollowing);
				}
			} catch (error) {
				console.error("フォロー状態取得エラー:", error);
			} finally {
				setIsInitialized(true);
			}
		};

		fetchFollowStatus();
	}, [user, targetAccountId, isInitialized]);

	// 自分自身の場合はボタンを表示しない
	if (user?.account_id === targetAccountId) {
		return null;
	}

	const handleFollowToggle = async () => {
		if (!user) {
			toast.error("ログインが必要です");
			return;
		}

		setIsLoading(true);

		try {
			const url = `/api/users/account/${targetAccountId}/follow`;
			const method = isFollowing ? "DELETE" : "POST";

			// 認証トークンを取得
			const { createClient } = await import("@/app/lib/supabase-browser");
			const supabase = createClient();
			const { data: { session } } = await supabase.auth.getSession();
			
			if (!session?.access_token) {
				throw new Error("認証トークンが取得できません");
			}

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${session.access_token}`,
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "操作に失敗しました");
			}

			setIsFollowing(!isFollowing);
			toast.success(
				isFollowing ? "アンフォローしました" : "フォローしました"
			);
		} catch (error) {
			console.error("フォロー操作エラー:", error);
			toast.error(error instanceof Error ? error.message : "操作に失敗しました");
		} finally {
			setIsLoading(false);
		}
	};

	// ボタンの表示テキストを決定
	const getButtonText = () => {
		if (isLoading) {
			return isFollowing ? "アンフォロー中..." : "フォロー中...";
		}
		
		if (isFollowing) {
			return isHovered ? "フォローをはずす" : "フォロー中";
		}
		
		return "フォロー";
	};

	// ボタンのアイコンを決定
	const getButtonIcon = () => {
		if (isLoading) {
			return <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
		}
		
		if (isFollowing) {
			return <UserMinus className="h-4 w-4" />;
		}
		
		return <UserPlus className="h-4 w-4" />;
	};

	// ボタンのバリアントを決定
	const getButtonVariant = () => {
		if (isFollowing) {
			return "default";
		}
		return variant;
	};

	// 初期化中はローディング状態を表示
	if (!isInitialized) {
		return (
			<Button
				disabled
				variant={variant}
				size={size}
				className={className}
				{...buttonProps}
			>
				<div className="flex items-center gap-2">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
					読み込み中...
				</div>
			</Button>
		);
	}

	return (
		<Button
			onClick={handleFollowToggle}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			disabled={isLoading}
			variant={getButtonVariant()}
			size={size}
			className={className}
			{...buttonProps}
		>
			<div className="flex items-center gap-2">
				{getButtonIcon()}
				{getButtonText()}
			</div>
		</Button>
	);
}
