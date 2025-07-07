"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { GeologicalAgeProvider } from "@/app/components/geological/geological-context";
import { GeologicalAgeCard } from "@/app/components/geological/geological-age-card";
import GlobeArea from "@/app/components/habitat/globe-area";
import type { EraGroup, HabitatElement } from "@/app/components/habitat/types";

export default function HabitatViewPage() {
	const params = useParams();
	const router = useRouter();
	const decodedName = decodeURIComponent(params.name as string);
	const [habitatData, setHabitatData] = useState<EraGroup[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// 生息地データを取得
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
				toast.error('生息地データの取得に失敗しました');
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [decodedName]);

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-center h-64">
					<div>生息地データを読み込み中...</div>
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
					<h1 className="text-2xl font-bold">生息地表示: {decodedName}</h1>
				</div>

				{/* 生息地データが存在しない場合 */}
				{habitatData.length === 0 && (
					<div className="text-center py-8">
						<p className="text-gray-500 mb-4">生息地データが登録されていません</p>
					</div>
				)}

				{/* 生息地データが存在する場合 */}
				{habitatData.length > 0 && (
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
						<div className="lg:col-span-3">
							<GlobeArea 
								customGeographicFile={JSON.stringify(habitatData)}
								eraGroups={habitatData}
							/>
						</div>
						<div className="lg:col-span-1">
							<GeologicalAgeCard enableMenu={true} />
						</div>
					</div>
				)}
			</div>
		</GeologicalAgeProvider>
	);
} 