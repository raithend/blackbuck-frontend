'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface EarthProps {
  timeperiod: 'present' | '100ma' | '120ma';
}

const Earth: React.FC<EarthProps> = ({ timeperiod }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // シーンの設定
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth / 3, 400);
    mountRef.current.appendChild(renderer.domElement);

    // テクスチャの読み込み
    const textureLoader = new THREE.TextureLoader();
    const texturePath = timeperiod === 'present' ? 
      '/PALEOMAP_PaleoAtlas_Rasters_v3/Map19a LtK Early Campanian_080.jpg' :
      timeperiod === '100ma' ?
      '/PALEOMAP_PaleoAtlas_Rasters_v3/Map19a LtK Early Campanian_080.jpg' :
      '/PALEOMAP_PaleoAtlas_Rasters_v3/Map19a LtK Early Campanian_080.jpg';

    const earthTexture = textureLoader.load(texturePath, 
      // テクスチャ読み込み成功時のコールバック
      (texture) => {
        console.log('テクスチャの読み込みに成功しました');
      },
      // テクスチャ読み込み中のコールバック
      undefined,
      // テクスチャ読み込みエラー時のコールバック
      (error) => {
        console.error('テクスチャの読み込みに失敗しました:', error);
      }
    );

    // 地球の作成
    const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: earthTexture,
      bumpScale: 0.1,
      specularMap: earthTexture,
      specular: new THREE.Color(0x333333),
      shininess: 5
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // ライトの設定
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // カメラの位置設定
    camera.position.z = 15;

    // コントロールの設定
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 8;
    controls.maxDistance = 20;

    // アニメーションループ
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // リサイズハンドラ
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // クリーンアップ
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [timeperiod]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default Earth; 