"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Globe from "./globe";

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
	creator?: User; // 作成者情報
}



const GlobeArea = React.memo<GlobeAreaProps>(({ 
	customGeographicFile, 
	eraGroups,
	creator 
}) => {
	const { selectedMap, selectedAgeIds } = useGeologicalAge();
	const [customTexture, setCustomTexture] = useState<string | undefined>(undefined);
	const [isGenerating, setIsGenerating] = useState(false);

	const [isInitialized, setIsInitialized] = useState(false);
	const [currentTextureKey, setCurrentTextureKey] = useState<string | undefined>(undefined);
	
	// 生息地情報の時代からID配列を作成
	const habitatEraIds = useMemo(() => {
		return getHabitatEraIds(eraGroups || []);
	}, [eraGroups]);
	

	
	// テクスチャ生成のキーをメモ化
	const textureKey = useMemo(() => {
		// 重複がある場合のみ生息地データを使用
		const shouldShowHabitat = hasOverlap(habitatEraIds, selectedAgeIds);
		
		if (!shouldShowHabitat || !eraGroups || eraGroups.length === 0) {
			return `${selectedMap}_empty`;
		}
		
		const dataKey = eraGroups.flatMap(eraGroup => 
			eraGroup.elements?.map(item => 
				`${item.lat},${item.lng},${item.color},${item.size},${item.scaleX || 1},${item.scaleY || 1},${item.angle || 0},${item.flipX || false},${item.flipY || false}`
			) || []
		).join('|');
		return `${selectedMap}_${dataKey}`;
	}, [selectedMap, eraGroups, habitatEraIds, selectedAgeIds]);
	
	// 初期地図を設定
	useEffect(() => {
		if (!customTexture && !isInitialized) {
			setCustomTexture(`/PALEOMAP_PaleoAtlas_Rasters_v3/${selectedMap}.jpg`);
			setIsInitialized(true);
		}
	}, [customTexture, selectedMap, isInitialized]);
	




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
			const expectedTexture = `/PALEOMAP_PaleoAtlas_Rasters_v3/${selectedMap}.jpg`;
			setCustomTexture(expectedTexture);
			setCurrentTextureKey(textureKey);
			return;
		}
		
		setIsGenerating(true);
		
		// 生息地データがある場合は生息地付き画像を生成
		generateMapWithHabitat(`${selectedMap}.jpg`, dataToUse)
			.then(dataUrl => {
				setCustomTexture(dataUrl);
				setCurrentTextureKey(textureKey);
				setIsGenerating(false);
			})
			.catch(error => {
				const errorMessage = error.message ? error.message : error.toString();
				console.error('地図画像の生成に失敗しました:', errorMessage.length > 20 ? `${errorMessage.substring(0, 20)}...` : errorMessage);
				// エラー時は通常の地図画像を使用
				const expectedTexture = `/PALEOMAP_PaleoAtlas_Rasters_v3/${selectedMap}.jpg`;
				setCustomTexture(expectedTexture);
				setCurrentTextureKey(textureKey);
				setIsGenerating(false);
			});
	}, [textureKey, currentTextureKey, selectedMap, eraGroups, habitatEraIds, selectedAgeIds]);

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