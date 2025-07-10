"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Globe from "./globe";
import { Button } from "@/app/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Label } from "@/app/components/ui/label";
import { useGeologicalAge } from "../geological/geological-context";
import geologicalAgesData from "@/app/data/geological-ages.json";
import { generateMapWithHabitat } from "@/app/components/habitat/map-utils";
import { getHabitatEraIds, hasOverlap } from "@/app/lib/globe-age-utils";
import { CreatorCard } from "../creator/creator-card";
import type { User } from "@/app/types/types";

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
	creator?: User; // 作成者情報
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

const GlobeArea = React.memo<GlobeAreaProps>(({ 
	customGeographicFile, 
	eraGroups,
	showMapSelector = true,
	creator 
}) => {
	const { selectedMap, selectedAgeIds } = useGeologicalAge();
	const [customTexture, setCustomTexture] = useState<string | undefined>(undefined);
	const [isGenerating, setIsGenerating] = useState(false);
	const [currentMap, setCurrentMap] = useState("Map1a_PALEOMAP_PaleoAtlas_000.jpg");
	const [isInitialized, setIsInitialized] = useState(false);
	const [currentTextureKey, setCurrentTextureKey] = useState<string | undefined>(undefined);
	
	// 生息地情報の時代からID配列を作成
	const habitatEraIds = useMemo(() => {
		return getHabitatEraIds(eraGroups || []);
	}, [eraGroups]);
	
	// 重複チェックとコンソール出力
	useEffect(() => {
		console.log('=== selectedAgeIds ===');
		console.log('selectedAgeIds:', selectedAgeIds);
		
		if (habitatEraIds.length > 0 && selectedAgeIds.length > 0) {
			const overlap = hasOverlap(habitatEraIds, selectedAgeIds);
			console.log('生息地表示判定:', overlap);
		}
	}, [habitatEraIds, selectedAgeIds]);
	
	// テクスチャ生成のキーをメモ化
	const textureKey = useMemo(() => {
		// 重複がある場合のみ生息地データを使用
		const shouldShowHabitat = hasOverlap(habitatEraIds, selectedAgeIds);
		
		if (!shouldShowHabitat || !eraGroups || eraGroups.length === 0) {
			return `${currentMap}_empty`;
		}
		
		const dataKey = eraGroups.flatMap(eraGroup => 
			eraGroup.elements?.map(item => `${item.lat},${item.lng},${item.color},${item.size}`) || []
		).join('|');
		return `${currentMap}_${dataKey}`;
	}, [currentMap, eraGroups, habitatEraIds, selectedAgeIds]);
	
	// 初期地図を設定
	useEffect(() => {
		if (!customTexture && !isInitialized) {
			setCustomTexture(`/PALEOMAP_PaleoAtlas_Rasters_v3/${currentMap}`);
			setIsInitialized(true);
		}
	}, [customTexture, currentMap, isInitialized]);
	
	const [showDebug, setShowDebug] = useState(false); // デバッグ表示フラグ

	// 地質時代の選択に応じて地図を更新
	useEffect(() => {
		if (selectedMap) {
			const mapFileName = `${selectedMap}.jpg`;
			setCurrentMap(mapFileName);
		}
	}, [selectedMap]);

	// 生息地データ付きの地図画像を生成（最適化版）
	useEffect(() => {
		// 同じテクスチャキーの場合はスキップ
		if (textureKey === currentTextureKey) {
			return;
		}
		
		// 重複がある場合のみ生息地データを使用
		const shouldShowHabitat = hasOverlap(habitatEraIds, selectedAgeIds);
		
		// 時代グループから生息地データを平坦化
		const dataToUse: HabitatData[] = (shouldShowHabitat && eraGroups) ? eraGroups.flatMap(eraGroup => {
			return eraGroup.elements || [];
		}) : [];
		
		// 生息地データがない場合は通常の地図画像を使用
		if (dataToUse.length === 0) {
			const expectedTexture = `/PALEOMAP_PaleoAtlas_Rasters_v3/${currentMap}`;
			setCustomTexture(expectedTexture);
			setCurrentTextureKey(textureKey);
			return;
		}
		
		setIsGenerating(true);
		
		// 生息地データがある場合は生息地付き画像を生成
		generateMapWithHabitat(currentMap, dataToUse)
			.then(dataUrl => {
				setCustomTexture(dataUrl);
				setCurrentTextureKey(textureKey);
				setIsGenerating(false);
			})
			.catch(error => {
				const errorMessage = error.message ? error.message : error.toString();
				console.error('地図画像の生成に失敗しました:', errorMessage.length > 20 ? `${errorMessage.substring(0, 20)}...` : errorMessage);
				// エラー時は通常の地図画像を使用
				const expectedTexture = `/PALEOMAP_PaleoAtlas_Rasters_v3/${currentMap}`;
				setCustomTexture(expectedTexture);
				setCurrentTextureKey(textureKey);
				setIsGenerating(false);
			});
	}, [textureKey, currentTextureKey, currentMap, eraGroups, habitatEraIds, selectedAgeIds]);

	// 生息地データをメモ化
	const habitatPoints = useMemo(() => {
		// 重複がある場合のみ生息地データを返す
		const shouldShowHabitat = hasOverlap(habitatEraIds, selectedAgeIds);
		
		if (!shouldShowHabitat || !eraGroups) {
			return [];
		}
		
		return eraGroups.flatMap(eraGroup => eraGroup.elements);
	}, [eraGroups, habitatEraIds, selectedAgeIds]);

	return (
		<div className="h-[calc(100vh-4rem)] relative">
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
					habitatPoints={habitatPoints}
					/>
			)}
			
			{/* 作成者表示 */}
			{creator && (
				<div className="absolute bottom-4 right-4 z-10">
					<CreatorCard user={creator} />
				</div>
			)}
		</div>
	);
});

GlobeArea.displayName = 'GlobeArea';

export default GlobeArea;