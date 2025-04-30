"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Page() {
	const { data: posts, error } = useSWR("/api/v1/posts", fetcher);

	if (error) {
		return <div>エラーが発生しました</div>;
	}

	return (
		<main>
		</main>
	);
}
