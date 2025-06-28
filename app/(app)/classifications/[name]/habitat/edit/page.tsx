"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { ArrowLeft, Plus, Trash2, Map } from "lucide-react";
import { createClient } from "@/app/lib/supabase-browser";

interface HabitatData {
	lat: number;
	lng: number;
	color?: string;
	size?: number;
	maxR?: number;
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

export default function HabitatEditPage() {
	const params = useParams();
	const router = useRouter();
	const decodedName = decodeURIComponent(params.name as string);
	const [habitatData, setHabitatData] = useState<HabitatData[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [selectedMap, setSelectedMap] = useState("Map1a_PALEOMAP_PaleoAtlas_000.jpg");
	const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
	const [mapImageLoaded, setMapImageLoaded] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// 分類情報と生息地データを取得
	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const response = await fetch(`/api/classifications/${encodeURIComponent(decodedName)}`);
				if (response.ok) {
					const data = await response.json();
					if (data.classification?.geographic_data_file) {
						// 生息地データを読み込み
						const habitatResponse = await fetch(data.classification.geographic_data_file);
						if (habitatResponse.ok) {
							const habitatData = await habitatResponse.json();
							setHabitatData(habitatData);
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

	// 地図画像の読み込み
	useEffect(() => {
		setMapImageLoaded(false);
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			setMapImageLoaded(true);
		};
		img.onerror = () => {
			console.error('地図画像の読み込みに失敗しました:', selectedMap);
			setMapImageLoaded(false);
		};
		img.src = `/PALEOMAP_PaleoAtlas_Rasters_v3/${selectedMap}`;
	}, [selectedMap]);

	// 初期読み込み時の画像読み込み
	useEffect(() => {
		if (!mapImageLoaded) {
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.onload = () => {
				setMapImageLoaded(true);
			};
			img.onerror = () => {
				console.error('地図画像の読み込みに失敗しました:', selectedMap);
				setMapImageLoaded(false);
			};
			img.src = `/PALEOMAP_PaleoAtlas_Rasters_v3/${selectedMap}`;
		}
	}, [mapImageLoaded, selectedMap]);

	// キャンバスに地図とポイントを描画
	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');

		if (!canvas || !ctx) return;

		// キャンバスサイズを画面に合わせて設定
		const container = canvas.parentElement;
		if (container) {
			const rect = container.getBoundingClientRect();
			canvas.width = rect.width;
			canvas.height = rect.height;
		} else {
			canvas.width = window.innerWidth - 100;
			canvas.height = window.innerHeight - 200;
		}

		// 新しい画像オブジェクトを作成して描画
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			if (!canvas || !ctx) return;
			
			// 地図をキャンバスに描画（アスペクト比を保持）
			const imgAspect = img.width / img.height;
			const canvasAspect = canvas.width / canvas.height;
			
			let drawWidth, drawHeight, offsetX, offsetY;
			
			if (imgAspect > canvasAspect) {
				// 画像が横長の場合
				drawWidth = canvas.width;
				drawHeight = canvas.width / imgAspect;
				offsetX = 0;
				offsetY = (canvas.height - drawHeight) / 2;
			} else {
				// 画像が縦長の場合
				drawHeight = canvas.height;
				drawWidth = canvas.height * imgAspect;
				offsetX = (canvas.width - drawWidth) / 2;
				offsetY = 0;
			}
			
			ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

			// 生息地ポイントを描画（座標変換を調整）
			habitatData.forEach((point, index) => {
				const x = offsetX + ((point.lng + 180) / 360) * drawWidth;
				const y = offsetY + ((90 - point.lat) / 180) * drawHeight;

				// 選択されたポイントを強調表示
				if (index === selectedPoint) {
					ctx.strokeStyle = '#000';
					ctx.lineWidth = 3;
					ctx.strokeRect(x - 10, y - 10, 20, 20);
				}

				// ポイントを描画
				ctx.fillStyle = point.color || '#ff0000';
				ctx.beginPath();
				ctx.arc(x, y, point.size || 5, 0, 2 * Math.PI);
				ctx.fill();

				// 範囲円を描画
				if (point.maxR) {
					ctx.strokeStyle = point.color || '#ff0000';
					ctx.lineWidth = 2;
					ctx.globalAlpha = 0.5;
					const radius = (point.maxR / 20000) * drawWidth; // 概算の半径
					ctx.beginPath();
					ctx.arc(x, y, radius, 0, 2 * Math.PI);
					ctx.stroke();
					ctx.globalAlpha = 1;
				}

				// ポイント番号を表示
				ctx.fillStyle = '#000';
				ctx.font = '12px Arial';
				ctx.fillText(`${index + 1}`, x + 8, y + 4);
			});
		};
		img.src = `/PALEOMAP_PaleoAtlas_Rasters_v3/${selectedMap}`;
	}, [habitatData, selectedMap, selectedPoint, mapImageLoaded]);

	// キャンバスクリックでポイントを追加
	const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const clickY = event.clientY - rect.top;

		// キャンバスの実際の描画サイズを計算
		const imgAspect = 2.5; // 地図画像の概算アスペクト比
		const canvasAspect = canvas.width / canvas.height;
		
		let drawWidth, drawHeight, offsetX, offsetY;
		
		if (imgAspect > canvasAspect) {
			drawWidth = canvas.width;
			drawHeight = canvas.width / imgAspect;
			offsetX = 0;
			offsetY = (canvas.height - drawHeight) / 2;
		} else {
			drawHeight = canvas.height;
			drawWidth = canvas.height * imgAspect;
			offsetX = (canvas.width - drawWidth) / 2;
			offsetY = 0;
		}

		// クリック位置が地図内かチェック
		if (clickX < offsetX || clickX > offsetX + drawWidth || 
			clickY < offsetY || clickY > offsetY + drawHeight) {
			return; // 地図外のクリックは無視
		}

		// 地図内の相対座標に変換
		const relativeX = (clickX - offsetX) / drawWidth;
		const relativeY = (clickY - offsetY) / drawHeight;

		// 座標を緯度経度に変換
		const lng = relativeX * 360 - 180;
		const lat = 90 - relativeY * 180;

		// 新しいポイントを追加
		const newPoint: HabitatData = {
			lat: Math.round(lat * 1000) / 1000,
			lng: Math.round(lng * 1000) / 1000,
			color: '#ff0000',
			size: 5,
			maxR: undefined
		};

		setHabitatData([...habitatData, newPoint]);
		setSelectedPoint(habitatData.length);
	};

	// 新しい生息地ポイントを追加
	const addHabitatPoint = () => {
		const newPoint: HabitatData = {
			lat: 0,
			lng: 0,
			color: '#ff0000',
			size: 5,
			maxR: undefined
		};
		setHabitatData([...habitatData, newPoint]);
		setSelectedPoint(habitatData.length);
	};

	// 生息地ポイントを削除
	const removeHabitatPoint = (index: number) => {
		setHabitatData(habitatData.filter((_, i) => i !== index));
		if (selectedPoint === index) {
			setSelectedPoint(null);
		} else if (selectedPoint !== null && selectedPoint > index) {
			setSelectedPoint(selectedPoint - 1);
		}
	};

	// 生息地データを更新
	const updateHabitatPoint = (index: number, field: keyof HabitatData, value: any) => {
		const updatedData = [...habitatData];
		updatedData[index] = { ...updatedData[index], [field]: value };
		setHabitatData(updatedData);
	};

	// 保存処理
	const handleSave = async () => {
		setIsSaving(true);
		try {
			const supabase = await createClient();
			const { data: { session } } = await supabase.auth.getSession();
			
			if (!session?.access_token) {
				throw new Error("認証トークンが取得できません");
			}

			// 生息地データをJSON文字列に変換
			const habitatDataJson = JSON.stringify(habitatData, null, 2);

			// 分類情報を更新
			const response = await fetch(`/api/classifications/${encodeURIComponent(decodedName)}`, {
				method: "PUT",
				headers: {
					"Authorization": `Bearer ${session.access_token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					geographic_data_file: habitatDataJson,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "生息地データの保存に失敗しました");
			}

			// 分類ページに戻る
			router.push(`/classifications/${encodeURIComponent(decodedName)}`);
		} catch (error) {
			console.error("生息地データ保存エラー:", error);
			alert("生息地データの保存に失敗しました");
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return <div className="container mx-auto px-4 py-8">読み込み中...</div>;
	}

	return (
		<div className="container mx-auto p-6">
			<div className="flex items-center gap-4 mb-6">
				<Button
					variant="outline"
					onClick={() => router.back()}
					className="flex items-center gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					戻る
				</Button>
				<div>
					<h1 className="text-2xl font-bold mb-2">生息地編集 - {decodedName}</h1>
					<p className="text-gray-600">地図上でポイントを追加・編集して生息地を設定してください</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* 地図エリア */}
				<div className="lg:col-span-3">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Map className="h-5 w-5" />
								地図
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="mb-4">
								<Label htmlFor="map-select">時代を選択</Label>
								<Select value={selectedMap} onValueChange={setSelectedMap}>
									<SelectTrigger id="map-select">
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
							</div>
							<div className="relative w-full h-[70vh] border rounded-lg overflow-hidden">
								<canvas
									ref={canvasRef}
									onClick={handleCanvasClick}
									className="w-full h-full cursor-crosshair"
									style={{ display: 'block' }}
								/>
								{!mapImageLoaded && (
									<div className="absolute inset-0 flex items-center justify-center bg-gray-100">
										<div className="text-gray-500">地図を読み込み中...</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* ポイント編集エリア */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							生息地ポイント
							<Button onClick={addHabitatPoint} className="flex items-center gap-2">
								<Plus className="h-4 w-4" />
								ポイントを追加
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 max-h-96 overflow-y-auto">
						{habitatData.length === 0 ? (
							<p className="text-gray-500 text-center py-8">
								生息地ポイントがありません。地図をクリックするか追加ボタンをクリックしてポイントを追加してください。
							</p>
						) : (
							habitatData.map((point, index) => (
								<Card 
									key={index} 
									className={`p-4 cursor-pointer transition-colors ${
										selectedPoint === index ? 'border-blue-500 bg-blue-50' : ''
									}`}
									onClick={() => setSelectedPoint(index)}
								>
									<div className="flex items-center justify-between mb-4">
										<h3 className="font-semibold">ポイント {index + 1}</h3>
										<Button
											variant="outline"
											size="sm"
											onClick={(e) => {
												e.stopPropagation();
												removeHabitatPoint(index);
											}}
											className="flex items-center gap-2 text-red-600 hover:text-red-700"
										>
											<Trash2 className="h-4 w-4" />
											削除
										</Button>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label htmlFor={`lat-${index}`}>緯度</Label>
											<Input
												id={`lat-${index}`}
												type="number"
												step="any"
												value={point.lat}
												onChange={(e) => updateHabitatPoint(index, 'lat', parseFloat(e.target.value))}
												placeholder="35.6762"
											/>
										</div>
										<div>
											<Label htmlFor={`lng-${index}`}>経度</Label>
											<Input
												id={`lng-${index}`}
												type="number"
												step="any"
												value={point.lng}
												onChange={(e) => updateHabitatPoint(index, 'lng', parseFloat(e.target.value))}
												placeholder="139.6503"
											/>
										</div>
										<div>
											<Label htmlFor={`color-${index}`}>色</Label>
											<Input
												id={`color-${index}`}
												type="color"
												value={point.color || '#ff0000'}
												onChange={(e) => updateHabitatPoint(index, 'color', e.target.value)}
											/>
										</div>
										<div>
											<Label htmlFor={`size-${index}`}>サイズ</Label>
											<Input
												id={`size-${index}`}
												type="number"
												step="0.1"
												value={point.size || 5}
												onChange={(e) => updateHabitatPoint(index, 'size', parseFloat(e.target.value))}
												placeholder="5"
											/>
										</div>
										<div className="col-span-2">
											<Label htmlFor={`maxR-${index}`}>範囲半径（km、空白で点のみ表示）</Label>
											<Input
												id={`maxR-${index}`}
												type="number"
												step="1"
												value={point.maxR || ''}
												onChange={(e) => updateHabitatPoint(index, 'maxR', e.target.value ? parseFloat(e.target.value) : undefined)}
												placeholder="500"
											/>
										</div>
									</div>
								</Card>
							))
						)}
					</CardContent>
				</Card>
			</div>

			<div className="flex justify-end gap-4 mt-6">
				<Button variant="outline" onClick={handleSave} disabled={isSaving}>
					{isSaving ? '保存中...' : '保存'}
				</Button>
			</div>
		</div>
	);
} 