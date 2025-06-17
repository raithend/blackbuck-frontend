"use client";

import { PostCards } from "@/app/components/post/post-cards";
import type { PostWithUser } from "@/app/types/types";
import { useParams } from "next/navigation";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ClassificationPage() {
	const params = useParams();
	const decodedName = decodeURIComponent(params.name as string);

	const { data, error, isLoading } = useSWR(
		`/api/classifications?name=${encodeURIComponent(decodedName)}`,
		fetcher,
	);

	if (isLoading) return <div>読み込み中...</div>;
	if (error) return <div>エラーが発生しました</div>;

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold mb-6">{decodedName}の投稿</h1>
			<PostCards posts={(data?.posts as PostWithUser[]) || []} />
		</div>
	);
}
