"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/app/lib/supabase-browser";
import FabricHabitatEditor from "@/app/components/habitat/fabric-habitat-editor";
import Globe from "@/app/components/habitat/globe";
import { GeologicalAgeCard } from "@/app/components/geological/geological-age-card";
import { GeologicalAgeProvider } from "@/app/components/geological/geological-context";
import { toast } from "sonner";

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

interface HabitatPoint {
	id: string;
	lat: number;
	lng: number;
	color: string;
	size: number;
	shape: 'circle' | 'text';
	label?: string;
	maxR?: number;
	text?: string;
	fontSize?: number;
}

export default function HabitatEditPage() {
	const params = useParams();
	const router = useRouter();
	const decodedName = decodeURIComponent(params.name as string);
	const [habitatData, setHabitatData] = useState<HabitatData[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [currentMap, setCurrentMap] = useState("Map1a_PALEOMAP_PaleoAtlas_000.jpg");

	// HabitatDataをHabitatPointに変換する関数
	const convertToHabitatPoints = (data: HabitatData[]): HabitatPoint[] => {
		return data.map((item, index) => ({
			id: `point-${index}`,
			lat: item.lat,
			lng: item.lng,
			color: item.color,
			size: item.size,
			shape: item.text ? 'text' : 'circle',
			label: item.label,
			maxR: item.maxR,
			text: item.text,
			fontSize: item.fontSize,
		}));
	};

	// HabitatPointをHabitatDataに変換
	const convertToHabitatData = (points: HabitatPoint[]): HabitatData[] => {
		return points.map((point) => ({
			lat: point.lat,
			lng: point.lng,
			color: point.color,
			size: point.size,
			label: point.label,
			maxR: point.maxR,
			text: point.text,
			fontSize: point.fontSize,
		}));
	};

	// 分類情報と生息地データを取得
	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const response = await fetch(`/api/classifications/${encodeURIComponent(decodedName)}`);
				if (response.ok) {
					const data = await response.json();
					if (data.classification?.geographic_data_file) {
						try {
							const habitatData = JSON.parse(data.classification.geographic_data_file);
							setHabitatData(habitatData);
						} catch (error) {
							console.error('生息地データのパースに失敗しました:', error);
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
	const handleSave = async (habitatData: HabitatPoint[]) => {
		const supabase = createClient();
		const { data: { user } } = await supabase.auth.getUser();
		
		if (!user) return;
		
		setIsSaving(true);
		try {
			const { data: { session } } = await supabase.auth.getSession();
			
			// habitatDataをJSON文字列に変換
			const geographicDataFile = JSON.stringify(habitatData);
			
			const response = await fetch(`/api/classifications/${encodeURIComponent(decodedName)}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${session?.access_token}`,
				},
				body: JSON.stringify({
					geographic_data_file: geographicDataFile
				}),
			});

			if (!response.ok) {
				throw new Error('保存に失敗しました');
			}

			toast.success('生息地データを保存しました');
			router.push(`/classifications/${encodeURIComponent(decodedName)}`);
		} catch (error) {
			console.error('保存エラー:', error);
			toast.error('保存に失敗しました');
		} finally {
			setIsSaving(false);
		}
	};

	// FabricHabitatEditorからのデータ変更を処理
	const handleHabitatDataChange = (points: HabitatPoint[]) => {
		const newHabitatData = convertToHabitatData(points);
		setHabitatData(newHabitatData);
	};

	// 地図変更時の処理
	const handleMapChange = (mapFile: string) => {
		setCurrentMap(mapFile);
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
					<FabricHabitatEditor
						habitatData={convertToHabitatPoints(habitatData)}
						onSave={handleSave}
						showMapSelector={true}
						onMapChange={handleMapChange}
						width={1000}
						height={600}
					/>
				</div>

				{/* プレビューエリア */}
				<div className="mb-6">
					<h2 className="text-xl font-semibold mb-4">プレビュー</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* 左側：地球儀 */}
						<div className="bg-white rounded-lg border p-4">
							<h3 className="text-lg font-medium mb-3">地球儀ビュー</h3>
							<div className="h-80 w-full">
								<Globe 
									customTexture={`/PALEOMAP_PaleoAtlas_Rasters_v3/${currentMap}`}
								/>
							</div>
						</div>

						{/* 右側：地質時代カード */}
						<div className="bg-white rounded-lg border p-4">
							<h3 className="text-lg font-medium mb-3">地質時代選択</h3>
							<div className="h-80 overflow-y-auto">
								<GeologicalAgeCard />
							</div>
						</div>
					</div>
				</div>
			</div>
		</GeologicalAgeProvider>
	);
} 