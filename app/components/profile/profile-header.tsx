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
import { PhotoBubbleEditor } from "../photo-bubble/photo-bubble-editor";
import { useState } from "react";
import { useUser } from "@/app/contexts/user-context";

interface ProfileHeaderProps {
	user: User;
}

interface PhotoBubbleData {
	id: string;
	x: number;
	y: number;
	description?: string;
	imageUrl?: string;
	targetUrl?: string;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
	const [photoBubbles, setPhotoBubbles] = useState<PhotoBubbleData[]>([]);
	const { user: currentUser } = useUser();

	// 現在のユーザーがこのページのユーザーと一致するかチェック
	const isOwnProfile = currentUser?.account_id === user.account_id;

	return (
		<div className="relative mb-6">
			{/* ヘッダー画像 */}
			<PhotoBubbleEditor
				user={user}
				photoBubbles={photoBubbles}
				onPhotoBubblesChange={setPhotoBubbles}
				isEditable={isOwnProfile}
			/>

			{/* アバター（ヘッダー画像と重ねて表示） */}
			<div className="absolute -bottom-12 left-6">
				<Avatar className="w-24 h-24 border-4 border-white shadow-lg">
					<AvatarImage src={user.avatar_url || undefined} alt="アバター" />
					<AvatarFallback className="text-2xl font-semibold">
						{user.username ? user.username.charAt(0).toUpperCase() : "U"}
					</AvatarFallback>
				</Avatar>
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
