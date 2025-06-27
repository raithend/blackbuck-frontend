"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useGeologicalAge } from "./geological-context";

interface GlobeProps {
	customGeographicFile?: string;
}

const Globe: React.FC<GlobeProps> = ({ customGeographicFile }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const { selectedMap } = useGeologicalAge();
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

	// 初期化処理（一度だけ実行）
	const initializeScene = () => {
		if (!containerRef.current || isInitialized.current) return;

		// シーンの作成
		const scene = new THREE.Scene();
		sceneRef.current = scene;

		// カメラの作成
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		cameraRef.current = camera;
		camera.position.copy(stateRef.current.cameraPosition);
		camera.rotation.copy(stateRef.current.cameraRotation);

		// レンダラーの作成
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		rendererRef.current = renderer;
		renderer.setSize(window.innerWidth, window.innerHeight);
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
		const handleResize = () => {
			if (!cameraRef.current || !rendererRef.current) return;
			
			const width = window.innerWidth;
			const height = window.innerHeight;
			cameraRef.current.aspect = width / height;
			cameraRef.current.updateProjectionMatrix();
			rendererRef.current.setSize(width, height);
		};
		window.addEventListener("resize", handleResize);

		isInitialized.current = true;
	};

	// テクスチャの更新処理
	const updateTexture = (mapName: string) => {
		if (!globeRef.current) return;

		const texturePath = customGeographicFile || `/PALEOMAP_PaleoAtlas_Rasters_v3/${mapName}.jpg`;
		
		// キャッシュからテクスチャを取得
		let texture = textureCache.current.get(texturePath);
		
		if (texture) {
			// キャッシュされたテクスチャを使用
			(globeRef.current.material as THREE.MeshPhongMaterial).map = texture;
			(globeRef.current.material as THREE.MeshPhongMaterial).needsUpdate = true;
		} else {
			// 新しいテクスチャをロード
			setIsLoading(true);
			const textureLoader = new THREE.TextureLoader();
			textureLoader.load(
				texturePath,
				(loadedTexture) => {
					// テクスチャをキャッシュに保存
					textureCache.current.set(texturePath, loadedTexture);
					
					// 地球儀にテクスチャを適用
					if (globeRef.current) {
						(globeRef.current.material as THREE.MeshPhongMaterial).map = loadedTexture;
						(globeRef.current.material as THREE.MeshPhongMaterial).needsUpdate = true;
					}
					setIsLoading(false);
				},
				undefined,
				(error) => {
					console.error("テクスチャのロードに失敗しました:", error);
					setIsLoading(false);
				}
			);
		}
	};

	// 初期化処理
	useEffect(() => {
		initializeScene();
	}, []);

	// 地図の切り替え処理
	useEffect(() => {
		if (!isInitialized.current) return;

		// 現在のカメラとコントロールの状態を保存
		if (cameraRef.current && controlsRef.current) {
			stateRef.current = {
				cameraPosition: cameraRef.current.position.clone(),
				cameraRotation: cameraRef.current.rotation.clone(),
				target: controlsRef.current.target.clone(),
			};
		}

		// カスタム地理データファイルがある場合はそれを使用、なければデフォルトの地図名を設定
		const mapName = customGeographicFile ? "custom" : (selectedMap || "Map1a_PALEOMAP_PaleoAtlas_000");
		updateTexture(mapName);
	}, [selectedMap, customGeographicFile]);

	// クリーンアップ処理
	useEffect(() => {
		return () => {
			// テクスチャキャッシュのクリーンアップ
			textureCache.current.forEach((texture) => {
				texture.dispose();
			});
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

			if (rendererRef.current) {
				rendererRef.current.dispose();
			}

			// イベントリスナーのクリーンアップ
			window.removeEventListener("resize", () => {});
		};
	}, []);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-lg">地球儀を読み込み中...</div>
			</div>
		);
	}

	return <div ref={containerRef} className="w-full h-full" />;
};

export default Globe;
