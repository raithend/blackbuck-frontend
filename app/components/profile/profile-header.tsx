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

interface ProfileHeaderProps {
	user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
	return (
		<div className="relative mb-6">
			{/* ヘッダー画像 */}
			<div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
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
