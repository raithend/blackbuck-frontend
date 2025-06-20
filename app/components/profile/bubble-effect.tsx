"use client";

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

interface BubbleEffectProps {
	initialBubbles?: number;
}

export default function BubbleEffect({ initialBubbles = 8 }: BubbleEffectProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const engineRef = useRef<Matter.Engine | null>(null);
	const renderRef = useRef<Matter.Render | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);
	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		// SSR/CSRの初期化を遅延
		const timer = setTimeout(() => {
			if (typeof window !== 'undefined' && containerRef.current && canvasRef.current) {
				initializeBubbles();
			}
		}, 100);

		return () => clearTimeout(timer);
	}, [containerSize, initialBubbles]);

	useEffect(() => {
		if (!containerRef.current) return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				if (width > 0 && height > 0) {
					setContainerSize({ width, height });
				}
			}
		});

		resizeObserver.observe(containerRef.current);

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	const initializeBubbles = () => {
		if (!containerRef.current || !canvasRef.current || isInitialized) {
			console.log('初期化スキップ:', { 
				hasContainer: !!containerRef.current, 
				hasCanvas: !!canvasRef.current, 
				isInitialized 
			});
			return;
		}

		console.log('BubbleEffect初期化開始');
		console.log('コンテナサイズ:', containerSize);

		// 既存のエンジンとレンダラーをクリーンアップ
		if (engineRef.current) {
			Matter.Engine.clear(engineRef.current);
			engineRef.current = null;
		}
		if (renderRef.current) {
			Matter.Render.stop(renderRef.current);
			renderRef.current = null;
		}

		// エンジン作成
		const engine = Matter.Engine.create({
			positionIterations: 8, // 位置の反復回数を増加
			velocityIterations: 6, // 速度の反復回数を増加
			constraintIterations: 2,
			enableSleeping: false
		});
		engineRef.current = engine;
		
		// 重力を無効化
		engine.world.gravity.x = 0;
		engine.world.gravity.y = 0;
		
		// エンジンの設定を調整
		Matter.Engine.update(engine, 0);
		console.log('エンジン作成完了:', engine);
		console.log('重力設定:', {
			gravityX: engine.world.gravity.x,
			gravityY: engine.world.gravity.y
		});

		// キャンバス設定
		const canvas = canvasRef.current;
		canvas.width = containerSize.width;
		canvas.height = containerSize.height;
		canvas.style.width = `${containerSize.width}px`;
		canvas.style.height = `${containerSize.height}px`;
		canvas.style.display = 'block';
		canvas.style.position = 'absolute';
		canvas.style.top = '0';
		canvas.style.left = '0';
		canvas.style.zIndex = '10';
		canvas.style.pointerEvents = 'none';

		console.log('キャンバス設定完了:', {
			width: canvas.width,
			height: canvas.height,
			styleWidth: canvas.style.width,
			styleHeight: canvas.style.height
		});

		// レンダラー作成
		const render = Matter.Render.create({
			canvas: canvas,
			engine: engine,
			options: {
				width: containerSize.width,
				height: containerSize.height,
				wireframes: false,
				background: 'transparent'
			}
		});
		renderRef.current = render;
		console.log('レンダラー作成完了:', render);

		// 境界壁を作成（より確実な衝突検出のため位置を調整）
		const wallThickness = 100; // 壁の厚さを増加して衝突検出を確実に
		const walls = [
			// 上壁
			Matter.Bodies.rectangle(containerSize.width / 2, -wallThickness / 2, containerSize.width, wallThickness, { 
				isStatic: true,
				restitution: 1, // 反発係数を1に設定
				friction: 0, // 摩擦を0に設定
				frictionAir: 0, // 空気抵抗を0に設定
				render: {
					fillStyle: 'transparent', // 透明にして見えないように
					strokeStyle: 'transparent'
				}
			}),
			// 下壁
			Matter.Bodies.rectangle(containerSize.width / 2, containerSize.height + wallThickness / 2, containerSize.width, wallThickness, { 
				isStatic: true,
				restitution: 1, // 反発係数を1に設定
				friction: 0, // 摩擦を0に設定
				frictionAir: 0, // 空気抵抗を0に設定
				render: {
					fillStyle: 'transparent', // 透明にして見えないように
					strokeStyle: 'transparent'
				}
			}),
			// 左壁
			Matter.Bodies.rectangle(-wallThickness / 2, containerSize.height / 2, wallThickness, containerSize.height, { 
				isStatic: true,
				restitution: 1, // 反発係数を1に設定
				friction: 0, // 摩擦を0に設定
				frictionAir: 0, // 空気抵抗を0に設定
				render: {
					fillStyle: 'transparent', // 透明にして見えないように
					strokeStyle: 'transparent'
				}
			}),
			// 右壁
			Matter.Bodies.rectangle(containerSize.width + wallThickness / 2, containerSize.height / 2, wallThickness, containerSize.height, { 
				isStatic: true,
				restitution: 1, // 反発係数を1に設定
				friction: 0, // 摩擦を0に設定
				frictionAir: 0, // 空気抵抗を0に設定
				render: {
					fillStyle: 'transparent', // 透明にして見えないように
					strokeStyle: 'transparent'
				}
			})
		];
		console.log('境界壁作成完了:', walls.length, '個');
		for (const [index, wall] of walls.entries()) {
			// 壁の反発係数を複数の方法で確実に設定
			Matter.Body.set(wall, "restitution", 1);
			wall.restitution = 1;
			wall.friction = 0;
			wall.frictionAir = 0;
			
			console.log(`壁 ${index + 1}:`, {
				position: wall.position,
				bounds: wall.bounds,
				restitution: wall.restitution,
				isStatic: wall.isStatic,
				friction: wall.friction,
				frictionAir: wall.frictionAir
			});
		}

		// シャボン玉を生成
		const bubbles: Matter.Body[] = [];
		const margin = 30; // 壁からの余白
		for (let i = 0; i < initialBubbles; i++) {
			const x = margin + Math.random() * (containerSize.width - 2 * margin);
			const y = margin + Math.random() * (containerSize.height - 2 * margin);
			const radius = 20; // 固定サイズ（20px）
			
			const bubble = Matter.Bodies.circle(x, y, radius, {
				restitution: 1, // 反発係数を1に設定（完全弾性衝突）
				friction: 0, // 摩擦を0に設定
				frictionAir: 0, // 空気抵抗を0に設定
				density: 0.0001, // 密度をさらに小さくして重力の影響を最小限に
				render: {
					fillStyle: 'rgba(135, 206, 250, 0.3)', // 統一された青色（ライトスカイブルー）
					strokeStyle: 'rgba(135, 206, 250, 0.8)', // 統一された青色の枠線
					lineWidth: 2
				}
			});

			// 反発係数を明示的に設定（複数回設定して確実にする）
			Matter.Body.set(bubble, "restitution", 1);
			Matter.Body.set(bubble, "friction", 0);
			Matter.Body.set(bubble, "frictionAir", 0);
			
			// プロパティを直接設定
			bubble.restitution = 1;
			bubble.friction = 0;
			bubble.frictionAir = 0;

			// 統一された緩やかな速度を設定
			const velocity = 1.2; // 速度を少し上げて壁との衝突を明確に
			const angle = Math.random() * Math.PI * 2;
			Matter.Body.setVelocity(bubble, {
				x: Math.cos(angle) * velocity,
				y: Math.sin(angle) * velocity
			});

			bubbles.push(bubble);
			console.log(`シャボン玉 ${i + 1} 作成:`, {
				position: bubble.position,
				velocity: bubble.velocity,
				radius: radius,
				frictionAir: bubble.frictionAir,
				restitution: bubble.restitution,
				friction: bubble.friction
			});
		}

		// すべてのボディをワールドに追加
		Matter.World.add(engine.world, [...walls, ...bubbles]);
		console.log('ワールドにボディ追加完了');

		// 衝突イベントを監視
		Matter.Events.on(engine, 'collisionStart', (event) => {
			event.pairs.forEach((pair) => {
				const bodyA = pair.bodyA;
				const bodyB = pair.bodyB;
				
				// シャボン玉と壁の衝突を検出
				const isWallA = walls.includes(bodyA);
				const isWallB = walls.includes(bodyB);
				const isBubbleA = bubbles.includes(bodyA);
				const isBubbleB = bubbles.includes(bodyB);
				
				if ((isWallA && isBubbleB) || (isWallB && isBubbleA)) {
					const bubble = isBubbleA ? bodyA : bodyB;
					const wall = isWallA ? bodyA : bodyB;
					console.log('シャボン玉と壁の衝突検出:', {
						bubblePosition: bubble.position,
						wallPosition: wall.position,
						bubbleVelocity: bubble.velocity,
						bubbleRestitution: bubble.restitution
					});
				}
				
				// シャボン玉同士の衝突を検出
				if (isBubbleA && isBubbleB) {
					console.log('シャボン玉同士の衝突検出:', {
						bubbleAPosition: bodyA.position,
						bubbleBPosition: bodyB.position,
						bubbleAVelocity: bodyA.velocity,
						bubbleBVelocity: bodyB.velocity,
						bubbleARestitution: bodyA.restitution,
						bubbleBRestitution: bodyB.restitution
					});
				}
			});
		});

		// 衝突中のイベントも監視
		Matter.Events.on(engine, 'collisionActive', (event) => {
			event.pairs.forEach((pair) => {
				const bodyA = pair.bodyA;
				const bodyB = pair.bodyB;
				
				// シャボン玉と壁の衝突を検出
				const isWallA = walls.includes(bodyA);
				const isWallB = walls.includes(bodyB);
				const isBubbleA = bubbles.includes(bodyA);
				const isBubbleB = bubbles.includes(bodyB);
				
				// シャボン玉と壁の衝突時に反発係数を強制的に設定
				if ((isWallA && isBubbleB) || (isWallB && isBubbleA)) {
					const bubble = isBubbleA ? bodyA : bodyB;
					const wall = isWallA ? bodyA : bodyB;
					
					// 反発係数を強制的に設定
					Matter.Body.set(bubble, "restitution", 1);
					Matter.Body.set(wall, "restitution", 1);
					bubble.restitution = 1;
					wall.restitution = 1;
					
					console.log('シャボン玉と壁の衝突中:', {
						bubblePosition: bubble.position,
						wallPosition: wall.position,
						bubbleVelocity: bubble.velocity,
						bubbleRestitution: bubble.restitution,
						wallRestitution: wall.restitution
					});
				}
				
				// 反発係数を強制的に設定
				if (bubbles.includes(bodyA)) {
					Matter.Body.set(bodyA, "restitution", 1);
					bodyA.restitution = 1;
				}
				if (bubbles.includes(bodyB)) {
					Matter.Body.set(bodyB, "restitution", 1);
					bodyB.restitution = 1;
				}
			});
		});

		// レンダリング開始
		Matter.Render.run(render);
		Matter.Runner.run(Matter.Runner.create(), engine);
		console.log('エンジンとレンダラー開始完了');

		console.log(`${bubbles.length}個のシャボン玉を生成しました`);

		// デバッグ用の位置ログ
		const debugInterval = setInterval(() => {
			if (bubbles.length > 0) {
				const firstBubble = bubbles[0];
				console.log('シャボン玉位置:', {
					x: firstBubble.position.x,
					y: firstBubble.position.y,
					velocity: firstBubble.velocity,
					engineRunning: engine.timing.timestamp > 0,
					engineEnabled: engine.enabled,
					worldGravity: engine.world.gravity,
					worldBodies: engine.world.bodies.length,
					frictionAir: firstBubble.frictionAir,
					restitution: firstBubble.restitution,
					friction: firstBubble.friction
				});
			}
		}, 2000);

		setIsInitialized(true);

		// クリーンアップ関数
		return () => {
			clearInterval(debugInterval);
			if (render) {
				Matter.Render.stop(render);
			}
			if (engine) {
				Matter.Engine.clear(engine);
			}
		};
	};

	useEffect(() => {
		return () => {
			if (renderRef.current) {
				Matter.Render.stop(renderRef.current);
			}
			if (engineRef.current) {
				Matter.Engine.clear(engineRef.current);
			}
		};
	}, []);

	return (
		<div 
			ref={containerRef}
			className="relative w-full h-48 overflow-hidden"
			style={{ minHeight: '200px' }}
		>
			<canvas
				ref={canvasRef}
				key="bubble-canvas"
				className="absolute inset-0"
				style={{
					width: '100%',
					height: '100%',
					zIndex: 10,
					pointerEvents: 'none'
				}}
			/>
		</div>
	);
}