"use client";

import { PostCards } from "@/app/components/post/post-cards";
import PhylogeneticTreeArea from "@/app/components/description/phylogenetic-tree-area";
import GlobeArea from "@/app/components/description/globe-area";
import { GeologicalAgeProvider } from "@/app/components/description/geological-context";
import { ClassificationEditButton } from "@/app/components/classification/classification-edit-button";
import type { PostWithUser } from "@/app/types/types";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";

// 分類情報の型定義
interface Classification {
	id: string;
	name: string;
	english_name?: string;
	scientific_name?: string;
	description?: string;
	era_start?: string;
	era_end?: string;
	phylogenetic_tree_file?: string;
	geographic_data_file?: string;
	phylogenetic_tree_creator?: string;
	geographic_data_creator?: string;
}

// APIレスポンスの型定義
interface ClassificationResponse {
	classification: Classification | null;
	posts: PostWithUser[];
}

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

export default function ClassificationPage() {
	const params = useParams();
	const decodedName = decodeURIComponent(params.name as string);

	// 分類データと投稿データを一度に取得
	const { data, error, isLoading, mutate } = useSWR<ClassificationResponse>(
		`/api/classifications/${encodeURIComponent(decodedName)}`,
		fetcher,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			dedupingInterval: 30000,
			refreshInterval: 0,
		}
	);

	const classification = data?.classification;
	const posts = data?.posts || [];

	// いいね状態変更のハンドラー
	const handleLikeChange = (postId: string, likeCount: number, isLiked: boolean) => {
		mutate((currentData) => {
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
		mutate();
	};

	// 投稿削除のハンドラー
	const handlePostDelete = (postId: string) => {
		mutate((currentData) => {
			if (!currentData) return currentData;
			return {
				...currentData,
				posts: currentData.posts.filter(post => post.id !== postId)
			};
		}, false);
	};

	if (isLoading) return <div>読み込み中...</div>;
	if (error) return <div>エラーが発生しました</div>;

	// 分類情報が存在しない場合、または系統樹と地理データの両方が存在しない場合
	const hasPhylogeneticTree = classification?.phylogenetic_tree_file;
	const hasGeographicData = classification?.geographic_data_file;
	const hasClassificationData = classification && (hasPhylogeneticTree || hasGeographicData);

	// 投稿のみの場合
	if (!hasClassificationData) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold">{decodedName}の投稿</h1>
					<ClassificationEditButton 
						classification={classification || null} 
						onUpdate={mutate}
					/>
				</div>
				{classification?.description && (
					<div className="mb-6 p-4 bg-gray-50 rounded-lg">
						<p className="text-gray-700">{classification.description}</p>
					</div>
				)}
				<PostCards 
					posts={posts} 
					onLikeChange={handleLikeChange}
					onPostUpdate={handlePostUpdate}
					onPostDelete={handlePostDelete}
				/>
			</div>
		);
	}

	// 系統樹または地理データがある場合
	return (
		<GeologicalAgeProvider>
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold">{decodedName}</h1>
					<ClassificationEditButton 
						classification={classification || null} 
						onUpdate={mutate}
					/>
				</div>
				{classification?.description && (
					<div className="mb-6 p-4 bg-gray-50 rounded-lg">
						<p className="text-gray-700">{classification.description}</p>
					</div>
				)}
				
				<Tabs defaultValue="posts" className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="posts">投稿</TabsTrigger>
						{hasPhylogeneticTree && <TabsTrigger value="tree">系統樹</TabsTrigger>}
						{hasGeographicData && <TabsTrigger value="globe">地球儀</TabsTrigger>}
					</TabsList>
					
					<TabsContent value="posts" className="mt-6">
						<PostCards 
							posts={posts} 
							onLikeChange={handleLikeChange}
							onPostUpdate={handlePostUpdate}
							onPostDelete={handlePostDelete}
						/>
					</TabsContent>
					
					{hasPhylogeneticTree && (
						<TabsContent value="tree" className="mt-6">
							<PhylogeneticTreeArea 
								customTreeContent={classification.phylogenetic_tree_file}
							/>
						</TabsContent>
					)}
					
					{hasGeographicData && (
						<TabsContent value="globe" className="mt-6">
							<GlobeArea customGeographicFile={classification.geographic_data_file} />
						</TabsContent>
					)}
				</Tabs>
			</div>
		</GeologicalAgeProvider>
	);
}
