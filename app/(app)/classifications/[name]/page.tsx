"use client";

import { useState, useMemo, memo, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { Edit, Eye } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { ClassificationEditButton } from "@/app/components/classification/classification-edit-button";
import { PostCards } from "@/app/components/post/post-cards";
import PhylogeneticTreeArea from "@/app/components/phylogenetic/phylogenetic-tree-area";
import GlobeArea from "@/app/components/habitat/globe-area";
import { GeologicalAgeCard } from "@/app/components/geological/geological-age-card";
import { GeologicalAgeProvider, useGeologicalAge } from "@/app/components/geological/geological-context";
import { useUser } from "@/app/contexts/user-context";
import geologicalAgesData from "@/app/data/geological-ages.json";

import type { PostWithUser, Classification } from "@/app/types/types";

interface EraGroup {
	era: string;
	elements?: HabitatElement[];
}

interface HabitatElement {
	lat: number;
	lng: number;
	color: string;
	size: number;
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

// ClassificationContentコンポーネントをメモ化
const ClassificationContent = memo(({
	decodedName,
	classification,
	posts,
	postsLoading,
	postsError,
	hasOverview,
	hasPosts,
	hasPhylogeneticTree,
	hasGeographicData,
	eraGroups,
	phylogeneticTreeContent,
	habitatDataContent,
	activeTab,
	setActiveTab,
	handleLikeChange,
	handlePostUpdate,
	handlePostDelete,
	mutatePosts,
	isTreeCreator,
	isGeographicDataCreator,
	user,
	phylogeneticTreeCreator,
	habitatDataCreator
}: {
	decodedName: string;
	classification: Classification | null;
	posts: PostWithUser[];
	postsLoading: boolean;
	postsError: any;
	hasOverview: boolean;
	hasPosts: boolean;
	hasPhylogeneticTree: boolean;
	hasGeographicData: boolean;
	eraGroups: any;
	phylogeneticTreeContent: string | undefined;
	habitatDataContent: string | undefined;
	activeTab: string;
	setActiveTab: (tab: string) => void;
	handleLikeChange: (postId: string, likeCount: number, isLiked: boolean) => void;
	handlePostUpdate: (postId: string) => void;
	handlePostDelete: (postId: string) => void;
	mutatePosts: () => void;
	isTreeCreator: boolean;
	isGeographicDataCreator: boolean;
	user: any;
	phylogeneticTreeCreator?: any;
	habitatDataCreator?: any;
}) => {
	const { selectedAgeIds } = useGeologicalAge();

	// 階層的な一致をチェックする関数
	const checkHierarchicalMatch = useCallback((groupEra: string, selectedHierarchy: { era: string; period?: string; epoch?: string; age?: string }): boolean => {
		console.log('=== checkHierarchicalMatch ===');
		console.log(`groupEra: "${groupEra}"`);
		console.log('selectedHierarchy:', selectedHierarchy);
		
		// 時代名が完全一致する場合はtrue
		if (groupEra === selectedHierarchy.era) {
			console.log(`完全一致: "${groupEra}" === "${selectedHierarchy.era}" = true`);
			return true;
		}
		
		// 階層的な一致をチェック
		// 例：「新生代」のデータは「第四紀」「完新世」「メガラヤン」などでも表示されるべき
		
		// 選択された時代が下位階層の場合、上位階層のデータも表示
		// 例：「第四紀」が選択されている場合、「新生代」のデータも表示
		if (selectedHierarchy.period && groupEra === selectedHierarchy.era) {
			console.log(`階層一致（Period）: "${groupEra}" === "${selectedHierarchy.era}" = true`);
			return true;
		}
		
		if (selectedHierarchy.epoch && groupEra === selectedHierarchy.era) {
			console.log(`階層一致（Epoch）: "${groupEra}" === "${selectedHierarchy.era}" = true`);
			return true;
		}
		
		if (selectedHierarchy.age && groupEra === selectedHierarchy.era) {
			console.log(`階層一致（Age）: "${groupEra}" === "${selectedHierarchy.era}" = true`);
			return true;
		}
		
		console.log(`一致なし: "${groupEra}" と "${selectedHierarchy.era}" の階層チェック = false`);
		return false;
	}, []);

	// 選択中の時代に一致するグループのみ抽出
	const filteredEraGroups = useMemo(() => {
		console.log('=== filteredEraGroups処理開始 ===');
		console.log('eraGroups:', eraGroups);
		console.log('selectedAgeIds:', selectedAgeIds);
		
		if (!eraGroups || !selectedAgeIds || selectedAgeIds.length === 0) {
			console.log('eraGroupsまたはselectedAgeIdsが空のため、空配列を返す');
			return [];
		}
		
		// 選択された時代の階層情報を取得
		const getSelectedAgeHierarchy = (selectedAgeIds: number[]): { era: string; period?: string; epoch?: string; age?: string } | undefined => {
			if (!selectedAgeIds || selectedAgeIds.length === 0) return undefined;
			const id = selectedAgeIds[0];
			console.log('getSelectedAgeHierarchy - selectedAgeIds:', selectedAgeIds, 'id:', id);
			
			// 階層の優先順位: Age > Epoch > Period > Era
			// 最下位から検索して、最初に見つかった階層を返す
			
			// まずAgeレベルで検索
			for (const era of geologicalAgesData.eras) {
				for (const period of era.periods) {
					for (const epoch of period.epochs) {
						if (epoch.ages) {
							for (const age of epoch.ages) {
								if (Number(age.id) === id) {
									console.log('getSelectedAgeHierarchy - Age match found:', age.name, 'in epoch:', epoch.name, 'period:', period.name, 'era:', era.name);
									return { era: era.name, period: period.name, epoch: epoch.name, age: age.name };
								}
							}
						}
					}
				}
			}
			
			// Ageで見つからない場合、Epochレベルで検索
			for (const era of geologicalAgesData.eras) {
				for (const period of era.periods) {
					for (const epoch of period.epochs) {
						if (Number(epoch.id) === id) {
							console.log('getSelectedAgeHierarchy - Epoch match found:', epoch.name, 'in period:', period.name, 'era:', era.name);
							return { era: era.name, period: period.name, epoch: epoch.name };
						}
					}
				}
			}
			
			// Epochで見つからない場合、Periodレベルで検索
			for (const era of geologicalAgesData.eras) {
				for (const period of era.periods) {
					if (Number(period.id) === id) {
						console.log('getSelectedAgeHierarchy - Period match found:', period.name, 'in era:', era.name);
						return { era: era.name, period: period.name };
					}
				}
			}
			
			// Periodで見つからない場合、Eraレベルで検索
			for (const era of geologicalAgesData.eras) {
				if (Number(era.id) === id) {
					console.log('getSelectedAgeHierarchy - Era match found:', era.name);
					return { era: era.name };
				}
			}
			
			console.log('getSelectedAgeHierarchy - No match found for id:', id);
			return undefined;
		};
		
		const selectedAgeHierarchy = getSelectedAgeHierarchy(selectedAgeIds);
		console.log('filteredEraGroups - selectedAgeHierarchy:', selectedAgeHierarchy);
		
		if (!selectedAgeHierarchy) {
			console.log('filteredEraGroups - No selectedAgeHierarchy found, returning empty array');
			return [];
		}
		
		// 階層的なフィルタリング
		const filtered = eraGroups.filter((group: { era: string; elements?: any[] }) => {
			const groupEra = group.era;
			const selectedEra = selectedAgeHierarchy.era;
			
			console.log(`フィルタリング処理 - groupEra: "${groupEra}", selectedEra: "${selectedEra}"`);
			
			// 時代名が完全一致する場合
			if (groupEra === selectedEra) {
				console.log(`フィルタリング: "${groupEra}" === "${selectedEra}" = true (完全一致)`);
				return true;
			}
			
			// 階層的な一致をチェック
			// 例：「新生代」のデータは「第四紀」「完新世」「メガラヤン」などでも表示
			const isHierarchicalMatch = checkHierarchicalMatch(groupEra, selectedAgeHierarchy);
			console.log(`フィルタリング: "${groupEra}" 階層チェック = ${isHierarchicalMatch}`);
			
			return isHierarchicalMatch;
		});
		
		console.log('filteredEraGroups - filtered result:', filtered);
		console.log('filteredEraGroups - filtered result詳細:', JSON.stringify(filtered, null, 2));
		return filtered;
	}, [selectedAgeIds, eraGroups, checkHierarchicalMatch]);

	// GlobeAreaコンポーネントに渡すデータを準備
	const globeData = useMemo(() => {
		console.log('=== globeData準備開始 ===');
		console.log('filteredEraGroups:', filteredEraGroups);
		
		if (!filteredEraGroups || filteredEraGroups.length === 0) {
			console.log('filteredEraGroupsが空のため、空配列を返す');
			return [];
		}

		// フィルタリングされたグループから要素を抽出してフラット化
		const flattenedData = filteredEraGroups.flatMap((group: EraGroup) => group.elements || []);
		console.log('globeData結果:', flattenedData);
		return flattenedData;
	}, [filteredEraGroups]);

	return (
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
									customTreeContent={phylogeneticTreeContent}
									creator={phylogeneticTreeCreator}
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
									customGeographicFile={habitatDataContent}
									eraGroups={filteredEraGroups || eraGroups}
									creator={habitatDataCreator}
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
	);
});

// 表示名を設定
ClassificationContent.displayName = 'ClassificationContent';

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
			revalidateOnMount: true,
			dedupingInterval: 60000, // 1分間の重複排除
			refreshInterval: 0,
			onSuccess: (data) => {
				if (process.env.NODE_ENV === 'development') {
					console.log('=== 分類情報取得完了 ===');
					console.log('分類情報:', data?.classification);
				}
			},
			onError: (error) => {
				console.error('分類情報取得エラー:', error);
			}
		}
	);

	// 系統樹データを取得
	const { data: phylogeneticTreeData, error: phylogeneticTreeError, isLoading: phylogeneticTreeLoading } = useSWR<{ phylogeneticTree: { content: string; creator: string } | null }>(
		`/api/classifications/${encodeURIComponent(decodedName)}/phylogenetic-trees`,
		fetcher,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			revalidateOnMount: true,
			dedupingInterval: 60000,
			refreshInterval: 0,
		}
	);

	// 生息地データを取得
	const { data: habitatData, error: habitatError, isLoading: habitatLoading } = useSWR<{ habitatData: { content: string; creator: string } | null }>(
		`/api/classifications/${encodeURIComponent(decodedName)}/habitat-data`,
		fetcher,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			revalidateOnMount: true,
			dedupingInterval: 60000,
			refreshInterval: 0,
		}
	);

	// 系統樹作成者のユーザー情報（APIから直接取得）
	const phylogeneticTreeCreator = (phylogeneticTreeData?.phylogeneticTree as any)?.users;

	// 生息地データ作成者のユーザー情報（APIから直接取得）
	const habitatDataCreator = (habitatData?.habitatData as any)?.users;

	// 投稿情報を別途取得（Claude API使用のため時間がかかる）
	const { data: postsData, error: postsError, isLoading: postsLoading, mutate: mutatePosts } = useSWR<{ posts: PostWithUser[] }>(
		`/api/classifications/${encodeURIComponent(decodedName)}?includePosts=true`,
		fetcher,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			revalidateOnMount: true,
			dedupingInterval: 60000, // 1分間の重複排除
			refreshInterval: 0,
			onSuccess: (data) => {
				if (process.env.NODE_ENV === 'development') {
					console.log('=== 投稿情報取得完了 ===');
					console.log('取得された投稿の数:', data?.posts?.length || 0);
					console.log('取得された投稿の分類名:', data?.posts?.map(post => post.classification).filter(Boolean));
				}
			},
			onError: (error) => {
				console.error('投稿情報取得エラー:', error);
			}
		}
	);

	const classification: Classification | null = classificationData?.classification ?? null;
	const posts = postsData?.posts || [];

	// 生息地データを時代別にグループ化
	const eraGroups = useMemo(() => {
		console.log('=== eraGroups生成開始 ===');
		console.log('habitatData:', habitatData);
		console.log('habitatData?.habitatData?.content:', habitatData?.habitatData?.content);
		
		if (!habitatData?.habitatData?.content) {
			console.log('habitatData.contentが存在しないため、空配列を返す');
			return [];
		}

		try {
			const data = JSON.parse(habitatData.habitatData.content);
			console.log('habitatData.content解析結果:', data);
			
			// データが既に時代別にグループ化されているかチェック
			if (Array.isArray(data) && data.length > 0 && data[0].era && data[0].elements) {
				console.log('データは既に時代別にグループ化されています');
				console.log('eraGroups生成結果:', data);
				return data;
			}
			
			// データを時代別にグループ化
			const grouped = data.reduce((acc: EraGroup[], point: HabitatElement) => {
				const era = (point as any).era || '不明';
				let group = acc.find(g => g.era === era);
				
				if (!group) {
					group = { era, elements: [] };
					acc.push(group);
				}
				
				group.elements?.push(point);
				return acc;
			}, []);
			
			console.log('eraGroups生成結果:', grouped);
			return grouped;
		} catch (error) {
			console.error('habitatData.content解析エラー:', error);
			return [];
		}
	}, [habitatData?.habitatData?.content]);



	// 分類情報の存在チェックをメモ化
	const classificationChecks = useMemo(() => ({
		hasOverview: !!(classification?.description || classification?.english_name || classification?.scientific_name || classification?.era_start || classification?.era_end),
		hasPosts: posts.length > 0,
		hasPhylogeneticTree: !!phylogeneticTreeData?.phylogeneticTree?.content,
		hasGeographicData: !!habitatData?.habitatData?.content
	}), [classification, posts.length, phylogeneticTreeData?.phylogeneticTree?.content, habitatData?.habitatData?.content]);

	// いいね状態変更のハンドラー
	const handleLikeChange = useCallback((postId: string, likeCount: number, isLiked: boolean) => {
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
	}, [mutatePosts]);

	// 投稿更新のハンドラー
	const handlePostUpdate = useCallback((postId: string) => {
		// 投稿データを再取得
		mutatePosts();
	}, [mutatePosts]);

	// 投稿削除のハンドラー
	const handlePostDelete = useCallback((postId: string) => {
		mutatePosts((currentData) => {
			if (!currentData) return currentData;
			return {
				...currentData,
				posts: currentData.posts.filter(post => post.id !== postId)
			};
		}, false);
	}, [mutatePosts]);

	// 系統樹作成者かどうかを判定
	const isTreeCreator = !!(user && phylogeneticTreeData?.phylogeneticTree?.creator === user.id);
	
	// 生息地データ作成者かどうかを判定
	const isGeographicDataCreator = !!(user && habitatData?.habitatData?.creator === user.id);

	// 分類情報の読み込み中
	if (classificationLoading) return <div>分類情報を読み込み中...</div>;
	if (classificationError) return <div>分類情報の取得でエラーが発生しました</div>;

	// 各要素の存在チェック（メモ化済み）
	const { hasOverview, hasPosts, hasPhylogeneticTree, hasGeographicData } = classificationChecks;

	return (
		<GeologicalAgeProvider>
			<ClassificationContent 
				decodedName={decodedName}
				classification={classification ?? null}
				posts={posts}
				postsLoading={postsLoading}
				postsError={postsError}
				hasOverview={hasOverview}
				hasPosts={hasPosts}
				hasPhylogeneticTree={hasPhylogeneticTree}
				hasGeographicData={hasGeographicData}
				eraGroups={eraGroups}
				phylogeneticTreeContent={phylogeneticTreeData?.phylogeneticTree?.content}
				habitatDataContent={habitatData?.habitatData?.content}
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				handleLikeChange={handleLikeChange}
				handlePostUpdate={handlePostUpdate}
				handlePostDelete={handlePostDelete}
				mutatePosts={mutatePosts}
				user={user}
				isTreeCreator={isTreeCreator}
				isGeographicDataCreator={isGeographicDataCreator}
				phylogeneticTreeCreator={phylogeneticTreeCreator}
				habitatDataCreator={habitatDataCreator}
			/>
		</GeologicalAgeProvider>
	);
}
