"use client";

import { useMemo, useState } from "react";
import { PostCards } from "@/app/components/post/post-cards";
import PhylogeneticTreeArea from "@/app/components/phylogenetic/phylogenetic-tree-area";
import GlobeArea from "@/app/components/habitat/globe-area";
import { GeologicalAgeProvider } from "@/app/components/geological/geological-context";
import { GeologicalAgeCard } from "@/app/components/geological/geological-age-card";
import { ClassificationEditButton } from "@/app/components/classification/classification-edit-button";
import type { PostWithUser } from "@/app/types/types";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Button } from "@/app/components/ui/button";
import { Edit, Eye } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/app/contexts/user-context";

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
	console.log('API呼び出し開始:', url);
	try {
		const response = await fetch(url);
		console.log('APIレスポンスステータス:', response.status);
		if (!response.ok) {
			throw new Error('Failed to fetch data');
		}
		const data = await response.json();
		console.log('APIレスポンスデータ:', data);
		return data;
	} catch (error) {
		console.error('フェッチャー関数エラー:', error);
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
	const [activeTab, setActiveTab] = useState("overview");
	const { user } = useUser();

	// 分類情報のみを取得（即座に表示可能）
	const { data: classificationData, error: classificationError, isLoading: classificationLoading } = useSWR<{ classification: Classification | null }>(
		`/api/classifications/${encodeURIComponent(decodedName)}?includePosts=false`,
		fetcher,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			dedupingInterval: 30000,
			refreshInterval: 0,
			onSuccess: (data) => {
				console.log('=== 分類情報取得完了 ===');
				console.log('分類情報:', data?.classification);
			},
			onError: (error) => {
				console.error('分類情報取得エラー:', error);
			}
		}
	);

	// 投稿情報を別途取得（Claude API使用のため時間がかかる）
	const { data: postsData, error: postsError, isLoading: postsLoading, mutate: mutatePosts } = useSWR<{ posts: PostWithUser[] }>(
		`/api/classifications/${encodeURIComponent(decodedName)}?includePosts=true`,
		fetcher,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			dedupingInterval: 30000,
			refreshInterval: 0,
			onSuccess: (data) => {
				console.log('=== 投稿情報取得完了 ===');
				console.log('取得された投稿の数:', data?.posts?.length || 0);
				console.log('取得された投稿の分類名:', data?.posts?.map(post => post.classification).filter(Boolean));
			},
			onError: (error) => {
				console.error('投稿情報取得エラー:', error);
			}
		}
	);

	const classification = classificationData?.classification;
	const posts = postsData?.posts || [];

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

	// 系統樹作成者かどうかを判定
	const isTreeCreator = user && classification?.phylogenetic_tree_creator === user.id;
	
	// 生息地データ作成者かどうかを判定
	const isGeographicDataCreator = user && classification?.geographic_data_creator === user.id;

	// 分類情報の読み込み中
	if (classificationLoading) return <div>分類情報を読み込み中...</div>;
	if (classificationError) return <div>分類情報の取得でエラーが発生しました</div>;

	// 各要素の存在チェック
	const hasOverview = classification?.description || classification?.english_name || classification?.scientific_name || classification?.era_start || classification?.era_end;
	const hasPosts = posts.length > 0;
	const hasPhylogeneticTree = classification?.phylogenetic_tree_file;
	const hasGeographicData = classification?.geographic_data_file;

	// デバッグ出力
	console.log('ClassificationPage - classification:', classification);
	console.log('ClassificationPage - hasPhylogeneticTree:', hasPhylogeneticTree);
	console.log('ClassificationPage - phylogenetic_tree_file:', classification?.phylogenetic_tree_file);

	return (
		<GeologicalAgeProvider>
		<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold">{decodedName}</h1>
					<ClassificationEditButton 
						classification={classification || null} 
						onUpdate={mutatePosts}
					/>
				</div>
				
				<Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
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
						{postsLoading ? (
							<div className="flex items-center justify-center h-64 text-gray-500">
								<p>投稿を読み込み中...</p>
							</div>
						) : postsError ? (
							<div className="flex items-center justify-center h-64 text-red-500">
								<p>投稿の取得でエラーが発生しました</p>
							</div>
						) : hasPosts ? (
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
							<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
								<div className="lg:col-span-3">
									<PhylogeneticTreeArea 
										customTreeContent={classification.phylogenetic_tree_file} 
									/>
								</div>
								<div className="lg:col-span-1">
									<GeologicalAgeCard enableMenu={true} />
								</div>
							</div>
						) : (
							<div className="text-center py-8">
								<p className="text-gray-500 mb-4">系統樹が登録されていません</p>
								{user && (
									<Link href={`/classifications/${encodeURIComponent(decodedName)}/tree/edit`}>
										<Button>
											<Edit className="h-4 w-4 mr-2" />
											系統樹を編集
										</Button>
									</Link>
								)}
							</div>
						)}
						
						{/* 系統樹が存在する場合のボタン表示 */}
						{hasPhylogeneticTree && (
							<div className="mt-4 flex justify-center gap-4">
								{isTreeCreator ? (
									// 作成者の場合：編集ボタンを表示
									<Link href={`/classifications/${encodeURIComponent(decodedName)}/tree/edit`}>
										<Button>
											<Edit className="h-4 w-4 mr-2" />
											系統樹を編集
										</Button>
									</Link>
								) : user ? (
									// ログインユーザー（作成者以外）の場合：見るボタンを表示
									<Link href={`/classifications/${encodeURIComponent(decodedName)}/tree/view`}>
										<Button variant="outline">
											<Eye className="h-4 w-4 mr-2" />
											系統樹を見る
										</Button>
									</Link>
								) : (
									// ログインしていない場合：何も表示しない
									null
								)}
							</div>
						)}
					</TabsContent>
					
					<TabsContent value="globe" className="mt-6">
						{hasGeographicData ? (
							<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
								<div className="lg:col-span-3">
									<GlobeArea 
										customGeographicFile={classification.geographic_data_file}
										habitatData={habitatData}
									/>
								</div>
								<div className="lg:col-span-1">
									<GeologicalAgeCard enableMenu={true} />
								</div>
							</div>
						) : (
							<div className="text-center py-8">
								<p className="text-gray-500 mb-4">生息地データが登録されていません</p>
								<Link href={`/classifications/${encodeURIComponent(decodedName)}/habitat/edit`}>
									<Button>
										<Edit className="h-4 w-4 mr-2" />
										生息地を編集
									</Button>
								</Link>
							</div>
						)}
						
						{/* 生息地データが存在する場合のボタン表示 */}
						{hasGeographicData && (
							<div className="mt-4 flex justify-center gap-4">
								{isGeographicDataCreator ? (
									// 作成者の場合：編集ボタンを表示
									<Link href={`/classifications/${encodeURIComponent(decodedName)}/habitat/edit`}>
										<Button>
											<Edit className="h-4 w-4 mr-2" />
											生息地を編集
										</Button>
									</Link>
								) : user ? (
									// ログインユーザー（作成者以外）の場合：見るボタンを表示
									<Link href={`/classifications/${encodeURIComponent(decodedName)}/habitat/view`}>
										<Button variant="outline">
											<Eye className="h-4 w-4 mr-2" />
											生息地を見る
										</Button>
									</Link>
								) : (
									// ログインしていない場合：何も表示しない
									null
								)}
							</div>
						)}
					</TabsContent>
				</Tabs>
		</div>
		</GeologicalAgeProvider>
	);
}
