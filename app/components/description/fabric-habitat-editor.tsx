"use client";

import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import { Canvas, Image, Circle, Text } from "fabric";
import type { Object as FabricObject } from "fabric";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { 
	MousePointer, 
	Circle as LucideCircle,
	Type,
	Undo,
	Redo,
	Save,
	Trash2
} from 'lucide-react';
import type { TEvent } from "fabric";

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

interface FabricHabitatEditorProps {
	habitatData?: HabitatPoint[];
	onSave?: (data: HabitatPoint[]) => void;
	showMapSelector?: boolean;
	width?: number;
	height?: number;
	onMapChange?: (mapFile: string) => void;
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

export default function FabricHabitatEditor({
	habitatData = [],
	onSave,
	showMapSelector = true,
	width = 800,
	height = 600,
	onMapChange
}: FabricHabitatEditorProps) {
	const fabricCanvasRef = useRef<Canvas | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [selectedTool, setSelectedTool] = useState<'select' | 'circle' | 'text'>('select');
	const currentToolRef = useRef(selectedTool);
	const [pointColor, setPointColor] = useState('#ff0000');
	const [pointSize, setPointSize] = useState(20);
	const [textContent, setTextContent] = useState('テキスト');
	const [fontSize, setFontSize] = useState(16);
	const pointColorRef = useRef('#ff0000');
	const pointSizeRef = useRef(20);
	const textContentRef = useRef('テキスト');
	const fontSizeRef = useRef(16);

	// ツールバーの色変更時に選択中のオブジェクトを更新
	const handleColorChange = (color: string) => {
		setPointColor(color);
		pointColorRef.current = color; // refも即座に更新
		// 選択中のオブジェクトまたはポイントがあれば必ず反映
		const point = getSelectedPoint();
		if (selectedObject || point) {
			updateSelectedPoint('color', color);
		}
	};

	// ツールバーのサイズ変更時に選択中のオブジェクトを更新
	const handleSizeChange = (size: number) => {
		setPointSize(size);
		pointSizeRef.current = size; // refも即座に更新
		const point = getSelectedPoint();
		if (selectedObject || point) {
			updateSelectedPoint('size', size);
		}
	};

	// ツールバーのテキスト内容変更時に選択中のオブジェクトを更新
	const handleTextContentChange = (text: string) => {
		setTextContent(text);
		textContentRef.current = text; // refも即座に更新
		const point = getSelectedPoint();
		if (selectedObject || point) {
			updateSelectedPoint('text', text);
		}
	};

	// ツールバーのフォントサイズ変更時に選択中のオブジェクトを更新
	const handleFontSizeChange = (size: number) => {
		setFontSize(size);
		fontSizeRef.current = size; // refも即座に更新
		const point = getSelectedPoint();
		if (selectedObject || point) {
			updateSelectedPoint('fontSize', size);
		}
	};
	const [habitatPoints, setHabitatPoints] = useState<HabitatPoint[]>(habitatData);
	const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [currentMap, setCurrentMap] = useState(MAP_IMAGES[0].file);



	// Fabric.jsキャンバスの初期化
	useEffect(() => {
		console.log('Canvas初期化useEffect開始');
		
		// 既に初期化済みの場合はスキップ
		if (fabricCanvasRef.current && isInitialized) {
			console.log('既に初期化済みのためスキップ');
			return;
		}
		
		if (!canvasRef.current) {
			console.log('canvasRefが存在しないため初期化をスキップ');
			return;
		}

		// 既存のCanvasをクリーンアップ
		if (fabricCanvasRef.current) {
			try {
				fabricCanvasRef.current.dispose();
				console.log('既存のCanvasをクリーンアップしました');
			} catch (error) {
				console.error('既存のCanvasのクリーンアップに失敗しました:', error);
			}
			fabricCanvasRef.current = null;
		}

		const canvas = canvasRef.current;
		console.log('Canvas初期化開始 - サイズ:', width, 'x', height);
		
		try {
			// 高解像度でFabric.jsキャンバスを初期化
			const fabricCanvas = new Canvas(canvas, {
				width,
				height,
				backgroundColor: '#f0f0f0',
				selection: true,
				preserveObjectStacking: true,
				enableRetinaScaling: true,
				imageSmoothingEnabled: true,
				imageSmoothingQuality: 'high' as ImageSmoothingQuality,
				renderOnAddRemove: true,
				skipTargetFind: false,
				selectionBorderColor: '#2196F3',
				selectionColor: 'rgba(33, 150, 243, 0.3)',
				selectionLineWidth: 2,
			});

			console.log('Fabric.js Canvasオブジェクト作成完了');

			// レンダリング品質を最適化
			fabricCanvas.renderOnAddRemove = true;
			fabricCanvas.skipTargetFind = false;
			fabricCanvas.selection = true;

			fabricCanvasRef.current = fabricCanvas;

			// イベントリスナーを設定
			// @ts-ignore
			fabricCanvas.on('selection:created', handleSelection);
			// @ts-ignore
			fabricCanvas.on('selection:updated', handleSelection);
			fabricCanvas.on('selection:cleared', handleSelectionCleared);
			// @ts-ignore
			fabricCanvas.on('object:modified', handleObjectModified);
			// @ts-ignore
			fabricCanvas.on('object:removed', handleObjectRemoved);
			// @ts-ignore
			fabricCanvas.on('mouse:down', handleCanvasClick);
			
			// 追加のデバッグイベント
			fabricCanvas.on('mouse:down', (e) => {
				console.log('mouse:downイベント:', e);
				console.log('クリックされたオブジェクト:', e.target);
				console.log('現在の選択ツール:', currentToolRef.current);
			});

			console.log('イベントリスナー設定完了');

			// 初期化完了をマーク
			setIsInitialized(true);
			console.log('Fabric.jsキャンバスの初期化が完了しました - isInitializedをtrueに設定');
		} catch (error) {
			console.error('Fabric.jsキャンバスの初期化に失敗しました:', error);
			setIsInitialized(false);
			console.log('エラーのためisInitializedをfalseに設定');
		}

		// クリーンアップ
		return () => {
			console.log('Canvas初期化useEffectクリーンアップ');
			if (fabricCanvasRef.current) {
				try {
					fabricCanvasRef.current.dispose();
					console.log('クリーンアップ時にCanvasを破棄しました');
				} catch (error) {
					console.error('Canvasのクリーンアップに失敗しました:', error);
				}
				fabricCanvasRef.current = null;
			}
		};
	}, [width, height, isInitialized]);

	// 地図画像の読み込み
	useEffect(() => {
		console.log('地図画像読み込みuseEffect開始 - fabricCanvasRef:', !!fabricCanvasRef.current, 'isInitialized:', isInitialized);
		
		if (!fabricCanvasRef.current || !isInitialized) {
			console.log('地図画像読み込みをスキップ - fabricCanvasRef:', !!fabricCanvasRef.current, 'isInitialized:', isInitialized);
			return;
		}

		// 読み込みを遅延させてFast Refreshとの競合を避ける
		const loadTimeout = setTimeout(() => {
			console.log('地図画像読み込みタイムアウト開始');
			
			if (!fabricCanvasRef.current) {
				console.log('Canvasが存在しないため地図画像読み込みをスキップ');
				return;
			}

			console.log('地図画像読み込み開始:', currentMap);
			setIsLoading(true);
			const canvas = fabricCanvasRef.current;

			// 既存のオブジェクトをクリア
			canvas.clear();

			// 高品質な画像読み込み
			Image.fromURL(`/PALEOMAP_PaleoAtlas_Rasters_v3/${currentMap}`, {
				crossOrigin: 'anonymous',
			}, {
				imageSmoothingEnabled: true,
				imageSmoothingQuality: 'high' as ImageSmoothingQuality,
			}).then((img: Image) => {
				console.log('地図画像読み込み成功:', img.width, 'x', img.height);
				
				// Canvasの存在を再チェック
				if (!fabricCanvasRef.current) {
					console.log('Canvasが存在しないため地図画像処理をスキップ');
					return;
				}

				// 画像をキャンバスサイズに合わせてスケール（縦横比を保持）
				const scaleX = width / (img.width || 1);
				const scaleY = height / (img.height || 1);
				const scale = Math.min(scaleX, scaleY);

				img.scale(scale);
				img.set({
					left: (width - (img.width || 0) * scale) / 2,
					top: (height - (img.height || 0) * scale) / 2,
					selectable: false,
					evented: false,
				});

				canvas.add(img);
				canvas.sendObjectToBack(img);
				canvas.renderAll();

				console.log('地図画像をCanvasに追加完了');

				// 初期の生息地ポイントを追加（propsから受け取ったデータ）
				for (const point of habitatData) {
					addPointToCanvas(point);
				}
				
				console.log('生息地ポイント追加完了:', habitatData.length, '個');
				
				setIsLoading(false);
				console.log('地図画像の読み込みが完了しました - isLoadingをfalseに設定');
			}).catch((error: unknown) => {
				console.error('地図画像の読み込みに失敗しました:', error);
				setIsLoading(false);
				console.log('エラーのためisLoadingをfalseに設定');
			});
		}, 100); // 100ms遅延

		// クリーンアップ
		return () => {
			console.log('地図画像読み込みuseEffectクリーンアップ');
			clearTimeout(loadTimeout);
		};
	}, [currentMap, width, height, isInitialized, habitatData, habitatData.length]);

	// 地図変更時のコールバック
	useEffect(() => {
		if (onMapChange) {
			onMapChange(currentMap);
		}
	}, [currentMap, onMapChange]);

	// habitatDataの変更を監視して初期ポイントを設定
	useEffect(() => {
		if (fabricCanvasRef.current && isInitialized && !isLoading) {
			// 既存のポイントオブジェクトを削除
			const canvas = fabricCanvasRef.current;
			const objects = canvas.getObjects();
			for (const obj of objects) {
				if ((obj as FabricObject & { habitatPointId?: string }).habitatPointId) {
					canvas.remove(obj);
				}
			}
			
			// 新しいポイントを追加
			for (const point of habitatData) {
				addPointToCanvas(point);
			}
			
			canvas.renderAll();
		}
	}, [habitatData, isInitialized, isLoading]);

	// キャンバスにポイントを追加（高品質）
	const addPointToCanvas = (point: HabitatPoint) => {
		console.log('addPointToCanvas呼び出し:', point);
		
		if (!fabricCanvasRef.current) {
			console.log('Canvasが存在しないためポイント追加をスキップ');
			return;
		}

		const canvas = fabricCanvasRef.current;

		// 緯度経度をキャンバス座標に変換
		const x = ((point.lng + 180) / 360) * width;
		const y = ((90 - point.lat) / 180) * height;
		console.log('キャンバス座標に変換:', x, y);

		let fabricObject: FabricObject;

		if (point.shape === 'circle') {
			// 円形オブジェクトを作成
			fabricObject = new Circle({
				left: x,
				top: y,
				fill: point.color,
				stroke: '#ffffff',
				strokeWidth: 2,
				radius: point.size / 2,
				originX: 'center' as const,
				originY: 'center' as const,
				selectable: true,
				evented: true,
			});
		} else if (point.shape === 'text') {
			// テキストオブジェクトを作成
			fabricObject = new Text(point.text || 'テキスト', {
				left: x,
				top: y,
				fontSize: point.fontSize || 16,
				fill: point.color,
				originX: 'center' as const,
				originY: 'center' as const,
				selectable: true,
				evented: true,
			});
		} else {
			return; // 不明な形状の場合は処理をスキップ
		}

		// オブジェクトにカスタムデータを追加
		(fabricObject as FabricObject & { habitatPointId?: string }).habitatPointId = point.id;
		canvas.add(fabricObject);
		canvas.renderAll();
		console.log('ポイントをCanvasに追加完了:', point.id);
		
		// habitatPointsの状態を更新
		setHabitatPoints(prev => {
			const exists = prev.find(p => p.id === point.id);
			if (!exists) {
				return [...prev, point];
			}
			return prev;
		});
	};

	// 選択イベントの処理
	// @ts-ignore
	const handleSelection = (e: TEvent) => {
		const selected = (e.selected?.[0] as FabricObject) || (e.target as FabricObject);
		setSelectedObject(selected);
		
		// 選択されたオブジェクトの色とサイズをツールバーに反映
		if (selected) {
			const obj = selected as FabricObject & { habitatPointId?: string };
			if (obj.habitatPointId) {
				const point = habitatPoints.find(p => p.id === obj.habitatPointId);
				if (point) {
					setPointColor(point.color);
					setPointSize(point.size);
					if (point.text) {
						setTextContent(point.text);
					}
					if (point.fontSize) {
						setFontSize(point.fontSize);
					}
				}
			}
		}
	};

	// 選択解除イベントの処理
	const handleSelectionCleared = () => {
		setSelectedObject(null);
	};

	// オブジェクト変更イベントの処理
	// @ts-ignore
	const handleObjectModified = (e: TEvent) => {
		const obj = e.target as FabricObject & { habitatPointId?: string };
		if (obj?.habitatPointId) {
			updateHabitatPointPosition(obj.habitatPointId, obj.left || 0, obj.top || 0);
		}
	};

	// オブジェクト削除イベントの処理
	// @ts-ignore
	const handleObjectRemoved = (e: TEvent) => {
		const obj = e.target as FabricObject & { habitatPointId?: string };
		if (obj?.habitatPointId) {
			removeHabitatPoint(obj.habitatPointId);
		}
	};

	// 生息地ポイントの位置を更新
	const updateHabitatPointPosition = (id: string, left: number, top: number) => {
		const updatedPoints = habitatPoints.map(point => {
			if (point.id === id) {
				// キャンバス座標を緯度経度に変換
				const lng = (left / width) * 360 - 180;
				const lat = 90 - (top / height) * 180;
				return { ...point, lat, lng };
			}
			return point;
		});
		setHabitatPoints(updatedPoints);
	};

	// 生息地ポイントを削除
	const removeHabitatPoint = (id: string) => {
		// Canvasからオブジェクトを削除
		if (fabricCanvasRef.current) {
			const canvas = fabricCanvasRef.current;
			const objects = canvas.getObjects();
			const objectToRemove = objects.find((obj: FabricObject) => (obj as FabricObject & { habitatPointId?: string }).habitatPointId === id);
			if (objectToRemove) {
				canvas.remove(objectToRemove);
				canvas.renderAll();
				console.log('Canvasからオブジェクトを削除:', id);
			}
		}
		
		// 状態からも削除
		setHabitatPoints(prev => prev.filter(point => point.id !== id));
	};

	// キャンバスクリックイベントの処理
	const handleCanvasClick = (e: TEvent) => {
		const currentTool = currentToolRef.current;
		if (currentTool === 'select') return;

		if (!fabricCanvasRef.current) {
			console.log('Canvasが存在しないためクリックを無視');
			return;
		}

		const canvas = fabricCanvasRef.current;
		const pointer = canvas.getPointer(e.e);
		console.log('クリック位置:', pointer.x, pointer.y);

		// 緯度経度を計算
		const lng = (pointer.x / width) * 360 - 180;
		const lat = 90 - (pointer.y / height) * 180;
		console.log('計算された緯度経度:', lat, lng);

		// 新しいポイントを作成
		const newPoint: HabitatPoint = {
			id: `point_${Date.now()}`,
			lat,
			lng,
			color: pointColorRef.current, // refの最新値を使用
			size: pointSizeRef.current,   // refの最新値を使用
			shape: currentTool === 'text' ? 'text' : 'circle',
			text: currentTool === 'text' ? textContentRef.current : undefined,
			fontSize: currentTool === 'text' ? fontSizeRef.current : undefined,
		};
		setHabitatPoints(prev => [...prev, newPoint]);
		addPointToCanvas(newPoint);
	};

	// ツール変更の処理
	const handleToolChange = (tool: typeof selectedTool) => {
		setSelectedTool(tool);
		currentToolRef.current = tool; // 即座にrefを更新
		if (fabricCanvasRef.current) {
			fabricCanvasRef.current.defaultCursor = tool === 'select' ? 'default' : 'crosshair';
		}
	};

	// 元に戻す
	const handleUndo = () => {
		// TODO: 実装
	};

	// やり直し
	const handleRedo = () => {
		// TODO: 実装
	};

	// 保存
	const handleSave = () => {
		console.log('保存ボタンがクリックされました');
		console.log('onSave関数:', onSave);
		console.log('保存するデータ:', habitatPoints);
		if (onSave) {
			onSave(habitatPoints);
			console.log('onSave関数を呼び出しました');
		} else {
			console.log('onSave関数が定義されていません');
		}
	};

	// 選択されたポイントを更新
	const updateSelectedPoint = (field: keyof HabitatPoint, value: string | number | undefined) => {
		const selectedId = getSelectedObjectId();
		if (!selectedId) {
			return;
		}
		const updatedPoints = habitatPoints.map(point => {
			if (point.id === selectedId) {
				return { ...point, [field]: value };
			}
			return point;
		});
		setHabitatPoints(updatedPoints);
		if (fabricCanvasRef.current) {
			const canvas = fabricCanvasRef.current;
			for (const obj of canvas.getObjects()) {
				if ((obj as FabricObject & { habitatPointId?: string }).habitatPointId === selectedId) {
					if (field === 'color') {
						obj.set('fill', value);
					} else if (field === 'size' && typeof value === 'number') {
						if (obj.type === 'circle') {
							obj.set('radius', value / 2);
						} else {
							obj.set('width', value);
							obj.set('height', value);
						}
					} else if (field === 'text' && typeof value === 'string') {
						if (obj.type === 'text') {
							obj.set('text', value);
						}
					} else if (field === 'fontSize' && typeof value === 'number') {
						if (obj.type === 'text') {
							obj.set('fontSize', value);
						}
					}
				}
			}
			canvas.renderAll();
		}
	};

	// 選択されたオブジェクトのIDを取得
	const getSelectedObjectId = () => {
		return (selectedObject as FabricObject & { habitatPointId?: string })?.habitatPointId;
	};

	// 選択されたオブジェクトのタイプを取得
	const getSelectedObjectType = () => {
		return (selectedObject as FabricObject)?.type;
	};

	// 選択されたポイントの情報を取得
	const getSelectedPoint = () => {
		const selectedId = getSelectedObjectId();
		const point = selectedId ? habitatPoints.find(p => p.id === selectedId) : null;
		return point;
	};

	// コンポーネントのマウント状態を管理
	useEffect(() => {
		console.log('コンポーネントマウント開始');
		
		// クリーンアップ関数
		return () => {
			console.log('コンポーネントアンマウント開始');
			
			// アンマウント時にCanvasをクリーンアップ
			if (fabricCanvasRef.current) {
				try {
					fabricCanvasRef.current.dispose();
					console.log('アンマウント時にCanvasを破棄しました');
				} catch (error) {
					console.error('アンマウント時のCanvasクリーンアップに失敗しました:', error);
				}
				fabricCanvasRef.current = null;
			}
			// 状態をリセット
			setIsInitialized(false);
			setIsLoading(false);
			console.log('アンマウント時に状態をリセットしました');
		};
	}, []);



	return (
		<div className="w-full">
			{/* ツールバー */}
			<div className="flex items-center gap-2 mb-4 p-4 bg-gray-100 rounded-lg">
				<div className="flex items-center gap-1">
					<Button
						variant={selectedTool === 'select' ? 'default' : 'outline'}
						size="sm"
						onClick={() => handleToolChange('select')}
					>
						<MousePointer className="h-4 w-4" />
					</Button>
					<Button
						variant={selectedTool === 'circle' ? 'default' : 'outline'}
						size="sm"
						onClick={() => handleToolChange('circle')}
					>
						<LucideCircle className="h-4 w-4" />
					</Button>
					<Button
						variant={selectedTool === 'text' ? 'default' : 'outline'}
						size="sm"
						onClick={() => handleToolChange('text')}
					>
						<Type className="h-4 w-4" />
					</Button>
				</div>

				<div className="flex items-center gap-2 ml-4">
					<Label htmlFor="point-color">色:</Label>
					<Input
						id="point-color"
						type="color"
						value={pointColor}
						onChange={(e) => handleColorChange(e.target.value)}
						className="w-16 h-8"
					/>
					{selectedTool === 'circle' && (
						<>
							<Label htmlFor="point-size">サイズ:</Label>
							<Input
								id="point-size"
								type="number"
								value={pointSize}
								onChange={(e) => handleSizeChange(Number(e.target.value))}
								className="w-20"
								min="5"
								max="100"
							/>
						</>
					)}
					{selectedTool === 'text' && (
						<>
							<Label htmlFor="text-content">テキスト:</Label>
							<Input
								id="text-content"
								type="text"
								value={textContent}
								onChange={(e) => handleTextContentChange(e.target.value)}
								className="w-32"
							/>
							<Label htmlFor="font-size">フォントサイズ:</Label>
							<Input
								id="font-size"
								type="number"
								value={fontSize}
								onChange={(e) => handleFontSizeChange(Number(e.target.value))}
								className="w-20"
								min="8"
								max="72"
							/>
						</>
					)}
				</div>

				<div className="flex items-center gap-1 ml-4">
					<Button variant="outline" size="sm" onClick={handleUndo}>
						<Undo className="h-4 w-4" />
					</Button>
					<Button variant="outline" size="sm" onClick={handleRedo}>
						<Redo className="h-4 w-4" />
					</Button>
					<Button size="sm" onClick={handleSave}>
						<Save className="h-4 w-4 mr-2" />
						保存
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
				{/* メインキャンバスエリア */}
				<div className="lg:col-span-3">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span>生息地編集</span>
								{showMapSelector && (
									<Select value={currentMap} onValueChange={setCurrentMap}>
										<SelectTrigger className="w-48">
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
								)}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="relative border rounded-lg overflow-hidden">
								<canvas
									ref={canvasRef}
									className="cursor-crosshair"
									width={width}
									height={height}
								/>
								{!isInitialized && (
									<div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-20">
										<div className="text-center">
											<div>キャンバスを初期化中...</div>
											<div className="text-sm text-gray-500 mt-1">
												canvasRef: {canvasRef.current ? '存在' : 'なし'}, 
												fabricCanvas: {fabricCanvasRef.current ? '存在' : 'なし'}
											</div>
										</div>
									</div>
								)}
								{isLoading && (
									<div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
										<div>地図を読み込み中...</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* 編集パネル */}
				<div className="lg:col-span-1">
					<Tabs defaultValue="points" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="points">ポイント</TabsTrigger>
							<TabsTrigger value="properties">プロパティ</TabsTrigger>
						</TabsList>
						
						<TabsContent value="points" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">生息地ポイント</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									{habitatPoints.length === 0 ? (
										<div className="text-center text-gray-500 py-4">
											<p>ポイントがありません</p>
											<p className="text-sm mt-1">地図をクリックしてポイントを追加してください</p>
										</div>
									) : (
										habitatPoints.map((point) => (
											<div
												key={point.id}
												className={`p-3 border rounded-lg cursor-pointer transition-colors ${
													getSelectedObjectId() === point.id
														? 'border-blue-500 bg-blue-50'
														: 'border-gray-200 hover:border-gray-300'
												}`}
												onClick={() => {
													// ポイントを選択状態にする
													if (fabricCanvasRef.current) {
														const obj = fabricCanvasRef.current.getObjects().find(
															(o: FabricObject) => (o as FabricObject & { habitatPointId?: string }).habitatPointId === point.id
														);
														if (obj) {
															fabricCanvasRef.current.setActiveObject(obj);
															fabricCanvasRef.current.requestRenderAll();
														}
													}
												}}
											>
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<div
															className="w-4 h-4 rounded"
															style={{ backgroundColor: point.color }}
														/>
														<span className="font-medium">
															{point.label || `ポイント${point.id}`}
														</span>
													</div>
													<Button
														variant="outline"
														size="sm"
														onClick={(e) => {
															e.stopPropagation();
															removeHabitatPoint(point.id);
														}}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
												<div className="text-sm text-gray-600 mt-1">
													{point.lat.toFixed(3)}, {point.lng.toFixed(3)}
												</div>
											</div>
										))
									)}
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="properties">
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">プロパティ編集</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{getSelectedPoint() ? (
										<>
											<div>
												<Label htmlFor="point-label">ラベル</Label>
												<Input
													id="point-label"
													value={getSelectedPoint()?.label || ''}
													onChange={(e) => updateSelectedPoint('label', e.target.value)}
													placeholder="ポイント名"
												/>
											</div>
											<div>
												<Label htmlFor="point-color-edit">色</Label>
												<Input
													id="point-color-edit"
													type="color"
													value={getSelectedPoint()?.color || '#ff0000'}
													onChange={(e) => updateSelectedPoint('color', e.target.value)}
												/>
											</div>
											<div>
												<Label htmlFor="point-size-edit">サイズ</Label>
												<Input
													id="point-size-edit"
													type="number"
													value={getSelectedPoint()?.size || 20}
													onChange={(e) => updateSelectedPoint('size', Number(e.target.value))}
													min="5"
													max="100"
												/>
											</div>
											<div>
												<Label htmlFor="point-range">範囲半径（km）</Label>
												<Input
													id="point-range"
													type="number"
													value={getSelectedPoint()?.maxR || ''}
													onChange={(e) => updateSelectedPoint('maxR', e.target.value ? Number(e.target.value) : undefined)}
													placeholder="500"
												/>
											</div>
										</>
									) : (
										<div className="text-center text-gray-500 py-4">
											<p>ポイントを選択してください</p>
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}