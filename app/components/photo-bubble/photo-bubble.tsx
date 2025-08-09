"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { createClient } from "@/app/lib/supabase-browser";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface PhotoBubbleProps {
	id: string;
	x: number;
	y: number;
	onDelete: (id: string) => void;
	onPositionChange: (id: string, x: number, y: number) => void;
	userAvatarUrl?: string;
	username?: string;
	isEditing?: boolean;
	description?: string;
	imageUrl?: string;
	targetUrl?: string;
}

export function PhotoBubble({
	id,
	x,
	y,
	onDelete,
	onPositionChange,
	userAvatarUrl,
	username,
	isEditing = false,
	description,
	imageUrl,
	targetUrl,
}: PhotoBubbleProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [isHovered, setIsHovered] = useState(false);

	const handleMouseDown = (e: React.MouseEvent) => {
		if (!isEditing) return;
		e.preventDefault();
		e.stopPropagation();

		setIsDragging(true);
		const rect = e.currentTarget.getBoundingClientRect();
		setDragOffset({
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		});
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (isDragging && isEditing) {
			e.preventDefault();
			const newX = e.clientX - dragOffset.x;
			const newY = e.clientY - dragOffset.y;
			onPositionChange(id, newX, newY);
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	// グローバルマウスイベントリスナーを追加
	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);

			return () => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};
		}
	}, [isDragging, dragOffset, isEditing, id, onPositionChange, handleMouseMove]);

	const handleClick = (e: React.MouseEvent) => {
		if (isDragging) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}

		if (targetUrl) {
			window.open(targetUrl, "_blank");
		}
	};

	const handleMouseEnter = () => {
		setIsHovered(true);
	};

	const handleMouseLeave = () => {
		setIsHovered(false);
	};

	// 拡大率の計算
	const scale = isDragging ? 1.1 : isHovered ? 2.0 : 1.0;

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation();

		if (!confirm("このフォトバブルを削除しますか？")) {
			return;
		}

		try {
			// 認証情報を取得
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				throw new Error("認証が必要です");
			}

			const response = await fetch(`/api/photo-bubbles?id=${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "フォトバブルの削除に失敗しました");
			}

			onDelete(id);
		} catch (error) {
			console.error("Error deleting photo bubble:", error);
			alert(error instanceof Error ? error.message : "削除に失敗しました");
		}
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div
						className={`absolute z-10 ${isEditing ? "cursor-move" : "cursor-pointer"} ${isDragging ? "z-20" : ""} transition-all duration-200 ease-in-out`}
						style={{
							left: x,
							top: y,
							transform: `scale(${scale})`,
							transformOrigin: "center",
						}}
						onMouseDown={handleMouseDown}
						onMouseEnter={handleMouseEnter}
						onMouseLeave={handleMouseLeave}
						onClick={handleClick}
					>
						<div className="relative">
							{imageUrl ? (
								<div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-lg bg-white">
									<Image
										src={imageUrl}
										alt={description || "フォトバブル"}
										width={96}
										height={96}
										className="w-full h-full object-cover"
										onError={(e) => {
											// 画像読み込みエラー時のフォールバック
											e.currentTarget.style.display = "none";
											e.currentTarget.parentElement!.innerHTML =
												'<div class="w-full h-full bg-blue-500 rounded-full flex items-center justify-center"><span class="text-white text-sm">IMG</span></div>';
										}}
									/>
								</div>
							) : (
								<Avatar className="w-24 h-24 border-2 border-white shadow-lg">
									<AvatarImage src={userAvatarUrl} alt="ユーザーアバター" />
									<AvatarFallback className="text-lg font-semibold">
										{username ? username.charAt(0).toUpperCase() : "U"}
									</AvatarFallback>
								</Avatar>
							)}
							{isEditing && (
								<Button
									variant="destructive"
									size="sm"
									className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
									onClick={handleDelete}
								>
									<X className="w-3 h-3" />
								</Button>
							)}
						</div>
					</div>
				</TooltipTrigger>
				{description && (
					<TooltipContent side="top" className="max-w-xs">
						<div className="p-2">
							<p className="font-medium">{description}</p>
							{targetUrl && (
								<p className="text-xs text-gray-500 mt-1">
									クリックでリンク先に移動
								</p>
							)}
						</div>
					</TooltipContent>
				)}
			</Tooltip>
		</TooltipProvider>
	);
}
