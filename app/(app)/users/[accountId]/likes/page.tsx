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

export default function LikesPage() {
	const params = useParams();
	const accountId = params.accountId as string;

	const { data, error, isLoading } = useSWR<{ posts: PostWithUser[] }>(
		`/api/users/account/${accountId}/likes`,
		fetcher,
	);

	if (isLoading) return <div>読み込み中...</div>;
	if (error) return <div>エラーが発生しました</div>;

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold mb-6">いいねした投稿</h1>
			<PostCards posts={data?.posts || []} />
		</div>
	);
}
