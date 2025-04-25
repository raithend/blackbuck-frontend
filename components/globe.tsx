"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function Globe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // シーンの設定
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

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
    controls.enableDamping = true; // スムーズな回転
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1.5; // 最小ズーム距離
    controls.maxDistance = 5; // 最大ズーム距離
    controls.maxPolarAngle = Math.PI; // 垂直回転の制限

    // アニメーション
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // コントロールの更新
      renderer.render(scene, camera);
    };
    animate();

    // リサイズ処理
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // クリーンアップ
    return () => {
      window.removeEventListener("resize", handleResize);
      containerRef.current?.removeChild(renderer.domElement);
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
      className="aspect-square w-full max-w-md rounded-lg bg-background"
    />
  );
} 