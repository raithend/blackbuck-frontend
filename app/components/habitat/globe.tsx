"use client";

import type React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { generateMapWithHabitat } from "@/app/components/habitat/map-utils";
import type { HabitatElement } from "@/app/components/habitat/types";

interface GlobeProps {
	customTexture?: string; // カスタムテクスチャのURL（生息地データ付きの地図画像）
	habitatPoints?: { lat: number; lng: number; color: string; size: number }[];
}

const GlobeComponent: React.FC<GlobeProps> = ({ 
	customTexture,
	habitatPoints = []
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isLoading, setIsLoading] = useState(false);
	
	// シーン関連のrefs
	const sceneRef = useRef<THREE.Scene | null>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const globeRef = useRef<THREE.Mesh | null>(null);
	const controlsRef = useRef<OrbitControls | null>(null);
	const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
	
	// テクスチャキャッシュ
	const textureCache = useRef<Map<string, THREE.Texture>>(new Map());
	
	// 初期化フラグ
	const isInitialized = useRef(false);
	
	// カメラ状態の保存
	const stateRef = useRef<{
		cameraPosition: THREE.Vector3;
		cameraRotation: THREE.Euler;
		target: THREE.Vector3;
	}>({
		cameraPosition: new THREE.Vector3(0, 0, 15),
		cameraRotation: new THREE.Euler(0, 0, 0),
		target: new THREE.Vector3(0, 0, 0),
	});

	const [customMapTexture, setCustomMapTexture] = useState<string | undefined>(undefined);

	// リサイズハンドラ
	const handleResize = useCallback(() => {
		if (!cameraRef.current || !rendererRef.current || !containerRef.current) return;
		
		const container = containerRef.current;
		const width = container.clientWidth;
		const height = container.clientHeight;
		cameraRef.current.aspect = width / height;
		cameraRef.current.updateProjectionMatrix();
		rendererRef.current.setSize(width, height);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// 初期化処理（一度だけ実行）
	const initializeScene = useCallback(() => {
		if (!containerRef.current || isInitialized.current) return;

		// シーンの作成
		const scene = new THREE.Scene();
		sceneRef.current = scene;

		// カメラの作成
		const container = containerRef.current;
		const camera = new THREE.PerspectiveCamera(
			75,
			container.clientWidth / container.clientHeight,
			0.1,
			1000,
		);
		cameraRef.current = camera;
		camera.position.copy(stateRef.current.cameraPosition);
		camera.rotation.copy(stateRef.current.cameraRotation);

		// レンダラーの作成
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		rendererRef.current = renderer;
		renderer.setSize(container.clientWidth, container.clientHeight);
		containerRef.current.appendChild(renderer.domElement);

		// 地球儀のジオメトリとマテリアルを作成（テクスチャなし）
		const geometry = new THREE.SphereGeometry(5, 32, 32);
		const material = new THREE.MeshPhongMaterial({
			shininess: 5,
		});
		const globe = new THREE.Mesh(geometry, material);
		globeRef.current = globe;
		scene.add(globe);

		// 光源の設定
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		scene.add(ambientLight);
		const pointLight = new THREE.PointLight(0xffffff, 1);
		pointLight.position.set(10, 10, 10);
		scene.add(pointLight);

		// コントロールの設定
		const controls = new OrbitControls(camera, renderer.domElement);
		controlsRef.current = controls;
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.rotateSpeed = 0.5;
		controls.minDistance = 8;
		controls.maxDistance = 20;
		controls.target.copy(stateRef.current.target);
		controls.update();

		// アニメーションループ
		const animate = () => {
			requestAnimationFrame(animate);
			if (controlsRef.current) {
				controlsRef.current.update();
			}
			if (rendererRef.current && sceneRef.current && cameraRef.current) {
				rendererRef.current.render(sceneRef.current, cameraRef.current);
			}
		};
		animate();

		// リサイズハンドラ
		window.addEventListener("resize", handleResize);

		isInitialized.current = true;
	}, [handleResize]);

	// テクスチャの更新処理
	const updateTexture = useCallback(async (textureUrl: string) => {
		if (!globeRef.current) return;
		
		console.log('=== updateTexture開始 ===');
		console.log('textureUrl:', textureUrl);
		console.log('textureUrl長さ:', textureUrl.length);
		
		try {
			const texture = textureCache.current.get(textureUrl);
			if (texture) {
				console.log('キャッシュされたテクスチャを使用');
				(globeRef.current.material as THREE.MeshPhongMaterial).map = texture;
				(globeRef.current.material as THREE.MeshPhongMaterial).needsUpdate = true;
			} else {
				console.log('新しいテクスチャをロード開始');
				const textureLoader = new THREE.TextureLoader();
				textureLoader.load(
					textureUrl,
					(loadedTexture) => {
						console.log('テクスチャ読み込み成功:', textureUrl);
						textureCache.current.set(textureUrl, loadedTexture);
						if (globeRef.current) {
							(globeRef.current.material as THREE.MeshPhongMaterial).map = loadedTexture;
							(globeRef.current.material as THREE.MeshPhongMaterial).needsUpdate = true;
						}
					},
					undefined,
					(error) => {
						console.error('テクスチャ読み込み失敗:', textureUrl, error);
					}
				);
			}
		} catch (error) {
			console.error('updateTexture処理エラー:', error);
		}
	}, []);

	// 初期化処理
	useEffect(() => {
		initializeScene();
	}, [initializeScene]);

	// カスタムテクスチャの更新処理
	useEffect(() => {
		if (!isInitialized.current) return;
		if (cameraRef.current && controlsRef.current) {
			stateRef.current = {
				cameraPosition: cameraRef.current.position.clone(),
				cameraRotation: cameraRef.current.rotation.clone(),
				target: controlsRef.current.target.clone(),
			};
		}
		if (customMapTexture) {
			updateTexture(customMapTexture);
		}
	}, [customMapTexture, updateTexture]);

	// カスタムテクスチャの生成処理
	useEffect(() => {
		console.log('=== Globe.tsx テクスチャ生成処理開始 ===');
		console.log('customTexture:', customTexture);
		console.log('habitatPoints:', habitatPoints);
		
		if (customTexture && habitatPoints.length > 0) {
			// 地図画像上にポイントを描画したテクスチャを生成
			const mapName = customTexture.replace(/^.*\/(Map.*\.jpg).*$/, '$1');
			console.log('generateMapWithHabitat呼び出し:', { mapName, habitatPoints });
			
			generateMapWithHabitat(mapName, habitatPoints as HabitatElement[])
				.then((dataUrl) => {
					console.log('generateMapWithHabitat成功 - dataURL長さ:', dataUrl.length);
					setCustomMapTexture(dataUrl);
				})
				.catch((error) => {
					console.error('generateMapWithHabitat失敗:', error);
					setCustomMapTexture(customTexture);
				});
		} else {
			console.log('habitatPointsが空またはcustomTextureなし - 通常のテクスチャを使用');
			setCustomMapTexture(customTexture);
		}
	}, [customTexture, habitatPoints]);

	// クリーンアップ処理
	useEffect(() => {
		return () => {
			// テクスチャキャッシュのクリーンアップ
			for (const texture of textureCache.current.values()) {
				texture.dispose();
			}
			textureCache.current.clear();

			// シーンのクリーンアップ
			if (globeRef.current) {
				if (globeRef.current.geometry) {
					globeRef.current.geometry.dispose();
				}
				if (globeRef.current.material) {
					if (Array.isArray(globeRef.current.material)) {
						for (const material of globeRef.current.material) {
							material.dispose();
						}
					} else {
						globeRef.current.material.dispose();
					}
				}
			}

			// レンダラーのクリーンアップ
			if (rendererRef.current) {
				rendererRef.current.dispose();
			}

			// イベントリスナーの削除
			window.removeEventListener("resize", handleResize);
		};
	}, [handleResize]);

	return (
		<div className="relative w-full h-full">
			{isLoading && (
				<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
					<div className="text-white">読み込み中...</div>
				</div>
			)}
			<div ref={containerRef} className="w-full h-full" />
		</div>
	);
};

export default GlobeComponent;
