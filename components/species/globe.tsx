"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function Globe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // コンテナのサイズを取得
    const container = containerRef.current;
    const size = Math.min(container.clientWidth, container.clientHeight);
    container.style.width = `${size}px`;
    container.style.height = `${size}px`;

    // シーンの設定
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // アスペクト比を1:1に固定
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(size, size);
    container.appendChild(renderer.domElement);

    // 地球儀の作成
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/earth-texture.jpg");
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      bumpMap: texture,
      bumpScale: 0.05,
      shininess: 100,
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // 光源の設定
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 2.0);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);

    // カメラの位置設定
    camera.position.z = 2.5;

    // OrbitControlsの設定
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1.5;
    controls.maxDistance = 5;
    controls.maxPolarAngle = Math.PI;

    // アニメーション
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // リサイズ処理
    const handleResize = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const size = Math.min(container.clientWidth, container.clientHeight);
      container.style.width = `${size}px`;
      container.style.height = `${size}px`;
      renderer.setSize(size, size);
    };
    window.addEventListener("resize", handleResize);

    setIsReady(true);

    // クリーンアップ
    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
      scene.remove(globe);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="aspect-square w-full max-w-xl rounded-lg bg-background"
      style={{ width: "100%", height: "100%" }}
    >
      {!isReady && (
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
} 