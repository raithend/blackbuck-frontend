"use client";

import { HeartIcon } from "lucide-react";
import { useState, useEffect } from "react";
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
	const [isLiked, setIsLiked] = useState(initialIsLiked);
	const [likeCount, setLikeCount] = useState(initialLikeCount);
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useUser();

	// 初期状態を更新
	useEffect(() => {
		setIsLiked(initialIsLiked);
		setLikeCount(initialLikeCount);
	}, [initialIsLiked, initialLikeCount]);

	const handleClick = async () => {
		if (!user) {
			toast.error("ログインが必要です");
			return;
		}

		if (isLoading) return;

		setIsLoading(true);
		const previousIsLiked = isLiked;
		const previousLikeCount = likeCount;

		try {
			// 楽観的更新
			setIsLiked(!isLiked);
			setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

			// 認証トークンを取得
			const supabase = await import("@/app/lib/supabase-browser").then(m => m.createClient());
			const { data: { session } } = await supabase.auth.getSession();
			
			if (!session?.access_token) {
				throw new Error("認証トークンが取得できません");
			}

			const response = await fetch(`/api/posts/${postId}/like`, {
				method: isLiked ? "DELETE" : "POST",
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
			onLikeChange?.(isLiked ? likeCount - 1 : likeCount + 1, !isLiked);
		} catch (error) {
			// エラー時は元の状態に戻す
			setIsLiked(previousIsLiked);
			setLikeCount(previousLikeCount);
			
			console.error("いいね処理エラー:", error);
			toast.error(error instanceof Error ? error.message : "いいねの処理に失敗しました");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<button
				type="button"
				onClick={handleClick}
				disabled={isLoading}
				className={`flex items-center gap-1 p-2 rounded-full transition-colors ${
					isLiked 
						? "text-red-600 hover:bg-red-50" 
						: "text-gray-500 hover:bg-gray-50"
				} ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
			>
				<HeartIcon
					className={`w-5 h-5 transition-all ${
						isLiked 
							? "fill-red-600 text-red-600" 
							: "fill-transparent"
					} ${isLoading ? "animate-pulse" : ""}`}
				/>
			</button>
			{likeCount > 0 && (
				<span className="text-sm text-gray-600 min-w-[1rem] text-center">
					{likeCount}
				</span>
			)}
		</div>
	);
}
