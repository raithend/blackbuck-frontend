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
import { PhotoBubbleEditor } from "./photo-bubble-editor";

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

	return (
		<div className="relative mb-6">
			{/* ヘッダー画像 */}
			<PhotoBubbleEditor
				user={user}
				photoBubbles={photoBubbles}
				onPhotoBubblesChange={setPhotoBubbles}
				isEditing={isEditing}
				onEditingChange={setIsEditing}
			/>

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
