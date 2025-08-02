"use client";

// フェッチャー関数
const fetcher = async (url: string) => {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error("Failed to fetch data");
		}
		return response.json();
	} catch (error) {
		// ネットワークエラーの場合は既存データを保持するため、エラーを投げない
		if (error instanceof TypeError && error.message.includes("fetch")) {
			console.warn(
				"ネットワークエラーが発生しましたが、既存のデータを表示し続けます:",
				error,
			);
			return null; // nullを返すことで、既存のデータを保持
		}
		throw error;
	}
};

import { UserCards } from "@/app/components/follow/user-cards";
import type { User } from "@/app/types/types";
import { useParams } from "next/navigation";
import useSWR from "swr";

export default function FollowsPage() {
	const params = useParams();
	const accountId = params.accountId as string;

	// フォロー中のユーザーを取得
	const {
		data: followingData,
		error: followingError,
		isLoading: followingLoading,
	} = useSWR<{ users: User[] }>(
		`/api/users/account/${accountId}/follows?type=following`,
		fetcher,
	);

	// フォロワーを取得
	const {
		data: followersData,
		error: followersError,
		isLoading: followersLoading,
	} = useSWR<{ users: User[] }>(
		`/api/users/account/${accountId}/follows?type=followers`,
		fetcher,
	);

	if (followingLoading || followersLoading) {
		return <div>読み込み中...</div>;
	}

	if (followingError || followersError) {
		return <div>エラーが発生しました</div>;
	}

	const followingUsers = followingData?.users || [];
	const followersUsers = followersData?.users || [];

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div>
					<h2 className="text-2xl font-bold mb-4">フォロー中</h2>
					<UserCards users={followingUsers} type="following" />
				</div>
				<div>
					<h2 className="text-2xl font-bold mb-4">フォロワー</h2>
					<UserCards users={followersUsers} type="followers" />
				</div>
			</div>
		</div>
	);
}
