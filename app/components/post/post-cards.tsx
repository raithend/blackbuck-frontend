"use client";

import type { PostWithUser } from "@/app/types/types";
import { PostCard } from "./post-card";

interface PostCardsProps {
	posts: PostWithUser[];
	onLikeChange?: (postId: string, likeCount: number, isLiked: boolean) => void;
	onPostUpdate?: (postId: string) => void;
	onPostDelete?: (postId: string) => void;
}

export function PostCards({
	posts,
	onLikeChange,
	onPostUpdate,
	onPostDelete,
}: PostCardsProps) {
	// 開発環境でのデバッグ情報
	if (process.env.NODE_ENV === "development") {
		console.log("=== PostCards デバッグ情報 ===");
		console.log("PostCards レンダリング時刻:", new Date().toISOString());
		console.log("表示する投稿数:", posts.length);
		console.log("投稿の分類名:", posts.map(p => p.classification).filter(Boolean));
		console.log("投稿のID:", posts.map(p => p.id));
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{posts.map((post, index) => {
				// 各投稿の表示タイミングをログ出力
				if (process.env.NODE_ENV === "development") {
					console.log(`投稿${index + 1} 表示時刻:`, new Date().toISOString(), "ID:", post.id, "分類:", post.classification);
				}
				
				return (
					<PostCard
						key={post.id}
						post={post}
						onLikeChange={onLikeChange}
						onPostUpdate={onPostUpdate}
						onPostDelete={onPostDelete}
					/>
				);
			})}
		</div>
	);
}
