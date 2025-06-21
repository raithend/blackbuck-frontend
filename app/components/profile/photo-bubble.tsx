"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";

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
	targetUrl
}: PhotoBubbleProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

	const handleMouseDown = (e: React.MouseEvent) => {
		if (!isEditing) return;
		setIsDragging(true);
		const rect = e.currentTarget.getBoundingClientRect();
		setDragOffset({
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		});
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (isDragging && isEditing) {
			const newX = e.clientX - dragOffset.x;
			const newY = e.clientY - dragOffset.y;
			onPositionChange(id, newX, newY);
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	const handleClick = () => {
		if (targetUrl) {
			window.open(targetUrl, '_blank');
		}
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div
						className={`absolute z-10 ${isEditing ? 'cursor-move' : 'cursor-pointer'} ${isDragging ? 'z-20' : ''}`}
						style={{
							left: x,
							top: y,
							transform: isDragging ? 'scale(1.1)' : 'scale(1)',
							transition: isDragging ? 'none' : 'transform 0.2s ease',
						}}
						onMouseDown={handleMouseDown}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onMouseLeave={handleMouseUp}
						onClick={handleClick}
					>
						<div className="relative">
							{imageUrl ? (
								<div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
									<img 
										src={imageUrl} 
										alt={description || "フォトバブル"} 
										className="w-full h-full object-cover"
									/>
								</div>
							) : (
								<Avatar className="w-12 h-12 border-2 border-white shadow-lg">
									<AvatarImage src={userAvatarUrl} alt="ユーザーアバター" />
									<AvatarFallback className="text-sm font-semibold">
										{username ? username.charAt(0).toUpperCase() : "U"}
									</AvatarFallback>
								</Avatar>
							)}
							{isEditing && (
								<Button
									variant="destructive"
									size="sm"
									className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
									onClick={(e) => {
										e.stopPropagation();
										onDelete(id);
									}}
								>
									<X className="w-3 h-3" />
								</Button>
							)}
						</div>
					</div>
				</TooltipTrigger>
				{description && (
					<TooltipContent>
						<p>{description}</p>
					</TooltipContent>
				)}
			</Tooltip>
		</TooltipProvider>
	);
} 