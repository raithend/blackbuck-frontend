"use client";

import { PostCards } from "@/app/components/post/post-cards";
import type { PostWithUser, Location } from "@/app/types/types";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Image from "next/image";
import { MapPin, Info } from "lucide-react";
import { LocationEditButton } from "@/app/components/location/location-edit-button";

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

export default function LocationPage() {
	const params = useParams();
	const rawLocation = params.location as string;
	
	// locationパラメータをデコード（既にエンコードされている場合があるため）
	const location = decodeURIComponent(rawLocation);

	// locationの詳細情報を取得
	const { data: locationData, error: locationError, isLoading: locationLoading } = useSWR<{ location: Location | null }>(
		location ? `/api/locations/${encodeURIComponent(location)}` : null,
		fetcher
	);

	// locationの投稿を取得
	const { data: postsData, error: postsError, isLoading: postsLoading, mutate: mutatePosts } = useSWR<{ posts: PostWithUser[] }>(
		location ? `/api/posts?location=${encodeURIComponent(location)}` : null,
		fetcher
	);

	// いいね状態変更のハンドラー
	const handleLikeChange = (postId: string, likeCount: number, isLiked: boolean) => {
		mutatePosts((currentData) => {
			if (!currentData) return currentData;
			return {
				...currentData,
				posts: currentData.posts.map(post => 
					post.id === postId 
						? { ...post, likeCount, isLiked }
						: post
				)
			};
		}, false);
	};

	// 投稿更新のハンドラー
	const handlePostUpdate = (postId: string) => {
		// 投稿データを再取得
		mutatePosts();
	};

	// 投稿削除のハンドラー
	const handlePostDelete = (postId: string) => {
		mutatePosts((currentData) => {
			if (!currentData) return currentData;
			return {
				...currentData,
				posts: currentData.posts.filter(post => post.id !== postId)
			};
		}, false);
	};

	if (locationLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<div className="text-2xl font-bold mb-4">
						{location}の情報を読み込み中...
					</div>
				</div>
			</div>
		);
	}

	if (locationError) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<div className="text-2xl font-bold mb-4 text-red-600">
						エラーが発生しました
					</div>
					<div className="text-gray-600">
						場所情報の取得に失敗しました。しばらく時間をおいてから再度お試しください。
					</div>
				</div>
			</div>
		);
	}

	const locationInfo: Location | null = locationData?.location || null;
	const posts: PostWithUser[] = postsData?.posts || [];

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Location Header */}
			<div className="mb-8">
				{/* Header Image */}
				{locationInfo?.header_url && (
					<div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
						<Image
							src={locationInfo.header_url}
							alt={`${location}のヘッダー画像`}
							fill
							className="object-cover"
						/>
					</div>
				)}

				{/* Location Info */}
				<div className="flex items-start gap-4">
					<div className="flex-1">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<MapPin className="w-5 h-5 text-gray-500" />
								<h1 className="text-3xl font-bold">{location}</h1>
							</div>
							{locationInfo && <LocationEditButton location={locationInfo} />}
						</div>
						
						{locationInfo?.description ? (
							<p className="text-gray-600 text-lg mb-4">
								{locationInfo.description}
							</p>
						) : (
							<div className="flex items-center gap-2 text-gray-500 mb-4">
								<Info className="w-5 h-5" />
								<span>場所の情報が設定されていません</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Posts Section */}
			<div className="mb-6">
				<h2 className="text-2xl font-bold mb-4">投稿一覧</h2>
				{postsLoading ? (
					<div className="text-center py-8">
						<div className="text-lg mb-2">投稿を読み込み中...</div>
					</div>
				) : postsError ? (
					<div className="text-center py-8">
						<div className="text-lg text-red-600 mb-2">投稿の取得に失敗しました</div>
					</div>
				) : posts.length === 0 ? (
					<div className="text-center py-12">
						<div className="text-xl font-semibold mb-2 text-gray-600">
							{location}の投稿はまだありません
						</div>
						<p className="text-gray-500">
							この場所で最初の投稿をしてみませんか？
						</p>
					</div>
				) : (
					<>
						<p className="text-gray-600 mb-4">
							{posts.length}件の投稿が見つかりました
						</p>
						<PostCards 
							posts={posts} 
							onLikeChange={handleLikeChange}
							onPostUpdate={handlePostUpdate}
							onPostDelete={handlePostDelete}
						/>
					</>
				)}
			</div>
		</div>
	);
} 