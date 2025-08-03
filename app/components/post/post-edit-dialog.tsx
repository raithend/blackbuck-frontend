"use client";

import { EventDropdownMenu } from "@/app/components/post/event-dropdown-menu";
import { ImageUpload } from "@/app/components/post/image-upload";
import { LocationDropdownMenu } from "@/app/components/post/location-dropdown-menu";
import { Button } from "@/app/components/ui/button";
import {
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import type { PostWithUser } from "@/app/types/types";
import { useEffect, useState } from "react";
import Image from "next/image";

interface PostEditDialogProps {
	post: PostWithUser;
	onEdit: (
		postId: string,
		data: {
			content?: string;
			location?: string;
			event?: string;
			classification?: string;
			imageUrls: string[];
		},
	) => Promise<void>;
	onClose: () => void;
}

export function PostEditDialog({ post, onEdit, onClose }: PostEditDialogProps) {
	const [content, setContent] = useState(post.content || "");
	const [location, setLocation] = useState(post.location || "");
	const [event, setEvent] = useState(post.event || "");
	const [classification, setClassification] = useState(
		post.classification || "",
	);
	const [imageFiles, setImageFiles] = useState<File[]>([]);
	const [existingImages, setExistingImages] = useState<string[]>(
		post.post_images?.map((img) => img.image_url) || [],
	);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// 投稿データが変更された場合にフォームを更新
	useEffect(() => {
		setContent(post.content || "");
		setLocation(post.location || "");
		setEvent(post.event || "");
		setClassification(post.classification || "");
		setExistingImages(post.post_images?.map((img) => img.image_url) || []);
	}, [post]);

	const uploadToS3 = async (file: File): Promise<string> => {
		const formData = new FormData();
		formData.append("file", file);

		const response = await fetch("/api/upload/posts", {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error("アップロードに失敗しました");
		}

		const data = await response.json();
		return data.url;
	};

	const handleSubmit = async () => {
		try {
			setIsSubmitting(true);

			// 新しい画像をS3にアップロード
			const newImageUrls = await Promise.all(
				imageFiles.map((file) => uploadToS3(file)),
			);

			// 既存の画像と新しい画像を結合
			const allImageUrls = [...existingImages, ...newImageUrls];

			// 投稿データを送信
			await onEdit(post.id, {
				content,
				location,
				event,
				classification,
				imageUrls: allImageUrls,
			});

			onClose();
		} catch (error) {
			console.error("投稿編集エラー:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const removeExistingImage = (imageUrl: string) => {
		setExistingImages((prev) => prev.filter((url) => url !== imageUrl));
	};

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>投稿を編集</DialogTitle>
			</DialogHeader>
			<div className="space-y-4">
				<Textarea
					placeholder="投稿内容を入力してください"
					value={content}
					onChange={(e) => setContent(e.target.value)}
				/>
				<LocationDropdownMenu value={location} onChange={setLocation} />
				<EventDropdownMenu value={event} onChange={setEvent} />
				<Input
					type="text"
					placeholder="分類"
					value={classification}
					onChange={(e) => setClassification(e.target.value)}
				/>

				{/* 既存の画像表示 */}
				{existingImages.length > 0 && (
					<div className="space-y-2">
						<label className="text-sm font-medium">既存の画像</label>
						<div className="grid grid-cols-2 gap-2">
							{existingImages.map((imageUrl, index) => (
								<div key={imageUrl} className="relative">
									<Image
										src={imageUrl}
										alt={`既存画像 ${index + 1}`}
										width={96}
										height={96}
										className="w-full h-24 object-cover rounded"
									/>
									<Button
										type="button"
										onClick={() => removeExistingImage(imageUrl)}
										variant="destructive"
										size="icon"
										className="absolute top-1 right-1 h-6 w-6 text-xs"
									>
										×
									</Button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* 新しい画像アップロード */}
				<ImageUpload value={imageFiles} onChange={setImageFiles} />

				<div className="flex gap-2">
					<Button
						onClick={handleSubmit}
						disabled={
							isSubmitting ||
							(existingImages.length === 0 && imageFiles.length === 0)
						}
						className="flex-1"
					>
						{isSubmitting ? "更新中..." : "更新する"}
					</Button>
					<Button onClick={onClose} variant="outline" disabled={isSubmitting}>
						キャンセル
					</Button>
				</div>
			</div>
		</DialogContent>
	);
}
