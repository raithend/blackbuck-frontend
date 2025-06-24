"use client";

import { PostCards } from "@/app/components/post/post-cards";
import { ProfileHeader } from "@/app/components/profile/profile-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { PostWithUser, User } from "@/app/types/types";
import useSWR from "swr";
import { useEffect, useState } from "react";

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
	const { data: userData, error: userError, isLoading: userLoading, mutate: mutateUser } = useSWR<{ user: User }>(
		accountId ? `/api/users/account/${accountId}` : null,
		fetcher,
		{
			revalidateOnFocus: false, // フォーカス時の再検証を無効化
			revalidateOnReconnect: true, // 再接続時は再検証
			shouldRetryOnError: false, // エラー時の再試行を無効化（既存データを保持するため）
			dedupingInterval: 30000, // 30秒間の重複リクエストを防ぐ
			keepPreviousData: true, // 前のデータを保持
		}
	);

	// ユーザーの投稿を取得
	const { data: postsData, error: postsError, isLoading: postsLoading, mutate: mutatePosts } = useSWR<{ posts: PostWithUser[] }>(
		accountId ? `/api/users/account/${accountId}/posts` : null,
		fetcher,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			shouldRetryOnError: false,
			dedupingInterval: 30000,
			keepPreviousData: true,
		}
	);

	// ネットワークエラー時の再試行ボタン
	const handleRetry = () => {
		mutateUser();
		mutatePosts();
	};

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

	// エラーが発生したが、既存のデータがある場合は表示を継続
	if (userError && !userData?.user) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h1>
					<p className="text-gray-600 mb-4">ユーザー情報の取得に失敗しました</p>
					<button 
						onClick={handleRetry}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
					>
						再試行
					</button>
				</div>
			</div>
		);
	}

	// ユーザーデータがない場合
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
			{/* ネットワークエラー時の警告バナー */}
			{userError && (
				<div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-yellow-800 text-sm">
								サーバーとの接続が不安定です。表示されている内容は最新ではない可能性があります。
							</p>
						</div>
						<button 
							onClick={handleRetry}
							className="ml-4 px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-colors"
						>
							更新
						</button>
					</div>
				</div>
			)}

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
							<p className="text-gray-600 mb-4">投稿の取得に失敗しました</p>
							{posts.length > 0 && (
								<p className="text-sm text-gray-500 mb-4">
									以前に取得した投稿を表示しています
								</p>
							)}
							<button 
								onClick={handleRetry}
								className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
							>
								再試行
							</button>
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
