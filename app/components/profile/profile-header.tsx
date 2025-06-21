"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import type { User } from "@/app/types/types";
import { EditProfileButton } from "./edit-profile-button";
import { motion } from "framer-motion";
import { useState } from "react";
import { PhotoBubble } from "./photo-bubble";
import { Camera } from "lucide-react";

interface ProfileHeaderProps {
	user: User;
}

interface PhotoBubbleData {
	id: string;
	x: number;
	y: number;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [photoBubbles, setPhotoBubbles] = useState<PhotoBubbleData[]>([]);
	const [isEditing, setIsEditing] = useState(false);

	const addPhotoBubble = (event: React.MouseEvent<HTMLDivElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		const newBubble: PhotoBubbleData = {
			id: `bubble-${Date.now()}`,
			x: x,
			y: y,
		};
		setPhotoBubbles([...photoBubbles, newBubble]);
	};

	const deletePhotoBubble = (id: string) => {
		setPhotoBubbles(photoBubbles.filter(bubble => bubble.id !== id));
	};

	const updatePhotoBubblePosition = (id: string, x: number, y: number) => {
		setPhotoBubbles(photoBubbles.map(bubble => 
			bubble.id === id ? { ...bubble, x, y } : bubble
		));
	};

	const handleHeaderClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (isEditing) {
			addPhotoBubble(event);
		}
	};

	return (
		<div className="relative mb-6">
			{/* ヘッダー画像 */}
			<div 
				className={`relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden ${isEditing ? 'cursor-crosshair' : ''}`}
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
					/>
				))}

				{/* フォトバブル追加ボタン */}
				{isEditing && (
					<div className="absolute top-4 right-4">
						<Button
							onClick={(e) => {
								e.stopPropagation();
								// デフォルト位置にフォトバブルを追加
								const newBubble: PhotoBubbleData = {
									id: `bubble-${Date.now()}`,
									x: 50,
									y: 50,
								};
								setPhotoBubbles(prevBubbles => [...prevBubbles, newBubble]);
							}}
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
						onClick={() => setIsEditing(!isEditing)}
						variant={isEditing ? "default" : "outline"}
						size="sm"
						className="bg-white/80 hover:bg-white text-gray-800"
					>
						{isEditing ? "編集終了" : "編集"}
					</Button>
				</div>
			</div>

			{/* アバター（ヘッダー画像と重ねて表示） */}
			<div className="absolute -bottom-12 left-6">
				<motion.div
					className="relative"
					onHoverStart={() => setIsHovered(true)}
					onHoverEnd={() => setIsHovered(false)}
					whileHover={{ scale: 1.1 }}
					transition={{ duration: 0.2 }}
				>
					<Avatar className="w-24 h-24 border-4 border-white shadow-lg">
						<AvatarImage src={user.avatar_url || undefined} alt="アバター" />
						<AvatarFallback className="text-2xl font-semibold">
							{user.username ? user.username.charAt(0).toUpperCase() : "U"}
						</AvatarFallback>
					</Avatar>
					
					{/* ホバー時のオーバーレイ */}
					<motion.div
						className="absolute bottom-0 left-0 right-0 bg-gray-800 text-white text-center py-2 rounded-b-full"
						initial={{ opacity: 0, y: 10 }}
						animate={{ 
							opacity: isHovered ? 1 : 0,
							y: isHovered ? 0 : 10
						}}
						transition={{ duration: 0.2 }}
					>
						<span className="text-sm font-medium truncate px-2">
							{user.username}
						</span>
					</motion.div>
				</motion.div>
			</div>

			{/* ユーザー情報 */}
			<div className="pt-16 px-6">
				<div className="space-y-2">
					<h1 className="text-2xl font-bold text-gray-900">
						{user.username}
					</h1>
					<p className="text-gray-600">
						@{user.account_id}
					</p>
					{user.bio && (
						<p className="text-gray-700 mt-2">
							{user.bio}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
