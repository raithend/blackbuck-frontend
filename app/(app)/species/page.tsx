"use client";

import Link from "next/link";
import useSWR from "swr";

interface Species {
	id: string;
	name: string;
	description: string;
}

const fetcher = async (url: string) => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("生物データの取得に失敗しました");
	}
	return response.json();
};

export default function Page() {
	const {
		data: species,
		error,
		isLoading,
	} = useSWR<Species[]>("/api/v1/species", fetcher);

	if (error) {
		return <div>エラーが発生しました</div>;
	}

	if (isLoading) {
		return <div>読み込み中...</div>;
	}

	return (
		<div className="grid gap-2">
			{species?.map((animal) => (
				<Link key={animal.id} href={`/species/${animal.id}`}>
					<div className="rounded-lg border p-4 transition-colors hover:bg-accent">
						<h2 className="mb-2 text-2xl font-semibold">{animal.name}</h2>
						<p className="text-muted-foreground">{animal.description}</p>
					</div>
				</Link>
			))}
		</div>
	);
}
