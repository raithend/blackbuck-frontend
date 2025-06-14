"use client";

import { PostCards } from "@/app/components/post/post-cards";
import { fetcher } from "@/app/lib/fetcher";
import { Post } from "@/app/api/db/types";
import useSWR from "swr";

export default function LikesPage({ params }: { params: { id: string } }) {
	const {
		data: posts,
		error,
		isLoading,
	} = useSWR<Post[]>(`/api/users/${params.id}/likes`, fetcher);

	if (error) {
		return <div>エラーが発生しました</div>;
	}

	if (isLoading) {
		return <div>読み込み中...</div>;
	}

	return (
		<PostCards posts={posts || []} />
	);
}
