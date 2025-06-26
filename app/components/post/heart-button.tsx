"use client";

import { HeartIcon } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { useUser } from "@/app/contexts/user-context";
import { toast } from "sonner";

interface HeartButtonProps {
	postId: string;
	initialLikeCount?: number;
	initialIsLiked?: boolean;
	onLikeChange?: (likeCount: number, isLiked: boolean) => void;
}

export function HeartButton({ 
	postId, 
	initialLikeCount = 0, 
	initialIsLiked = false,
	onLikeChange 
}: HeartButtonProps) {
	const { user } = useUser();
	const [isPending, startTransition] = useTransition();
	
	// useOptimisticを使用して楽観的更新を実装
	const [optimisticState, addOptimistic] = useOptimistic(
		{ isLiked: initialIsLiked, likeCount: initialLikeCount },
		(state, newAction: { action: 'like' | 'unlike' }) => {
			if (newAction.action === 'like') {
				return {
					isLiked: true,
					likeCount: state.likeCount + 1
				};
			} else {
				return {
					isLiked: false,
					likeCount: Math.max(0, state.likeCount - 1)
				};
			}
		}
	);

	const handleClick = async () => {
		if (!user) {
			toast.error("ログインが必要です");
			return;
		}

		if (isPending) return;

		startTransition(async () => {
			try {
				// 楽観的更新を即座に適用
				const action = optimisticState.isLiked ? 'unlike' : 'like';
				addOptimistic({ action });

				// 認証トークンを取得
				const supabase = await import("@/app/lib/supabase-browser").then(m => m.createClient());
				const { data: { session } } = await supabase.auth.getSession();
				
				if (!session?.access_token) {
					throw new Error("認証トークンが取得できません");
				}

				const response = await fetch(`/api/posts/${postId}/like`, {
					method: optimisticState.isLiked ? "DELETE" : "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${session.access_token}`,
					},
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "いいねの処理に失敗しました");
				}

				// 成功時の処理
				onLikeChange?.(optimisticState.isLiked ? optimisticState.likeCount - 1 : optimisticState.likeCount + 1, !optimisticState.isLiked);
			} catch (error) {
				console.error("いいね処理エラー:", error);
				toast.error(error instanceof Error ? error.message : "いいねの処理に失敗しました");
			}
		});
	};

	return (
		<div className="flex items-center gap-2">
			<button
				type="button"
				onClick={handleClick}
				disabled={isPending}
				className={`flex items-center gap-1 p-2 rounded-full transition-colors ${
					optimisticState.isLiked 
						? "text-red-600 hover:bg-red-50" 
						: "text-gray-500 hover:bg-gray-50"
				} ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
			>
				<HeartIcon
					className={`w-5 h-5 transition-all ${
						optimisticState.isLiked 
							? "fill-red-600 text-red-600" 
							: "fill-transparent"
					} ${isPending ? "animate-pulse" : ""}`}
				/>
			</button>
			{optimisticState.likeCount > 0 && (
				<span className="text-sm text-gray-600 min-w-[1rem] text-center">
					{optimisticState.likeCount}
				</span>
			)}
		</div>
	);
}
