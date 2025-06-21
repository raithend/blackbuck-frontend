"use client";

import { PostCards } from "@/app/components/post/post-cards";
import { ProfileHeader } from "@/app/components/profile/profile-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { PostWithUser, User } from "@/app/types/types";
import useSWR from "swr";
import { useEffect, useState } from "react";

// フェッチャー関数
const fetcher = async (url: string) => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error('Failed to fetch data');
	}
	return response.json();
};

export default function UserProfilePage({ params }: { params: Promise<{ accountId: string }> }) {
	const [accountId, setAccountId] = useState<string | null>(null);

	// paramsを非同期で取得
	useEffect(() => {
		const getAccountId = async () => {
			const { accountId: id } = await params;
			setAccountId(id);
		};
		getAccountId();
	}, [params]);

	// ユーザー情報を取得
	const { data: userData, error: userError, isLoading: userLoading } = useSWR<{ user: User }>(
		accountId ? `/api/users/account/${accountId}` : null,
		fetcher
	);

	// ユーザーの投稿を取得
	const { data: postsData, error: postsError, isLoading: postsLoading } = useSWR<{ posts: PostWithUser[] }>(
		accountId ? `/api/users/account/${accountId}/posts` : null,
		fetcher
	);

	if (!accountId || userLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="animate-pulse">
					<div className="w-full h-48 bg-gray-200 rounded-lg mb-6"></div>
					<div className="space-y-4">
						<div className="h-8 bg-gray-200 rounded w-1/3"></div>
						<div className="h-4 bg-gray-200 rounded w-1/4"></div>
					</div>
				</div>
			</div>
		);
	}

	if (userError) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h1>
					<p className="text-gray-600">ユーザー情報の取得に失敗しました</p>
				</div>
			</div>
		);
	}

	if (!userData?.user) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-600 mb-4">ユーザーが見つかりません</h1>
					<p className="text-gray-500">指定されたアカウントIDのユーザーは存在しません</p>
				</div>
			</div>
		);
	}

	const user = userData.user;
	const posts = postsData?.posts || [];

	return (
		<div className="container mx-auto px-4 py-8">
			{/* プロフィールヘッダー */}
			<ProfileHeader user={user} />

			{/* タブコンテンツ */}
			<Tabs defaultValue="posts" className="w-full">
				<TabsList className="grid w-full grid-cols-1">
					<TabsTrigger value="posts">投稿</TabsTrigger>
				</TabsList>
				<TabsContent value="posts" className="mt-6">
					{postsLoading ? (
						<div className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="animate-pulse">
									<div className="h-48 bg-gray-200 rounded-lg"></div>
								</div>
							))}
						</div>
					) : postsError ? (
						<div className="text-center py-8">
							<p className="text-gray-600">投稿の取得に失敗しました</p>
						</div>
					) : posts.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-600">まだ投稿がありません</p>
						</div>
					) : (
						<PostCards posts={posts} />
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
