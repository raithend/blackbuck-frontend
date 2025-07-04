import { useRef, useState, useCallback, useEffect } from "react";
import { Circle, FabricText } from "fabric";
import type { Canvas, Object as FabricObject } from "fabric";
import type { HabitatPoint, FabricObjectWithHabitatId } from "./types";

interface UseFabricCanvasProps {
	width: number;
	height: number;
	habitatData: HabitatPoint[];
	onMapChange?: (mapFile: string) => void;
}

export function useFabricCanvas({
	width,
	height,
	habitatData,
	onMapChange,
}: UseFabricCanvasProps) {
	const fabricCanvasRef = useRef<Canvas | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isInitialized, setIsInitialized] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [currentMap, setCurrentMap] = useState("Map1a_PALEOMAP_PaleoAtlas_000.jpg");
	const habitatDataRef = useRef(habitatData);

	// habitatDataの更新を追跡
	useEffect(() => {
		habitatDataRef.current = habitatData;
	}, [habitatData]);

	// ポイントをキャンバスに追加する関数
	const addPointToCanvas = useCallback((point: HabitatPoint) => {
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
			fabricObject = new FabricText(point.text || 'テキスト', {
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
		(fabricObject as FabricObjectWithHabitatId).habitatPointId = point.id;
		canvas.add(fabricObject);
		canvas.renderAll();
		console.log('ポイントをCanvasに追加完了:', point.id);
		
		// habitatPointsの状態を更新
		// setHabitatPoints(prev => {
		// 	const exists = prev.find(p => p.id === point.id);
		// 	if (!exists) {
		// 		return [...prev, point];
		// 	}
		// 	return prev;
		// });
	}, [width, height]);

	// 生息地ポイントの位置を更新
	const updateHabitatPointPosition = useCallback((id: string, left: number, top: number) => {
		// この関数は外部から呼ばれるため、実装は外部で行う
	}, []);

	// 生息地ポイントを削除
	const removeHabitatPoint = useCallback((id: string) => {
		// Canvasからオブジェクトを削除
		if (fabricCanvasRef.current) {
			const canvas = fabricCanvasRef.current;
			const objects = canvas.getObjects();
			const objectToRemove = objects.find((obj: FabricObject) => (obj as FabricObjectWithHabitatId).habitatPointId === id);
			if (objectToRemove) {
				canvas.remove(objectToRemove);
				canvas.renderAll();
				console.log('Canvasからオブジェクトを削除:', id);
			}
		}
	}, []);

	// 選択されたオブジェクトのIDを取得
	const getSelectedObjectId = useCallback(() => {
		return (fabricCanvasRef.current?.getActiveObject() as FabricObjectWithHabitatId)?.habitatPointId;
	}, []);

	// 選択されたオブジェクトのタイプを取得
	const getSelectedObjectType = useCallback(() => {
		return (fabricCanvasRef.current?.getActiveObject() as FabricObject)?.type;
	}, []);

	// 選択されたポイントの情報を取得
	const getSelectedPoint = useCallback((habitatPoints: HabitatPoint[]) => {
		const selectedId = getSelectedObjectId();
		const point = selectedId ? habitatPoints.find(p => p.id === selectedId) : null;
		return point;
	}, [getSelectedObjectId]);

	// 選択されたポイントを更新
	const updateSelectedPoint = useCallback((
		habitatPoints: HabitatPoint[],
		setHabitatPoints: React.Dispatch<React.SetStateAction<HabitatPoint[]>>,
		field: keyof HabitatPoint,
		value: string | number | undefined
	) => {
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
				if ((obj as FabricObjectWithHabitatId).habitatPointId === selectedId) {
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
	}, [getSelectedObjectId]);

	// 地図変更時の処理
	const handleMapChange = useCallback((mapFile: string) => {
		setCurrentMap(mapFile);
		if (onMapChange) {
			onMapChange(mapFile);
		}
		
		// 地図変更時にキャンバスを更新
		if (fabricCanvasRef.current) {
			const canvas = fabricCanvasRef.current;
			// 既存のオブジェクトをクリア
			canvas.clear();
			
			// 新しい地図画像を読み込み
			import('fabric').then(({ Image: FabricImage }) => {
				FabricImage.fromURL(`/PALEOMAP_PaleoAtlas_Rasters_v3/${mapFile}`, {
					crossOrigin: 'anonymous',
				}).then((img) => {
					// 画像をキャンバスサイズに合わせてスケール
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
					
					// 既存のポイントを再追加
					for (const point of habitatDataRef.current) {
						addPointToCanvas(point);
					}
					
					console.log('地図変更完了:', mapFile);
				}).catch((error) => {
					console.error('地図画像読み込みエラー:', error);
				});
			});
		}
	}, [onMapChange, width, height]);

	return {
		fabricCanvasRef,
		canvasRef,
		isInitialized,
		setIsInitialized,
		isLoading,
		setIsLoading,
		currentMap,
		addPointToCanvas,
		updateHabitatPointPosition,
		removeHabitatPoint,
		getSelectedObjectId,
		getSelectedObjectType,
		getSelectedPoint,
		updateSelectedPoint,
		handleMapChange,
	};
} 