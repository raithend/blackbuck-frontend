"use client";

import { PostCards } from "@/app/components/post/post-cards";
import { ProfileHeader } from "@/app/components/profile/profile-header";
import { UserCards } from "@/app/components/follow/user-cards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { PostWithUser, User } from "@/app/types/types";
import { useUser } from "@/app/contexts/user-context";
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

// 認証付きフェッチャー関数
const authFetcher = async (url: string) => {
	try {
		const { createClient } = await import("@/app/lib/supabase-browser");
		const supabase = createClient();
		const { data: { session } } = await supabase.auth.getSession();
		
		if (!session?.access_token) {
			console.error("認証トークンが取得できません");
			throw new Error("認証トークンが取得できません");
		}

		console.log("認証付きAPI呼び出し:", url);

		const response = await fetch(url, {
			headers: {
				"Authorization": `Bearer ${session.access_token}`,
			},
		});
		
		if (!response.ok) {
			const errorText = await response.text();
			console.error("API呼び出しエラー:", response.status, errorText);
			throw new Error(`Failed to fetch data: ${response.status} ${errorText}`);
		}
		return response.json();
	} catch (error) {
		console.error("認証付きフェッチャーエラー:", error);
		if (error instanceof TypeError && error.message.includes('fetch')) {
			console.warn('ネットワークエラーが発生しましたが、既存のデータを表示し続けます:', error);
			return null;
		}
		throw error;
	}
};

export default function UserProfilePage({ params }: { params: Promise<{ accountId: string }> }) {
	const [accountId, setAccountId] = useState<string | null>(null);
	const { user: currentUser } = useUser();

	// paramsを非同期で取得
	useEffect(() => {
		const getAccountId = async () => {
			const { accountId: id } = await params;
			setAccountId(id);
		};
		getAccountId();
	}, [params]);

	// 自分自身のプロフィールかどうかを判定
	const isOwnProfile = currentUser?.account_id === accountId;

	// ユーザー情報を取得
	const { data: userData, error: userError, isLoading: userLoading, mutate: mutateUser } = useSWR<{ user: User }>(
		accountId ? `/api/users/account/${accountId}` : null,
		fetcher,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			shouldRetryOnError: false,
			dedupingInterval: 30000,
			keepPreviousData: true,
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

	// フィードを取得（自分自身のプロフィールの場合のみ）
	const { data: feedData, error: feedError, isLoading: feedLoading, mutate: mutateFeed } = useSWR<{ posts: PostWithUser[] }>(
		isOwnProfile ? `/api/users/me/feed` : null,
		authFetcher,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			shouldRetryOnError: false,
			dedupingInterval: 30000,
			keepPreviousData: true,
		}
	);

	// フォロー中のユーザーを取得
	const { data: followingData, error: followingError, isLoading: followingLoading, mutate: mutateFollowing } = useSWR<{ users: User[] }>(
		accountId ? `/api/users/account/${accountId}/follows?type=following` : null,
		fetcher,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			shouldRetryOnError: false,
			dedupingInterval: 30000,
			keepPreviousData: true,
		}
	);

	// フォロワーを取得
	const { data: followersData, error: followersError, isLoading: followersLoading, mutate: mutateFollowers } = useSWR<{ users: User[] }>(
		accountId ? `/api/users/account/${accountId}/follows?type=followers` : null,
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
		if (isOwnProfile) {
			mutateFeed();
		}
		mutateFollowing();
		mutateFollowers();
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
	const feedPosts = feedData?.posts || [];
	const followingUsers = followingData?.users || [];
	const followersUsers = followersData?.users || [];

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
			<Tabs defaultValue={isOwnProfile ? "feed" : "posts"} className="w-full">
				<TabsList className="grid w-full" style={{ 
					gridTemplateColumns: isOwnProfile ? "repeat(4, 1fr)" : "repeat(3, 1fr)" 
				}}>
					{isOwnProfile && <TabsTrigger value="feed">フィード</TabsTrigger>}
					<TabsTrigger value="posts">投稿</TabsTrigger>
					<TabsTrigger value="following">フォロー中</TabsTrigger>
					<TabsTrigger value="followers">フォロワー</TabsTrigger>
				</TabsList>

				{/* フィードタブ（自分自身のプロフィールのみ） */}
				{isOwnProfile && (
					<TabsContent value="feed" className="mt-6">
						{feedLoading ? (
							<div className="space-y-4">
								{Array.from({ length: 3 }).map((_, i) => (
									<div key={i} className="animate-pulse">
										<div className="h-48 bg-gray-200 rounded-lg"></div>
									</div>
								))}
							</div>
						) : feedError ? (
							<div className="text-center py-8">
								<p className="text-gray-600 mb-4">フィードの取得に失敗しました</p>
								{feedPosts.length > 0 && (
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
						) : feedPosts.length === 0 ? (
							<div className="text-center py-8">
								<p className="text-gray-600">フィードに投稿がありません</p>
							</div>
						) : (
							<PostCards posts={feedPosts} />
						)}
					</TabsContent>
				)}

				{/* 投稿タブ */}
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

				{/* フォロー中タブ */}
				<TabsContent value="following" className="mt-6">
					{followingLoading ? (
						<div className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="animate-pulse">
									<div className="h-24 bg-gray-200 rounded-lg"></div>
								</div>
							))}
						</div>
					) : followingError ? (
						<div className="text-center py-8">
							<p className="text-gray-600 mb-4">フォロー中のユーザー取得に失敗しました</p>
							<button 
								onClick={handleRetry}
								className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
							>
								再試行
							</button>
						</div>
					) : (
						<UserCards users={followingUsers} type="following" />
					)}
				</TabsContent>

				{/* フォロワータブ */}
				<TabsContent value="followers" className="mt-6">
					{followersLoading ? (
						<div className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="animate-pulse">
									<div className="h-24 bg-gray-200 rounded-lg"></div>
								</div>
							))}
						</div>
					) : followersError ? (
						<div className="text-center py-8">
							<p className="text-gray-600 mb-4">フォロワー取得に失敗しました</p>
							<button 
								onClick={handleRetry}
								className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
							>
								再試行
							</button>
						</div>
					) : (
						<UserCards users={followersUsers} type="followers" />
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
