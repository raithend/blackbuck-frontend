"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Globe from "./globe";
import { Button } from "@/app/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Label } from "@/app/components/ui/label";
import { useGeologicalAge } from "../geological/geological-context";
import geologicalAgesData from "@/app/data/geological-ages.json";
import { generateMapWithHabitat } from "@/app/components/habitat/map-utils";

import type { HabitatElement } from "./types";

type HabitatData = HabitatElement;

// 新しい構造の型定義
interface EraGroup {
	era: string;
	elements: HabitatData[];
}

interface GlobeAreaProps {
	customGeographicFile?: string;
	eraGroups?: EraGroup[]; // 時代グループデータ
	showMapSelector?: boolean; // 地図選択機能を表示するかどうか
}

// geological-ages.jsonから地図情報を取得する関数
const getMapImages = () => {
	const mapImages: { name: string; file: string }[] = [];
	
	// すべてのera, period, epoch, ageからmap情報を収集
	for (const era of geologicalAgesData.eras) {
		if (era.map) {
			mapImages.push({ name: era.name, file: `${era.map}.jpg` });
		}
		for (const period of era.periods) {
			if (period.map) {
				mapImages.push({ name: period.name, file: `${period.map}.jpg` });
			}
			for (const epoch of period.epochs) {
				if (epoch.map) {
					mapImages.push({ name: epoch.name, file: `${epoch.map}.jpg` });
				}
				if (epoch.ages) {
					for (const age of epoch.ages) {
						if (age.map) {
							mapImages.push({ name: age.name, file: `${age.map}.jpg` });
						}
					}
				}
			}
		}
	}
	
	// 重複を除去して返す
	return mapImages.filter((map, index, self) => 
		index === self.findIndex(m => m.file === map.file)
	);
};

export default function GlobeArea({ 
	customGeographicFile, 
	eraGroups,
	showMapSelector = true 
}: GlobeAreaProps) {
	console.log('=== GlobeArea レンダリング ===');
	console.log('customGeographicFile:', customGeographicFile);
	console.log('eraGroups:', eraGroups);
	console.log('showMapSelector:', showMapSelector);
	const { selectedMap } = useGeologicalAge();
	const [customTexture, setCustomTexture] = useState<string | undefined>(undefined);
	const [isGenerating, setIsGenerating] = useState(false);
	const [currentMap, setCurrentMap] = useState("Map1a_PALEOMAP_PaleoAtlas_000.jpg");
	const [isInitialized, setIsInitialized] = useState(false);
	
	// 初期地図を設定
	useEffect(() => {
		console.log('=== GlobeArea 初期地図設定useEffect実行 ===');
		console.log('customTexture:', customTexture);
		console.log('isInitialized:', isInitialized);
		if (!customTexture && !isInitialized) {
			console.log('初期地図を設定:', `/PALEOMAP_PaleoAtlas_Rasters_v3/${currentMap}`);
			setCustomTexture(`/PALEOMAP_PaleoAtlas_Rasters_v3/${currentMap}`);
			setIsInitialized(true);
		}
	}, [customTexture, currentMap, isInitialized]);
	const [showDebug, setShowDebug] = useState(false); // デバッグ表示フラグ

	// 地質時代の選択に応じて地図を更新
	useEffect(() => {
		console.log('=== GlobeArea 地質時代選択useEffect実行 ===');
		console.log('selectedMap:', selectedMap);
		if (selectedMap) {
			const mapFileName = `${selectedMap}.jpg`;
			console.log('地図ファイル名を更新:', mapFileName);
			setCurrentMap(mapFileName);
		}
	}, [selectedMap]);

	// 生息地データ付きの地図画像を生成
	useEffect(() => {
		console.log('=== GlobeArea 生息地データ地図生成useEffect実行 ===');
		console.log('currentMap:', currentMap);
		console.log('customTexture:', customTexture);
		console.log('eraGroups:', eraGroups);
		
		// 既に同じテクスチャが設定されている場合はスキップ
		const expectedTexture = `/PALEOMAP_PaleoAtlas_Rasters_v3/${currentMap}`;
		console.log('expectedTexture:', expectedTexture);
		if (customTexture === expectedTexture) {
			console.log('同じテクスチャが既に設定されているためスキップ');
			return;
		}
		
		// 時代グループから生息地データを平坦化
		const dataToUse: HabitatData[] = eraGroups ? eraGroups.flatMap(eraGroup => eraGroup.elements) : [];
		console.log('dataToUse:', dataToUse);
		
		// 生息地データがない場合は通常の地図画像を使用
		if (dataToUse.length === 0) {
			console.log('生息地データなし - 通常の地図画像を使用');
			setCustomTexture(expectedTexture);
			return;
		}
		
		console.log('生息地データあり - 生息地付き画像を生成開始');
		setIsGenerating(true);
		
		// 生息地データがある場合は生息地付き画像を生成
		generateMapWithHabitat(currentMap, dataToUse)
			.then(dataUrl => {
				console.log('生息地付き画像生成成功');
				setCustomTexture(dataUrl);
				setIsGenerating(false);
			})
			.catch(error => {
				console.error('地図画像の生成に失敗しました:', error);
				// エラー時は通常の地図画像を使用
				setCustomTexture(expectedTexture);
				setIsGenerating(false);
			});
	}, [currentMap, eraGroups, customTexture]);

	return (
		<div className="h-[calc(100vh-4rem)]">
			{showMapSelector && (
				<div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
					<div className="space-y-2">
						<Label htmlFor="map-select">時代を選択</Label>
						<Select value={currentMap} onValueChange={setCurrentMap}>
							<SelectTrigger id="map-select" className="w-48">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{getMapImages().map((map) => (
									<SelectItem key={map.file} value={map.file}>
										{map.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button 
							variant="outline" 
							size="sm" 
							onClick={() => setShowDebug(!showDebug)}
						>
							{showDebug ? 'デバッグ非表示' : 'デバッグ表示'}
						</Button>
					</div>
				</div>
			)}
			
			{/* デバッグ表示 */}
			{showDebug && (
				<div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-md max-h-96 overflow-y-auto">
					<h3 className="font-semibold mb-2">デバッグ: 生成された画像</h3>
					{customTexture && (
						<Image 
							src={customTexture} 
							alt="生成された地図画像" 
							width={400}
							height={300}
							className="w-full h-auto border border-gray-300 rounded"
						/>
					)}
					<div className="mt-2 text-sm text-gray-600">
						<p>生息地データ: {eraGroups ? eraGroups.flatMap(g => g.elements).length : 0}件</p>
						<p>地図: {currentMap}</p>
						<p>画像パス: {customTexture}</p>
						<p>フォーマット: PNG（高画質）</p>
						{customTexture?.startsWith('data:image/') && (
							<p>生成画像サイズ: {customTexture.length > 100 ? '高解像度' : '標準'}</p>
						)}
						{eraGroups && (
							<div className="mt-2">
								<h4 className="font-medium">生息地データ詳細:</h4>
								{eraGroups.map((eraGroup) => (
									<div key={`era-${eraGroup.era}`} className="text-xs mt-1 p-1 bg-blue-100 rounded">
										<p className="font-medium">時代: {eraGroup.era}</p>
										{eraGroup.elements.map((habitat) => (
											<div key={`habitat-${eraGroup.era}-${habitat.lat}-${habitat.lng}`} className="text-xs mt-1 p-1 bg-gray-100 rounded ml-2">
												<p>ポイント: {habitat.id || 'unknown'}</p>
												<p>緯度: {habitat.lat}, 経度: {habitat.lng}</p>
												<p>色: {habitat.color || 'red'}</p>
												<p>サイズ: {habitat.size || 0.05}</p>
												{habitat.maxR && <p>範囲: {habitat.maxR}km</p>}
											</div>
										))}
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}

			{customTexture && (
				<Globe 
					customTexture={customTexture}
					habitatPoints={eraGroups ? eraGroups.flatMap(eraGroup => eraGroup.elements) : []}
				/>
			)}
		</div>
	);
}