"use client";

import { useMemo } from "react";
import { PostCards } from "@/app/components/post/post-cards";
import PhylogeneticTreeArea from "@/app/components/description/phylogenetic-tree-area";
import GlobeArea from "@/app/components/description/globe-area";
import { GeologicalAgeProvider } from "@/app/components/description/geological-context";
import { ClassificationEditButton } from "@/app/components/classification/classification-edit-button";
import type { PostWithUser } from "@/app/types/types";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Button } from "@/app/components/ui/button";
import { Edit } from "lucide-react";
import Link from "next/link";

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

	// 生息地データをメモ化して不要な再レンダリングを防ぐ
	const habitatData = useMemo(() => {
		if (!classification?.geographic_data_file) return [];
		try {
			return JSON.parse(classification.geographic_data_file);
		} catch (error) {
			console.error('生息地データのパースに失敗しました:', error);
			return [];
		}
	}, [classification?.geographic_data_file]);

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

	// 各要素の存在チェック
	const hasOverview = classification?.description || classification?.english_name || classification?.scientific_name || classification?.era_start || classification?.era_end;
	const hasPosts = posts.length > 0;
	const hasPhylogeneticTree = classification?.phylogenetic_tree_file;
	const hasGeographicData = classification?.geographic_data_file;

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
				
				<Tabs defaultValue="overview" className="w-full">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="overview">概要</TabsTrigger>
						<TabsTrigger value="posts">投稿</TabsTrigger>
						<TabsTrigger value="tree">系統樹</TabsTrigger>
						<TabsTrigger value="globe">生息地</TabsTrigger>
					</TabsList>
					
					<TabsContent value="overview" className="mt-6">
						{hasOverview ? (
							<div className="space-y-4">
								{classification?.description && (
									<div className="p-4 bg-gray-50 rounded-lg">
										<h3 className="font-semibold mb-2">説明</h3>
										<p className="text-gray-700">{classification.description}</p>
									</div>
								)}
								{(classification?.english_name || classification?.scientific_name) && (
									<div className="p-4 bg-gray-50 rounded-lg">
										<h3 className="font-semibold mb-2">分類情報</h3>
										<div className="space-y-2">
											{classification?.english_name && (
												<p><span className="font-medium">英語名:</span> {classification.english_name}</p>
											)}
											{classification?.scientific_name && (
												<p><span className="font-medium">学名:</span> <em>{classification.scientific_name}</em></p>
											)}
										</div>
									</div>
								)}
								{(classification?.era_start || classification?.era_end) && (
									<div className="p-4 bg-gray-50 rounded-lg">
										<h3 className="font-semibold mb-2">生息年代</h3>
										<div className="space-y-2">
											{classification?.era_start && (
												<p><span className="font-medium">開始:</span> {classification.era_start}</p>
											)}
											{classification?.era_end && (
												<p><span className="font-medium">終了:</span> {classification.era_end}</p>
											)}
										</div>
									</div>
								)}
							</div>
						) : (
							<div className="flex items-center justify-center h-64 text-gray-500">
								<p>概要が設定されていません</p>
							</div>
						)}
					</TabsContent>
					
					<TabsContent value="posts" className="mt-6">
						{hasPosts ? (
							<PostCards 
								posts={posts} 
								onLikeChange={handleLikeChange}
								onPostUpdate={handlePostUpdate}
								onPostDelete={handlePostDelete}
							/>
						) : (
							<div className="flex items-center justify-center h-64 text-gray-500">
								<p>投稿がありません</p>
							</div>
						)}
					</TabsContent>
					
					<TabsContent value="tree" className="mt-6">
						{hasPhylogeneticTree ? (
							<PhylogeneticTreeArea 
								customTreeContent={classification.phylogenetic_tree_file}
							/>
						) : (
							<div className="flex items-center justify-center h-64 text-gray-500">
								<p>系統樹が設定されていません</p>
							</div>
						)}
					</TabsContent>
					
					<TabsContent value="globe" className="mt-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">生息地</h3>
							<Link href={`/classifications/${encodeURIComponent(decodedName)}/habitat/edit`}>
								<Button variant="outline" size="sm" className="flex items-center gap-2">
									<Edit className="h-4 w-4" />
									生息地を編集
								</Button>
							</Link>
						</div>
						{hasGeographicData ? (
							<GlobeArea 
								habitatData={habitatData}
								showMapSelector={true}
							/>
						) : (
							<div className="flex items-center justify-center h-64 text-gray-500">
								<p>生息地が設定されていません</p>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</GeologicalAgeProvider>
	);
}
