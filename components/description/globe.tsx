'use client';

import React, { useEffect, useRef, useContext } from 'react';
import { MapContext } from './geological-context';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const Globe: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedMap] = useContext(MapContext);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 古いシーンのクリーンアップ
    if (sceneRef.current) {
      if (globeRef.current) {
        sceneRef.current.remove(globeRef.current);
        if (globeRef.current.geometry) globeRef.current.geometry.dispose();
        if (globeRef.current.material) {
          if (Array.isArray(globeRef.current.material)) {
            globeRef.current.material.forEach(material => material.dispose());
          } else {
            globeRef.current.material.dispose();
          }
        }
      }
      if (rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    }

    // 新しいシーンの設定
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // 地球の作成
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    const texturePath = `/PALEOMAP_PaleoAtlas_Rasters_v3/${selectedMap}.jpg`;
    
    // テクスチャの読み込み
    textureLoader.load(
      texturePath,
      (texture) => {
        const material = new THREE.MeshPhongMaterial({
          map: texture,
          shininess: 5
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

        // カメラの位置設定
        camera.position.z = 15;

        // コントロールの設定
        const controls = new OrbitControls(camera, renderer.domElement);
        controlsRef.current = controls;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.5;
        controls.minDistance = 8;
        controls.maxDistance = 20;

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
        window.addEventListener('resize', handleResize);

        // クリーンアップ
        return () => {
          window.removeEventListener('resize', handleResize);
          if (texture) texture.dispose();
        };
      },
      undefined,
      (error) => {
        console.error('テクスチャの読み込みに失敗しました:', error);
      }
    );

    // メインのクリーンアップ
    return () => {
      if (globeRef.current) {
        if (globeRef.current.geometry) globeRef.current.geometry.dispose();
        if (globeRef.current.material) {
          if (Array.isArray(globeRef.current.material)) {
            globeRef.current.material.forEach(material => material.dispose());
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

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default Globe; 