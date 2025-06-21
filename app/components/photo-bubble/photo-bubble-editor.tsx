"use client";

import { useState, useEffect } from "react";
import { PhotoBubble } from "./photo-bubble";
import { PhotoBubbleEditPanel } from "./photo-bubble-edit-panel";
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
}

export function PhotoBubbleEditor({ 
	user, 
	photoBubbles, 
	onPhotoBubblesChange
}: PhotoBubbleEditorProps) {
	const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [clickedPosition, setClickedPosition] = useState({ x: 0, y: 0 });
	
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

	const handleHeaderClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (isEditing) {
			const rect = event.currentTarget.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			setClickedPosition({ x, y });
			setIsEditPanelOpen(true);
		}
	};

	const handleEditButtonClick = () => {
		setIsEditing(!isEditing);
		if (isEditing) {
			setIsEditPanelOpen(false);
		}
	};

	return (
		<>
			{/* ヘッダー画像 */}
			<div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
				<div 
					className={`w-full h-full ${isEditing ? 'cursor-crosshair' : ''}`}
					onClick={handleHeaderClick}
				>
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
				</div>

				{/* フォトバブル */}
				{photoBubbles.map((bubble) => (
					<PhotoBubble
						key={bubble.id}
						id={bubble.id}
						x={bubble.x}
						y={bubble.y}
						onDelete={(id) => onPhotoBubblesChange(photoBubbles.filter(b => b.id !== id))}
						onPositionChange={(id, x, y) => 
							onPhotoBubblesChange(photoBubbles.map(b => b.id === id ? { ...b, x, y } : b))
						}
						userAvatarUrl={user.avatar_url || undefined}
						username={user.username}
						isEditing={isEditing}
						description={bubble.description}
						imageUrl={bubble.imageUrl}
						targetUrl={bubble.targetUrl}
					/>
				))}
			</div>

			{/* 編集ボタン（ヘッダーの外部の左下に配置） */}
			<div className="mt-4 ml-4">
				<button
					onClick={handleEditButtonClick}
					className={`px-4 py-2 rounded-lg transition-colors duration-200 shadow-lg ${
						isEditing 
							? 'bg-red-500 hover:bg-red-600 text-white' 
							: 'bg-blue-500 hover:bg-blue-600 text-white'
					}`}
				>
					{isEditing ? '編集終了' : 'フォトバブルを追加・編集する'}
				</button>
			</div>

			{/* 編集パネル */}
			{isEditPanelOpen && (
				<PhotoBubbleEditPanel
					photoBubbles={photoBubbles}
					onPhotoBubblesChange={onPhotoBubblesChange}
					headerImageUrl={user.header_url || undefined}
					initialPosition={clickedPosition}
					onClose={() => setIsEditPanelOpen(false)}
				/>
			)}
		</>
	);
} 