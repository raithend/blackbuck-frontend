"use client";

import React, { useEffect, useRef, useState, useLayoutEffect, useCallback, forwardRef, useImperativeHandle, useMemo } from "react";
import { Canvas, FabricImage } from "fabric";
import type { FabricObject } from "fabric";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { HabitatToolbar } from "./habitat-toolbar";
import { HabitatPointList } from "./habitat-point-list";
import { HabitatPropertiesPanel } from "./habitat-properties-panel";
import { useFabricCanvas } from "./use-fabric-canvas";
import type { HabitatPoint, FabricHabitatEditorProps, FabricObjectWithHabitatId } from "./types";
import geologicalAgesData from "@/app/data/geological-ages.json";
import { GeologicalAgeCard } from "@/app/components/geological/geological-age-card";
import { useGeologicalAge } from "@/app/components/geological/geological-context";
import { Button } from "@/app/components/ui/button";

const FabricHabitatEditor = forwardRef(function FabricHabitatEditor({
	habitatData = [],
	onSave,
	showMapSelector = true,
	width = 800,
	height = 600,
	onMapChange
}: FabricHabitatEditorProps, ref) {
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
	const [habitatPoints, setHabitatPoints] = useState<HabitatPoint[]>(habitatData);
	const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);

	// 地質時代コンテキストを使用
	const { selectedMap, selectedAgeIds, setSelectedMap, setSelectedAgeIds } = useGeologicalAge();

	const {
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
	} = useFabricCanvas({
		width,
		height,
		habitatData,
		onMapChange,
	});

	// ツールバーの色変更時に選択中のオブジェクトを更新
	const handleColorChange = (color: string) => {
		setPointColor(color);
		pointColorRef.current = color; // refも即座に更新
		const point = getSelectedPoint(habitatPoints);
		if (selectedObject || point) {
			updateSelectedPoint(habitatPoints, setHabitatPoints, 'color', color);
		}
	};

	// ツールバーのサイズ変更時に選択中のオブジェクトを更新
	const handleSizeChange = (size: number) => {
		setPointSize(size);
		pointSizeRef.current = size; // refも即座に更新
		const point = getSelectedPoint(habitatPoints);
		if (selectedObject || point) {
			updateSelectedPoint(habitatPoints, setHabitatPoints, 'size', size);
		}
	};

	// ツールバーのテキスト内容変更時に選択中のオブジェクトを更新
	const handleTextContentChange = (text: string) => {
		setTextContent(text);
		textContentRef.current = text; // refも即座に更新
		const point = getSelectedPoint(habitatPoints);
		if (selectedObject || point) {
			updateSelectedPoint(habitatPoints, setHabitatPoints, 'text', text);
		}
	};

	// ツールバーのフォントサイズ変更時に選択中のオブジェクトを更新
	const handleFontSizeChange = (size: number) => {
		setFontSize(size);
		fontSizeRef.current = size; // refも即座に更新
		const point = getSelectedPoint(habitatPoints);
		if (selectedObject || point) {
			updateSelectedPoint(habitatPoints, setHabitatPoints, 'fontSize', size);
		}
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

	// 現在選択されている時代の情報を取得する関数
	const getCurrentGeologicalAgeInfo = useCallback(() => {
		// 既に取得したselectedMapとselectedAgeIdsを使用
		console.log('getCurrentGeologicalAgeInfo呼び出し - selectedMap:', selectedMap, 'selectedAgeIds:', selectedAgeIds);
		
		if (selectedAgeIds.length > 0) {
			// 選択された地図から時代を特定
			if (selectedMap) {
				for (const era of geologicalAgesData.eras) {
					// eraレベルで一致（最も上位の階層）
					if (selectedAgeIds.includes(Number.parseInt(era.id)) && era.map === selectedMap) {
						console.log('eraレベルで一致（地図確認済み）:', era.name);
						return {
							era: era.name,
							period: undefined,
							epoch: undefined,
							age: undefined,
							ageIds: [Number.parseInt(era.id)], // eraのIDのみを含める
							map: selectedMap
						};
					}
					
					for (const period of era.periods) {
						// periodレベルで一致
						if (selectedAgeIds.includes(Number.parseInt(period.id)) && period.map === selectedMap) {
							console.log('periodレベルで一致（地図確認済み）:', era.name, period.name);
							return {
								era: era.name,
								period: period.name,
								epoch: undefined,
								age: undefined,
								ageIds: [Number.parseInt(period.id)], // periodのIDのみを含める
								map: selectedMap
							};
						}
						
						for (const epoch of period.epochs) {
							// epochレベルで一致
							if (selectedAgeIds.includes(Number.parseInt(epoch.id)) && epoch.map === selectedMap) {
								console.log('epochレベルで一致（地図確認済み）:', era.name, period.name, epoch.name);
								return {
									era: era.name,
									period: period.name,
									epoch: epoch.name,
									age: undefined,
									ageIds: [Number.parseInt(epoch.id)], // epochのIDのみを包含める
									map: selectedMap
								};
							}
							
							// ageレベルで一致
							if (epoch.ages) {
								for (const age of epoch.ages) {
									if (selectedAgeIds.includes(Number.parseInt(age.id)) && age.map === selectedMap) {
										console.log('ageレベルで一致（地図確認済み）:', era.name, period.name, epoch.name, age.name);
										return {
											era: era.name,
											period: period.name,
											epoch: epoch.name,
											age: age.name,
											ageIds: [Number.parseInt(age.id)], // ageのIDのみを含める
											map: selectedMap
										};
									}
								}
							}
						}
					}
				}
			}
			
			// 地図が一致しない場合は、IDのみで判定（フォールバック）
			for (const era of geologicalAgesData.eras) {
				// eraレベルで一致（最も上位の階層）
				if (selectedAgeIds.includes(Number.parseInt(era.id))) {
					console.log('eraレベルで一致（フォールバック）:', era.name);
					return {
						era: era.name,
						period: undefined,
						epoch: undefined,
						age: undefined,
						ageIds: [Number.parseInt(era.id)], // eraのIDのみを含める
						map: selectedMap
					};
				}
				
				for (const period of era.periods) {
					// periodレベルで一致
					if (selectedAgeIds.includes(Number.parseInt(period.id))) {
						console.log('periodレベルで一致（フォールバック）:', era.name, period.name);
						return {
							era: era.name,
							period: period.name,
							epoch: undefined,
							age: undefined,
							ageIds: [Number.parseInt(period.id)], // periodのIDのみを含める
							map: selectedMap
						};
					}
					
					for (const epoch of period.epochs) {
						// epochレベルで一致
						if (selectedAgeIds.includes(Number.parseInt(epoch.id))) {
							console.log('epochレベルで一致（フォールバック）:', era.name, period.name, epoch.name);
							return {
								era: era.name,
								period: period.name,
								epoch: epoch.name,
								age: undefined,
								ageIds: [Number.parseInt(epoch.id)], // epochのIDのみを包含める
								map: selectedMap
							};
						}
						
						// ageレベルで一致
						if (epoch.ages) {
							for (const age of epoch.ages) {
								if (selectedAgeIds.includes(Number.parseInt(age.id))) {
									console.log('ageレベルで一致（フォールバック）:', era.name, period.name, epoch.name, age.name);
									return {
										era: era.name,
										period: period.name,
										epoch: epoch.name,
										age: age.name,
										ageIds: [Number.parseInt(age.id)], // ageのIDのみを含める
										map: selectedMap
									};
								}
							}
						}
					}
				}
			}
		}
		
		// 何も選択されていない場合はデフォルト値を返す
		return {
			era: "顕生代",
			period: undefined,
			epoch: undefined,
			age: undefined,
			ageIds: [],
			map: selectedMap
		};
	}, [selectedMap, selectedAgeIds]);

	// 保存
	const handleSave = () => {
		console.log('保存ボタンがクリックされました');
		console.log('onSave関数:', onSave);
		console.log('現在のselectedAgeIds:', selectedAgeIds);
		console.log('現在のselectedMap:', selectedMap);
		
		// 時代情報を含むデータを生成
		const habitatDataWithAge = habitatPoints.map(point => {
			// ポイントに時代情報がない場合は現在選択されている時代を設定
			if (!point.geologicalAge) {
				const currentAgeInfo = getCurrentGeologicalAgeInfo();
				console.log('getCurrentGeologicalAgeInfo結果:', currentAgeInfo);
				return {
					...point,
					geologicalAge: currentAgeInfo
				};
			}
			return point;
		});
		
		console.log('保存するデータ:', habitatDataWithAge);
		console.log('保存するデータ詳細:', habitatDataWithAge.map(point => ({
			id: point.id,
			shape: point.shape,
			text: point.text,
			fontSize: point.fontSize,
			color: point.color,
			size: point.size,
			geologicalAge: point.geologicalAge
		})));
		
		if (onSave) {
			onSave(habitatDataWithAge);
			console.log('onSave関数を呼び出しました');
		} else {
			console.log('onSave関数が定義されていません');
		}
	};

	// 選択イベントの処理
	const handleSelection = (e: any) => {
		const selected = (e.selected?.[0] as FabricObject) || (e.target as FabricObject);
		setSelectedObject(selected);
		
		// 選択されたオブジェクトの色とサイズをツールバーに反映
		if (selected) {
			const obj = selected as FabricObjectWithHabitatId;
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
	const handleObjectModified = (e: any) => {
		const obj = e.target as FabricObjectWithHabitatId;
		if (obj?.habitatPointId) {
			updateHabitatPointPosition(obj.habitatPointId, obj.left || 0, obj.top || 0);
		}
	};

	// オブジェクト削除イベントの処理
	const handleObjectRemoved = (e: any) => {
		const obj = e.target as FabricObjectWithHabitatId;
		if (obj?.habitatPointId) {
			removeHabitatPoint(obj.habitatPointId);
		}
	};

	// 生息地ポイントの位置を更新
	const updateHabitatPointPositionHandler = (id: string, left: number, top: number) => {
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
	const removeHabitatPointHandler = useCallback((id: string) => {
		// Canvasからオブジェクトを削除
		removeHabitatPoint(id);
		
		// habitatPointsの状態からも削除
		setHabitatPoints(prev => prev.filter(point => point.id !== id));
		
		// 削除されたポイントが選択されていた場合は選択をクリア
		if (selectedObject && (selectedObject as FabricObjectWithHabitatId).habitatPointId === id) {
			setSelectedObject(null);
		}
		
		console.log('ポイントを削除しました:', id);
	}, [selectedObject, removeHabitatPoint, setHabitatPoints, setSelectedObject]);

	// 地質時代情報を取得する関数
	const getGeologicalAgeInfo = () => {
		if (selectedAgeIds.length === 0) return null;

		// 選択された時代IDから地質時代情報を取得
		const ageId = selectedAgeIds[0]; // 最初のIDを使用
		
		for (const era of geologicalAgesData.eras) {
			for (const period of era.periods) {
				for (const epoch of period.epochs) {
					const age = epoch.ages?.find(a => a.id === ageId.toString());
					if (age) {
						return {
							era: era.name,
							period: period.name,
							epoch: epoch.name,
							age: age.name,
							ageIds: selectedAgeIds,
							map: selectedMap
						};
					}
				}
			}
		}
		return null;
	};

	// 選択されたポイントに地質時代情報を追加
	const addGeologicalAgeToSelectedPoint = useCallback(() => {
		const ageInfo = getCurrentGeologicalAgeInfo();
		const selectedPoint = getSelectedPoint(habitatPoints);
		if (!selectedPoint) {
			console.log('ポイントが選択されていません');
			return;
		}

		// 選択されたポイントに地質時代情報を追加
		const updatedPoints = habitatPoints.map(point => {
			if (point.id === selectedPoint.id) {
				return {
					...point,
					geologicalAge: ageInfo
				};
			}
			return point;
		});

		setHabitatPoints(updatedPoints);
		console.log('時代情報を追加しました:', ageInfo);
	}, [habitatPoints, getCurrentGeologicalAgeInfo, getSelectedPoint, setHabitatPoints]);

	// キャンバスクリックイベントの処理
	const handleCanvasClick = useCallback((e: any) => {
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
		
		console.log('新しいポイント作成:', {
			currentTool,
			textContentRef: textContentRef.current,
			fontSizeRef: fontSizeRef.current,
			newPoint
		});
		
		setHabitatPoints(prev => [...prev, newPoint]);
		addPointToCanvas(newPoint);
	}, [width, height, addPointToCanvas]);

	// ポイント選択時の処理
	const handlePointSelect = useCallback((pointId: string) => {
		if (fabricCanvasRef.current) {
			const obj = fabricCanvasRef.current.getObjects().find(
				(o: FabricObject) => (o as FabricObjectWithHabitatId).habitatPointId === pointId
			);
			if (obj) {
				fabricCanvasRef.current.setActiveObject(obj);
				fabricCanvasRef.current.requestRenderAll();
			}
		}
	}, []);

	// プロパティ変更時の処理
	const handlePropertyChange = useCallback((field: keyof HabitatPoint, value: string | number | undefined) => {
		updateSelectedPoint(habitatPoints, setHabitatPoints, field, value);
	}, [habitatPoints, setHabitatPoints]);

	// Canvas初期化
	useLayoutEffect(() => {
		console.log('Canvas初期化useEffect開始');
		
		if (!canvasRef.current) {
			console.log('canvasRefが存在しないため初期化をスキップ');
			return;
		}

		if (fabricCanvasRef.current) {
			console.log('Canvasが既に存在するため初期化をスキップ');
			return;
		}

		console.log('Canvas初期化開始 - サイズ:', width, 'x', height);

		try {
			// Fabric.js Canvasオブジェクトを作成
			const canvas = new Canvas(canvasRef.current, {
				width,
				height,
				backgroundColor: '#f0f0f0',
			});

			fabricCanvasRef.current = canvas;
			console.log('Fabric.js Canvasオブジェクト作成完了');

			// イベントリスナーを設定
			canvas.on('mouse:down', handleCanvasClick);

			canvas.on('selection:created', handleSelection);
			canvas.on('selection:updated', handleSelection);
			canvas.on('selection:cleared', handleSelectionCleared);
			canvas.on('object:modified', handleObjectModified);
			canvas.on('object:removed', handleObjectRemoved);

			console.log('イベントリスナー設定完了');

			setIsInitialized(true);
			console.log('Fabric.jsキャンバスの初期化が完了しました - isInitializedをtrueに設定');

		} catch (error) {
			console.error('Canvas初期化エラー:', error);
		}

		// クリーンアップ関数
		return () => {
			console.log('Canvas初期化useEffectクリーンアップ');
			if (fabricCanvasRef.current) {
				try {
					fabricCanvasRef.current.dispose();
					console.log('クリーンアップ時にCanvasを破棄しました');
				} catch (error) {
					console.error('Canvasクリーンアップエラー:', error);
				}
				fabricCanvasRef.current = null;
			}
		};
	}, [width, height]);

	// 地図画像読み込み
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
			FabricImage.fromURL(`/PALEOMAP_PaleoAtlas_Rasters_v3/${currentMap}`, {
				crossOrigin: 'anonymous',
			}).then((img) => {
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
			}).catch((error) => {
				console.error('地図画像読み込みエラー:', error);
				setIsLoading(false);
			});
		}, 100);

		return () => {
			clearTimeout(loadTimeout);
		};
	}, [currentMap, isInitialized, width, height]);

	// 生息地ポイントの更新を別のuseEffectで管理
	useEffect(() => {
		if (fabricCanvasRef.current && isInitialized && !isLoading) {
			// 既存のポイントをクリア（地図画像は保持）
			const canvas = fabricCanvasRef.current;
			const objects = canvas.getObjects();
			const nonImageObjects = objects.filter(obj => !(obj instanceof FabricImage));
			nonImageObjects.forEach(obj => canvas.remove(obj));
			
			// 新しいポイントを追加
			for (const point of habitatData) {
				addPointToCanvas(point);
			}
		}
	}, [habitatData, isInitialized, isLoading, addPointToCanvas]);

	// コンポーネントのマウント状態を管理（クリーンアップ処理を改善）
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

	useEffect(() => {
		setHabitatPoints(habitatData);
	}, [habitatData]);

	useImperativeHandle(ref, () => ({
		getHabitatPoints: () => habitatPoints
	}), [habitatPoints]);

	// 地質時代の選択に応じて地図を更新（初期化時のみ、かつ地図が実際に変更された場合のみ）
	useEffect(() => {
		console.log('地質時代選択useEffect開始 - selectedMap:', selectedMap, 'isInitialized:', isInitialized, 'currentMap:', currentMap);
		
		if (selectedMap && isInitialized && currentMap !== `${selectedMap}.jpg`) {
			console.log('地図変更を実行 - selectedMap:', selectedMap, 'currentMap:', currentMap);
			const mapFileName = `${selectedMap}.jpg`;
			handleMapChange(mapFileName);
		} else {
			console.log('地図変更をスキップ - 条件を満たしていません');
		}
	}, [selectedMap, isInitialized, currentMap, handleMapChange]);

	// タブコンテンツをメモ化して不要な再レンダリングを防ぐ（依存配列を最適化）
	const ageTabContent = useMemo(() => {
		console.log('ageTabContent再計算 - selectedObject:', !!selectedObject);
		return (
			<div className="space-y-4">
				<GeologicalAgeCard enableMenu={false} />
				<Button 
					onClick={addGeologicalAgeToSelectedPoint}
					className="w-full"
					disabled={!selectedObject}
				>
					選択中のポイントに時代を設定
				</Button>
			</div>
		);
	}, [selectedObject, addGeologicalAgeToSelectedPoint]);

	const pointsTabContent = useMemo(() => {
		console.log('pointsTabContent再計算 - habitatPoints:', habitatPoints.length);
		return (
			<HabitatPointList
				habitatPoints={habitatPoints}
				selectedObjectId={getSelectedObjectId()}
				onPointSelect={handlePointSelect}
				onPointDelete={removeHabitatPointHandler}
			/>
		);
	}, [habitatPoints, getSelectedObjectId, handlePointSelect, removeHabitatPointHandler]);

	const propertiesTabContent = useMemo(() => {
		console.log('propertiesTabContent再計算 - habitatPoints:', habitatPoints.length);
		return (
			<HabitatPropertiesPanel
				selectedPoint={getSelectedPoint(habitatPoints) || null}
				onPropertyChange={handlePropertyChange}
			/>
		);
	}, [habitatPoints, getSelectedPoint, handlePropertyChange]);

	return (
		<div className="w-full">
			{/* ツールバー */}
			<HabitatToolbar
				selectedTool={selectedTool}
				onToolChange={handleToolChange}
				pointColor={pointColor}
				onColorChange={handleColorChange}
				pointSize={pointSize}
				onSizeChange={handleSizeChange}
				textContent={textContent}
				onTextContentChange={handleTextContentChange}
				fontSize={fontSize}
				onFontSizeChange={handleFontSizeChange}
				onUndo={handleUndo}
				onRedo={handleRedo}
				onSave={handleSave}
			/>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
				{/* メインキャンバスエリア */}
				<div className="lg:col-span-3">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span>生息地編集</span>
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
					<Tabs defaultValue="age" className="w-full">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="age">時代選択</TabsTrigger>
							<TabsTrigger value="points">ポイント</TabsTrigger>
							<TabsTrigger value="properties">プロパティ</TabsTrigger>
						</TabsList>
						
						<TabsContent value="age">
							{ageTabContent}
						</TabsContent>
						
						<TabsContent value="points" className="space-y-4">
							{pointsTabContent}
						</TabsContent>

						<TabsContent value="properties">
							{propertiesTabContent}
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
});

export default FabricHabitatEditor; 