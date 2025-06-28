"use client";

import { useState, useEffect, useMemo } from "react";
import Globe from "./globe";
import { Button } from "@/app/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Label } from "@/app/components/ui/label";

interface HabitatData {
	lat: number;
	lng: number;
	color?: string;
	size?: number;
	maxR?: number;
	polygon?: [number, number][];
}

interface GlobeAreaProps {
	customGeographicFile?: string;
	habitatData?: HabitatData[]; // 生息地データを直接受け取る
	showMapSelector?: boolean; // 地図選択機能を表示するかどうか
}

// 地図画像のリスト
const MAP_IMAGES = [
	{ name: "現在", file: "Map1a_PALEOMAP_PaleoAtlas_000.jpg" },
	{ name: "最終氷期極大期", file: "Map2a_Last_Glacial_Maximum_001.jpg" },
	{ name: "鮮新世", file: "Map3a_Pliocene_004.jpg" },
	{ name: "メッシニアン期", file: "Map4a_Messinian_Event_006.jpg" },
	{ name: "中新世後期", file: "Map5a_Late_Miocene_010.jpg" },
	{ name: "中新世中期", file: "Map6a_Middle_Miocene_015.jpg" },
	{ name: "中新世前期", file: "Map7a_Early_Miocene_020.jpg" },
	{ name: "漸新世後期", file: "Map8a_Late_Oligocene_025.jpg" },
	{ name: "漸新世前期", file: "Map9a_Early_Oligocene_030.jpg" },
	{ name: "始新世後期", file: "Map10a_Late_Eocene_035.jpg" },
	{ name: "始新世中期", file: "Map11a_MIddle_Eocene_040.jpg" },
	{ name: "始新世前期", file: "Map12a_early_Middle_Eocene_045.jpg" },
	{ name: "始新世最前期", file: "Map13a_Early_Eocene_050.jpg" },
	{ name: "PETM", file: "Map14a_PETM_055.jpg" },
	{ name: "暁新世", file: "Map15a_Paleocene_060.jpg" },
];

// 生息地データ付きの地図画像を生成
const generateMapWithHabitat = (mapName: string, habitatData: HabitatData[]) => {
	return new Promise<string>((resolve, reject) => {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			reject(new Error('Canvas context not available'));
			return;
		}

		// キャンバスサイズを設定
		canvas.width = 800;
		canvas.height = 400;

		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			console.log('地図画像の読み込み成功:', mapName);
			console.log('画像サイズ:', img.width, 'x', img.height);
			
			// 地図をキャンバスに描画
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

			console.log('生息地データ:', habitatData);

			// 生息地ポイントを描画
			habitatData.forEach((habitat, index) => {
				if (habitat.lat !== undefined && habitat.lng !== undefined) {
					// 緯度経度をキャンバス座標に変換
					const x = ((habitat.lng + 180) / 360) * canvas.width;
					const y = ((90 - habitat.lat) / 180) * canvas.height;

					console.log(`ポイント${index + 1}:`, {
						lat: habitat.lat,
						lng: habitat.lng,
						canvasX: x,
						canvasY: y,
						color: habitat.color,
						size: habitat.size
					});

					// 座標がキャンバス内にあるかチェック
					if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
						if (habitat.maxR) {
							// 範囲円を描画
							ctx.strokeStyle = habitat.color || 'red';
							ctx.lineWidth = 2;
							ctx.globalAlpha = 0.5;
							const radius = Math.min((habitat.maxR / 20000) * canvas.width, 50); // 半径を制限
							ctx.beginPath();
							ctx.arc(x, y, radius, 0, 2 * Math.PI);
							ctx.stroke();
							ctx.globalAlpha = 1;
						} else {
							// 点を描画（サイズを小さくして見やすくする）
							const pointSize = Math.min(Math.max((habitat.size || 0.05) * 50, 4), 20); // サイズを制限
							ctx.fillStyle = habitat.color || 'red';
							ctx.beginPath();
							ctx.arc(x, y, pointSize, 0, 2 * Math.PI);
							ctx.fill();

							// 点の境界線を描画
							ctx.strokeStyle = 'white';
							ctx.lineWidth = 1;
							ctx.stroke();

							// ポイント番号を表示
							ctx.fillStyle = 'white';
							ctx.font = 'bold 12px Arial';
							ctx.fillText(`${index + 1}`, x + pointSize + 3, y + 3);
						}
					} else {
						console.warn(`ポイント${index + 1}がキャンバス外:`, { x, y, canvasWidth: canvas.width, canvasHeight: canvas.height });
					}
				}
			});

			// キャンバスをデータURLに変換
			const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
			console.log('生成された画像URL:', dataUrl.substring(0, 100) + '...');
			resolve(dataUrl);
		};
		img.onerror = (error) => {
			console.error('地図画像の読み込みに失敗:', mapName, error);
			reject(new Error(`Failed to load map image: ${mapName}`));
		};
		img.src = `/PALEOMAP_PaleoAtlas_Rasters_v3/${mapName}`;
	});
};

export default function GlobeArea({ 
	customGeographicFile, 
	habitatData,
	showMapSelector = true 
}: GlobeAreaProps) {
	const [customTexture, setCustomTexture] = useState<string | undefined>(undefined);
	const [isGenerating, setIsGenerating] = useState(false);
	const [currentMap, setCurrentMap] = useState("Map1a_PALEOMAP_PaleoAtlas_000.jpg");
	const [showDebug, setShowDebug] = useState(false); // デバッグ表示フラグ

	// 生息地データ付きの地図画像を生成
	useEffect(() => {
		setIsGenerating(true);
		
		// 生息地データがある場合は生息地付き画像を生成、ない場合は通常の地図画像を使用
		if (habitatData && habitatData.length > 0) {
			generateMapWithHabitat(currentMap, habitatData)
				.then(dataUrl => {
					setCustomTexture(dataUrl);
					setIsGenerating(false);
				})
				.catch(error => {
					console.error('地図画像の生成に失敗しました:', error);
					// エラー時は通常の地図画像を使用
					setCustomTexture(`/PALEOMAP_PaleoAtlas_Rasters_v3/${currentMap}`);
					setIsGenerating(false);
				});
		} else {
			// 生息地データがない場合は通常の地図画像を使用
			setCustomTexture(`/PALEOMAP_PaleoAtlas_Rasters_v3/${currentMap}`);
			setIsGenerating(false);
		}
	}, [habitatData, currentMap]);

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
								{MAP_IMAGES.map((map) => (
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
			
			{isGenerating && (
				<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
					<div className="text-white">地図を生成中...</div>
				</div>
			)}

			{/* デバッグ表示 */}
			{showDebug && (
				<div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-md max-h-96 overflow-y-auto">
					<h3 className="font-semibold mb-2">デバッグ: 生成された画像</h3>
					{customTexture && (
						<img 
							src={customTexture} 
							alt="生成された地図画像" 
							className="w-full h-auto border border-gray-300 rounded"
						/>
					)}
					<div className="mt-2 text-sm text-gray-600">
						<p>生息地データ: {habitatData?.length || 0}件</p>
						<p>地図: {currentMap}</p>
						<p>画像パス: {customTexture}</p>
						{habitatData && habitatData.length > 0 && (
							<div className="mt-2">
								<h4 className="font-medium">生息地データ詳細:</h4>
								{habitatData.map((habitat, index) => (
									<div key={index} className="text-xs mt-1 p-1 bg-gray-100 rounded">
										<p>ポイント{index + 1}:</p>
										<p>緯度: {habitat.lat}, 経度: {habitat.lng}</p>
										<p>色: {habitat.color || 'red'}</p>
										<p>サイズ: {habitat.size || 0.05}</p>
										{habitat.maxR && <p>範囲: {habitat.maxR}km</p>}
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}

			<Globe 
				customTexture={customTexture}
			/>
		</div>
	);
}
