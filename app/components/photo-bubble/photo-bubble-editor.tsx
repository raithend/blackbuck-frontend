"use client";

import { Button } from "@/app/components/ui/button";
import type { User } from "@/app/types/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PhotoBubble } from "./photo-bubble";
import { PhotoBubbleEditPanel } from "./photo-bubble-edit-panel";

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
	isEditable?: boolean;
}

export function PhotoBubbleEditor({
	user,
	photoBubbles,
	onPhotoBubblesChange,
	isEditable = true,
}: PhotoBubbleEditorProps) {
	const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [clickedPosition, setClickedPosition] = useState({ x: 0, y: 0 });
	const [showClickMarker, setShowClickMarker] = useState(false);

	// 初期データをAPIから読み込み
	useEffect(() => {
		const loadPhotoBubbles = async () => {
			try {
				const response = await fetch(
					`/api/photo-bubbles?page_url=${window.location.pathname}`,
				);
				if (response.ok) {
					const data = await response.json();
					// APIのデータ形式をローカル形式に変換
					const convertedBubbles =
						data.photoBubbles?.map((bubble: any) => ({
							id: bubble.id,
							x: bubble.x_position,
							y: bubble.y_position,
							description: bubble.name,
							imageUrl: bubble.image_url,
							targetUrl: bubble.target_url,
						})) || [];
					onPhotoBubblesChange(convertedBubbles);
				}
			} catch (error) {
				console.error("Error loading photo bubbles:", error);
			}
		};

		loadPhotoBubbles();
	}, [onPhotoBubblesChange]);

	const handleHeaderClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (isEditing && isEditable) {
			event.preventDefault();
			event.stopPropagation();

			const rect = event.currentTarget.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			setClickedPosition({ x, y });
			setShowClickMarker(true);
			setIsEditPanelOpen(true);
		}
	};

	const handleEditButtonClick = () => {
		if (!isEditable) return;

		setIsEditing(!isEditing);
		if (isEditing) {
			setIsEditPanelOpen(false);
			setShowClickMarker(false);
		}
	};

	const handleEditPanelClose = () => {
		setIsEditPanelOpen(false);
		setShowClickMarker(false);
	};

	return (
		<>
			{/* ヘッダー画像 */}
			<div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
				<div
					className={`w-full h-full ${isEditing && isEditable ? "cursor-crosshair" : ""}`}
					onClick={handleHeaderClick}
				>
					{user.header_url ? (
						<Image
							src={user.header_url}
							alt="ヘッダー画像"
							width={800}
							height={384}
							priority
							className="w-full h-full object-cover"
							style={{ height: "auto" }}
							onError={(e) => {
								e.currentTarget.style.display = "none";
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

				{/* クリック位置の印 */}
				{showClickMarker && (
					<div
						className="absolute w-6 h-6 bg-red-500 border-2 border-white rounded-full shadow-lg animate-pulse"
						style={{
							left: clickedPosition.x - 12,
							top: clickedPosition.y - 12,
						}}
					>
						<div className="w-full h-full bg-red-500 rounded-full flex items-center justify-center">
							<div className="w-2 h-2 bg-white rounded-full"></div>
						</div>
					</div>
				)}

				{/* フォトバブル */}
				{photoBubbles.map((bubble) => (
					<PhotoBubble
						key={bubble.id}
						id={bubble.id}
						x={bubble.x}
						y={bubble.y}
						onDelete={(id) =>
							onPhotoBubblesChange(photoBubbles.filter((b) => b.id !== id))
						}
						onPositionChange={(id, x, y) =>
							onPhotoBubblesChange(
								photoBubbles.map((b) => (b.id === id ? { ...b, x, y } : b)),
							)
						}
						userAvatarUrl={user.avatar_url || undefined}
						username={user.username}
						isEditing={isEditing && isEditable}
						description={bubble.description}
						imageUrl={bubble.imageUrl}
						targetUrl={bubble.targetUrl}
					/>
				))}
			</div>

			{/* 編集ボタン（ヘッダーの外部の左下に配置） */}
			{isEditable && (
				<div className="mt-4 ml-4">
					<Button
						onClick={handleEditButtonClick}
						variant={isEditing ? "destructive" : "default"}
					>
						{isEditing ? "編集終了" : "フォトバブルを追加・編集する"}
					</Button>
				</div>
			)}

			{/* 編集パネル */}
			{isEditPanelOpen && (
				<PhotoBubbleEditPanel
					photoBubbles={photoBubbles}
					onPhotoBubblesChange={(newBubbles) => {
						onPhotoBubblesChange(newBubbles);
						// 新しいフォトバブルが追加された場合、クリック位置の印を非表示にする
						if (newBubbles.length > photoBubbles.length) {
							setShowClickMarker(false);
						}
					}}
					headerImageUrl={user.header_url || undefined}
					initialPosition={clickedPosition}
					onClose={handleEditPanelClose}
				/>
			)}
		</>
	);
}
