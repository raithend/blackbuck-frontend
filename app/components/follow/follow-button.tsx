"use client";

import { Button } from "@/app/components/ui/button";
import { useUser } from "@/app/contexts/user-context";
import { UserPlus, UserMinus } from "lucide-react";
import { useState } from "react";
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

	return (
		<Button
			onClick={handleFollowToggle}
			disabled={isLoading}
			variant={variant}
			size={size}
			className={className}
			{...buttonProps}
		>
			{isLoading ? (
				<div className="flex items-center gap-2">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
					{isFollowing ? "アンフォロー中..." : "フォロー中..."}
				</div>
			) : (
				<div className="flex items-center gap-2">
					{isFollowing ? (
						<>
							<UserMinus className="h-4 w-4" />
							アンフォロー
						</>
					) : (
						<>
							<UserPlus className="h-4 w-4" />
							フォロー
						</>
					)}
				</div>
			)}
		</Button>
	);
}
