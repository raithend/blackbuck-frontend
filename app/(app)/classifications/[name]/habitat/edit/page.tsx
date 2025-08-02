"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/app/lib/supabase-browser";
import FabricHabitatEditor from "@/app/components/habitat/habitat-editor";
import HabitatJsonEditor from "@/app/components/habitat/habitat-json-editor";
import Globe from "@/app/components/habitat/globe";
import { GeologicalAgeCard } from "@/app/components/geological/geological-age-card";
import { GeologicalAgeProvider } from "@/app/components/geological/geological-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { toast } from "sonner";
import type { MutableRefObject } from "react";
import type { EraGroup, HabitatElement } from "@/app/components/habitat/types";

interface HabitatData {
	lat: number;
	lng: number;
	color: string;
	size: number;
	label?: string;
	maxR?: number;
	text?: string;
	fontSize?: number;
}





export default function HabitatEditPage() {
	const params = useParams();
	const router = useRouter();
	const decodedName = decodeURIComponent(params.name as string);
	const [habitatData, setHabitatData] = useState<EraGroup[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [currentMap, setCurrentMap] = useState("Map1a_PALEOMAP_PaleoAtlas_000.jpg");
	const [activeTab, setActiveTab] = useState("canvas");
	const habitatEditorRef = useRef<{ getHabitatPoints: () => HabitatElement[] } | null>(null);
	const monacoEditorRef = useRef<{ getHabitatPoints: () => HabitatElement[] } | null>(null);



	// EraGroupからHabitatDataを抽出
	const extractHabitatData = (eraGroups: EraGroup[]): HabitatElement[] => {
		const habitatData: HabitatElement[] = [];
		for (const group of eraGroups) {
			for (const element of group.elements) {
				habitatData.push({
					id: element.id,
					lat: element.lat,
					lng: element.lng,
					color: element.color,
					size: element.size,
					shape: element.shape,
					label: element.label,
					text: element.text,
					fontSize: element.fontSize,
					// transform情報も含める
					scaleX: element.scaleX,
					scaleY: element.scaleY,
					angle: element.angle,
					flipX: element.flipX,
					flipY: element.flipY,
				});
			}
		}
		return habitatData;
	};

	// 分類情報と生息地データを取得
	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const response = await fetch(`/api/classifications/${encodeURIComponent(decodedName)}/habitat-data`);
				if (response.ok) {
					const data = await response.json();
					if (data.habitatData?.content) {
						try {
							const parsedData = JSON.parse(data.habitatData.content);
							// EraGroup[]構造のデータをそのまま使用
							if (Array.isArray(parsedData) && parsedData.length > 0 && 'era' in parsedData[0]) {
								setHabitatData(parsedData);
							} else {
								setHabitatData([]);
							}
						} catch (error) {
							console.error('生息地データのパースに失敗しました:', error);
							setHabitatData([]);
						}
					}
				}
			} catch (error) {
				console.error('データの取得に失敗しました:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [decodedName]);

	// 保存処理
	const handleSave = async (habitatData: EraGroup[]) => {
		const supabase = createClient();
		const { data: { user } } = await supabase.auth.getUser();
		
		if (!user) return;
		
		setIsSaving(true);
		try {
			const { data: { session } } = await supabase.auth.getSession();
			
			// EraGroup[]構造をJSON文字列に変換
			const habitatContent = JSON.stringify(habitatData);
			
			console.log('保存する生息地データ:', habitatData);
			
			const response = await fetch(`/api/classifications/${encodeURIComponent(decodedName)}/habitat-data`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${session?.access_token}`,
				},
				body: JSON.stringify({
					content: habitatContent
				}),
			});

			if (!response.ok) {
				throw new Error('保存に失敗しました');
			}

			toast.success('生息地データを保存しました');
		} catch (error) {
			console.error('保存エラー:', error);
			toast.error('保存に失敗しました');
		} finally {
			setIsSaving(false);
		}
	};

	// FabricHabitatEditorからのデータ変更を処理
	const handleHabitatDataChange = (eraGroups: EraGroup[]) => {
		setHabitatData(eraGroups);
	};

	// Monacoエディターからのデータ変更を処理
	const handleMonacoDataChange = (eraGroups: EraGroup[]) => {
		setHabitatData(eraGroups);
	};

	// 地図変更時の処理
	const handleMapChange = (mapFile: string) => {
		setCurrentMap(mapFile);
	};

	// 現在のエディターから生息地ポイントを取得
	const getCurrentHabitatPoints = () => {
		if (activeTab === "canvas" && habitatEditorRef.current) {
			return habitatEditorRef.current.getHabitatPoints();
		}
		if (activeTab === "json" && monacoEditorRef.current) {
			return monacoEditorRef.current.getHabitatPoints();
		}
		return extractHabitatData(habitatData);
	};

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-center h-64">
					<div>読み込み中...</div>
				</div>
			</div>
		);
	}

	return (
		<GeologicalAgeProvider>
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center gap-4 mb-6">
					<Button
						variant="outline"
						onClick={() => router.push(`/classifications/${encodeURIComponent(decodedName)}`)}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						戻る
					</Button>
					<h1 className="text-2xl font-bold">生息地編集: {decodedName}</h1>
				</div>

				{/* 編集エリア */}
				<div className="mb-8">
					<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="canvas">キャンバス編集</TabsTrigger>
							<TabsTrigger value="json">JSON編集</TabsTrigger>
						</TabsList>
						
						<TabsContent value="canvas" className="mt-6">
							<FabricHabitatEditor
								ref={habitatEditorRef}
								habitatData={habitatData}
								onSave={handleSave}
								showMapSelector={true}
								onMapChange={handleMapChange}
								width={960}
								height={480}
							/>
						</TabsContent>
						
						<TabsContent value="json" className="mt-6">
							<HabitatJsonEditor
								ref={monacoEditorRef}
								habitatData={habitatData}
								onSave={handleSave}
								onDataChange={handleMonacoDataChange}
								showMapSelector={true}
								onMapChange={handleMapChange}
								width={960}
								height={480}
							/>
						</TabsContent>
					</Tabs>
				</div>

				{/* プレビューエリア */}
				<div className="mb-6">
					<h2 className="text-xl font-semibold mb-4">プレビュー</h2>
					<div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
						{/* 地球儀エリアを大きく、余白なしで表示 */}
						<div className="rounded-lg border p-0 bg-black" style={{ width: '100%', height: '600px', position: 'relative' }}>
							<h3 className="text-lg font-medium mb-3 text-white px-4 pt-4">地球儀ビュー</h3>
							<div className="w-full h-full" style={{ height: '500px' }}>
								<Globe 
									customTexture={`/PALEOMAP_PaleoAtlas_Rasters_v3/${currentMap}`}
									habitatPoints={getCurrentHabitatPoints()}
								/>
							</div>
							<div className="flex justify-end px-4 pb-4">
								<Button onClick={() => {
									// 現在のエディターからデータを取得して更新
									setCurrentMap(`${currentMap}?t=${Date.now()}`);
								}}>
									編集内容を反映
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</GeologicalAgeProvider>
	);
} 