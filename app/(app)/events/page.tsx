"use client";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { EventButton } from "@/app/components/event/event-button";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import type { Event } from "@/app/types/types";

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

export default function EventsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const { data, error, isLoading } = useSWR<{ events: Event[] }>("/api/events", fetcher);

	const events: Event[] = data?.events || [];

	const filteredEvents = events.filter((event: Event) =>
		event.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<div className="text-2xl font-bold mb-4">
						イベント一覧を読み込み中...
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<div className="text-2xl font-bold mb-4 text-red-600">
						エラーが発生しました
					</div>
					<div className="text-gray-600">
						イベント一覧の取得に失敗しました。しばらく時間をおいてから再度お試しください。
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<div className="flex justify-between items-center mb-2">
					<h1 className="text-3xl font-bold">イベント別投稿一覧</h1>
					<EventButton />
				</div>
				<p className="text-gray-600">
					イベントを選択して、そのイベントに関連する投稿を閲覧できます
				</p>
			</div>

			<div className="mb-6">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
					<Input
						type="text"
						placeholder="イベントを検索..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
			</div>

			{events.length === 0 ? (
				<div className="text-center py-12">
					<div className="text-xl font-semibold mb-2 text-gray-600">
						まだイベントが登録されていません
					</div>
					<p className="text-gray-500">
						最初のイベントを追加してみましょう
					</p>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{filteredEvents.map((event: Event) => (
							<Card key={event.id} className="hover:shadow-lg transition-shadow">
								<CardHeader className="pb-2">
									<CardTitle className="text-lg">
										<Link href={`/events/${encodeURIComponent(event.name)}`}>
											<Button variant="ghost" className="w-full justify-start p-0 h-auto">
												{event.name}
											</Button>
										</Link>
									</CardTitle>
								</CardHeader>
								<CardContent className="pt-0">
									<p className="text-sm text-gray-500">
										{event.description || "説明がありません"}
									</p>
								</CardContent>
							</Card>
						))}
					</div>

					{filteredEvents.length === 0 && (
						<div className="text-center py-12">
							<div className="text-xl font-semibold mb-2 text-gray-600">
								検索結果が見つかりません
							</div>
							<p className="text-gray-500">
								別のキーワードで検索してみてください
							</p>
						</div>
					)}
				</>
			)}
		</div>
	);
} 