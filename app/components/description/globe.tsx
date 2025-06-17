"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useGeologicalAge } from "./geological-context";

const Globe: React.FC = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const { selectedMap } = useGeologicalAge();
	const sceneRef = useRef<THREE.Scene | null>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const globeRef = useRef<THREE.Mesh | null>(null);
	const controlsRef = useRef<OrbitControls | null>(null);
	const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
	const stateRef = useRef<{
		cameraPosition: THREE.Vector3;
		cameraRotation: THREE.Euler;
		target: THREE.Vector3;
	}>({
		cameraPosition: new THREE.Vector3(0, 0, 15),
		cameraRotation: new THREE.Euler(0, 0, 0),
		target: new THREE.Vector3(0, 0, 0),
	});

	useEffect(() => {
		if (!containerRef.current) return;

		// 古いシーンのクリーンアップ
		if (sceneRef.current) {
			if (controlsRef.current) {
				// 現在のカメラとコントロールの状態を保存
				stateRef.current = {
					cameraPosition:
						cameraRef.current?.position.clone() || new THREE.Vector3(0, 0, 15),
					cameraRotation:
						cameraRef.current?.rotation.clone() || new THREE.Euler(0, 0, 0),
					target: controlsRef.current.target.clone(),
				};
				controlsRef.current.dispose();
			}
			if (globeRef.current) {
				sceneRef.current.remove(globeRef.current);
				if (globeRef.current.geometry) globeRef.current.geometry.dispose();
				if (globeRef.current.material) {
					if (Array.isArray(globeRef.current.material)) {
						globeRef.current.material.forEach((material) => material.dispose());
					} else {
						globeRef.current.material.dispose();
					}
				}
			}
			if (rendererRef.current) {
				containerRef.current.removeChild(rendererRef.current.domElement);
				rendererRef.current.dispose();
			}
		}

		// 新しいシーンの設定
		const scene = new THREE.Scene();
		sceneRef.current = scene;

		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		cameraRef.current = camera;
		// 保存されたカメラの状態を適用
		camera.position.copy(stateRef.current.cameraPosition);
		camera.rotation.copy(stateRef.current.cameraRotation);

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		rendererRef.current = renderer;
		renderer.setSize(window.innerWidth, window.innerHeight);
		containerRef.current.appendChild(renderer.domElement);

		// 地球の作成
		const geometry = new THREE.SphereGeometry(5, 32, 32);
		const textureLoader = new THREE.TextureLoader();
		const texturePath = selectedMap
			? `/PALEOMAP_PaleoAtlas_Rasters_v3/${selectedMap}.jpg`
			: "/PALEOMAP_PaleoAtlas_Rasters_v3/Map1a_PALEOMAP_PaleoAtlas_000.jpg";

		// テクスチャの読み込み
		textureLoader.load(
			texturePath,
			(texture) => {
				const material = new THREE.MeshPhongMaterial({
					map: texture,
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
				// 保存されたターゲットを適用
				controls.target.copy(stateRef.current.target);
				controls.update();

				// アニメーション
				const animate = () => {
					requestAnimationFrame(animate);
					controls.update();
					renderer.render(scene, camera);
				};
				animate();

				// リサイズハンドラ
				const handleResize = () => {
					const width = window.innerWidth;
					const height = window.innerHeight;
					camera.aspect = width / height;
					camera.updateProjectionMatrix();
					renderer.setSize(width, height);
				};
				window.addEventListener("resize", handleResize);

				// クリーンアップ
				return () => {
					window.removeEventListener("resize", handleResize);
					if (texture) texture.dispose();
				};
			},
			undefined,
			(error) => {
				// エラー処理
			},
		);

		// メインのクリーンアップ
		return () => {
			if (globeRef.current) {
				if (globeRef.current.geometry) globeRef.current.geometry.dispose();
				if (globeRef.current.material) {
					if (Array.isArray(globeRef.current.material)) {
						globeRef.current.material.forEach((material) => material.dispose());
					} else {
						globeRef.current.material.dispose();
					}
				}
			}
			if (rendererRef.current) {
				rendererRef.current.dispose();
			}
			if (controlsRef.current) {
				controlsRef.current.dispose();
			}
		};
	}, [selectedMap]);

	return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default Globe;
