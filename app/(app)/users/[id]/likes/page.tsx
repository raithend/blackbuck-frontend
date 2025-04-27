"use client";

import { PostCards } from "@/components/post/post-cards";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LikesPage() {

	const {
		data: posts,
		error,
		isLoading,
	} = useSWR(`/api/v1/users/[id]/likes`, fetcher);

	if (error) {
		return <div>エラーが発生しました</div>;
	}

	if (isLoading) {
		return <div>読み込み中...</div>;
	}

	return (
		<PostCards posts={posts} />
	);
}
