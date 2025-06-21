"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Camera } from "lucide-react";
import { PhotoBubble } from "./photo-bubble";
import type { User } from "@/app/types/types";

interface PhotoBubbleData {
	id: string;
	x: number;
	y: number;
	description?: string;
	imageUrl?: string;
	targetUrl?: string;
}

interface PhotoBubbleEditorProps {
	user: User;
	photoBubbles: PhotoBubbleData[];
	onPhotoBubblesChange: (bubbles: PhotoBubbleData[]) => void;
	isEditing: boolean;
	onEditingChange: (editing: boolean) => void;
}

export function PhotoBubbleEditor({ 
	user, 
	photoBubbles, 
	onPhotoBubblesChange, 
	isEditing, 
	onEditingChange 
}: PhotoBubbleEditorProps) {
	
	// PoC用のハードコードされたデータ
	useEffect(() => {
		if (photoBubbles.length === 0) {
			const pocBubble: PhotoBubbleData = {
				id: 'poc-bubble-1',
				x: 100,
				y: 150,
				description: 'INFINITI VISION Qe',
				imageUrl: 'https://blackbuck-bucket.s3.ap-northeast-1.amazonaws.com/headers/1750343160488-PXL_20231216_082802471.jpg',
				targetUrl: 'https://ja.infiniti.com/stories/electric-car-vision-qe.html'
			};
			onPhotoBubblesChange([pocBubble]);
		}
	}, [photoBubbles.length, onPhotoBubblesChange]);

	const addPhotoBubble = (event: React.MouseEvent<HTMLDivElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		const newBubble: PhotoBubbleData = {
			id: `bubble-${Date.now()}`,
			x: x,
			y: y,
		};
		onPhotoBubblesChange([...photoBubbles, newBubble]);
	};

	const deletePhotoBubble = (id: string) => {
		onPhotoBubblesChange(photoBubbles.filter(bubble => bubble.id !== id));
	};

	const updatePhotoBubblePosition = (id: string, x: number, y: number) => {
		onPhotoBubblesChange(photoBubbles.map(bubble => 
			bubble.id === id ? { ...bubble, x, y } : bubble
		));
	};

	const handleHeaderClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (isEditing) {
			addPhotoBubble(event);
		}
	};

	const addDefaultPhotoBubble = (e: React.MouseEvent) => {
		e.stopPropagation();
		const newBubble: PhotoBubbleData = {
			id: `bubble-${Date.now()}`,
			x: 50,
			y: 50,
		};
		onPhotoBubblesChange([...photoBubbles, newBubble]);
	};

	return (
		<div 
			className={`relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden ${isEditing ? 'cursor-crosshair' : ''}`}
			onClick={handleHeaderClick}
		>
			{/* ヘッダー画像 */}
			{user.header_url ? (
				<img
					src={user.header_url}
					alt="ヘッダー画像"
					className="w-full h-full object-cover"
					onError={(e) => {
						e.currentTarget.style.display = 'none';
					}}
				/>
			) : (
				<div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
					<span className="text-white text-lg font-medium">
						{user.username}のヘッダー
					</span>
				</div>
			)}

			{/* フォトバブル */}
			{photoBubbles.map((bubble) => (
				<PhotoBubble
					key={bubble.id}
					id={bubble.id}
					x={bubble.x}
					y={bubble.y}
					onDelete={deletePhotoBubble}
					onPositionChange={updatePhotoBubblePosition}
					userAvatarUrl={user.avatar_url || undefined}
					username={user.username}
					isEditing={isEditing}
					description={bubble.description}
					imageUrl={bubble.imageUrl}
					targetUrl={bubble.targetUrl}
				/>
			))}

			{/* フォトバブル追加ボタン */}
			{isEditing && (
				<div className="absolute top-4 right-4">
					<Button
						onClick={addDefaultPhotoBubble}
						className="bg-blue-500 hover:bg-blue-600 text-white"
						size="sm"
					>
						<Camera className="w-4 h-4 mr-2" />
						フォトバブルを追加 ({photoBubbles.length})
					</Button>
				</div>
			)}

			{/* 編集モード切り替えボタン */}
			<div className="absolute top-4 left-4">
				<Button
					onClick={() => onEditingChange(!isEditing)}
					variant={isEditing ? "default" : "outline"}
					size="sm"
					className="bg-white/80 hover:bg-white text-gray-800"
				>
					{isEditing ? "編集終了" : "編集"}
				</Button>
			</div>
		</div>
	);
} 