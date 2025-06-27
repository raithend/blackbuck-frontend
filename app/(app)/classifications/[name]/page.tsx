"use client";

import { PostCards } from "@/app/components/post/post-cards";
import type { PostWithUser } from "@/app/types/types";
import { useParams } from "next/navigation";
import useSWR from "swr";

// フェッチャー関数
const fetcher = async (url: string) => {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error('Failed to fetch data');
		}
		return response.json();
	} catch (error) {
		// ネットワークエラーの場合は既存データを保持するため、エラーを投げない
		if (error instanceof TypeError && error.message.includes('fetch')) {
			console.warn('ネットワークエラーが発生しましたが、既存のデータを表示し続けます:', error);
			return null; // nullを返すことで、既存のデータを保持
		}
		throw error;
	}
};

export default function ClassificationPage() {
	const params = useParams();
	const decodedName = decodeURIComponent(params.name as string);

	const { data, error, isLoading, mutate } = useSWR<{ posts: PostWithUser[] }>(
		`/api/classifications?name=${encodeURIComponent(decodedName)}`,
		fetcher,
		{
			revalidateOnFocus: false, // フォーカス時の自動リフェッチを無効
			revalidateOnReconnect: false, // ネットワーク復旧時の自動リフェッチを無効
			dedupingInterval: 30000, // 30秒間は重複リクエストを防ぐ
			refreshInterval: 0, // 自動更新を無効
		}
	);

	// いいね状態変更のハンドラー
	const handleLikeChange = (postId: string, likeCount: number, isLiked: boolean) => {
		mutate((currentData) => {
			if (!currentData) return currentData;
			return {
				...currentData,
				posts: currentData.posts.map(post => 
					post.id === postId 
						? { ...post, likeCount, isLiked }
						: post
				)
			};
		}, false);
	};

	// 投稿更新のハンドラー
	const handlePostUpdate = (postId: string) => {
		// 投稿データを再取得
		mutate();
	};

	// 投稿削除のハンドラー
	const handlePostDelete = (postId: string) => {
		mutate((currentData) => {
			if (!currentData) return currentData;
			return {
				...currentData,
				posts: currentData.posts.filter(post => post.id !== postId)
			};
		}, false);
	};

	if (isLoading) return <div>読み込み中...</div>;
	if (error) return <div>エラーが発生しました</div>;

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold mb-6">{decodedName}の投稿</h1>
			<PostCards 
				posts={data?.posts || []} 
				onLikeChange={handleLikeChange}
				onPostUpdate={handlePostUpdate}
				onPostDelete={handlePostDelete}
			/>
		</div>
	);
}
