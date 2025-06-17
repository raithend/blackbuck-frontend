"use client";

import { ImageUpload } from "@/app/components/post/image-upload";
import { LocationCombobox } from "@/app/components/post/location-combobox";
import { Button } from "@/app/components/ui/button";
import {
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { useState } from "react";

interface PostDialogProps {
	onPost: (data: {
		content?: string;
		location?: string;
		classification?: string;
		imageUrls: string[];
	}) => Promise<void>;
}

export function PostDialog({ onPost }: PostDialogProps) {
	const [content, setContent] = useState("");
	const [location, setLocation] = useState("");
	const [classification, setClassification] = useState("");
	const [imageFiles, setImageFiles] = useState<File[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const uploadToS3 = async (file: File): Promise<string> => {
		const formData = new FormData();
		formData.append("file", file);

		const response = await fetch("/api/upload", {
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

			// S3に画像をアップロード
			const imageUrls = await Promise.all(
				imageFiles.map((file) => uploadToS3(file)),
			);

			// 投稿データを送信
			await onPost({
				content,
				location,
				classification,
				imageUrls,
			});
		} catch (error) {
			// エラー処理
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>新規投稿</DialogTitle>
			</DialogHeader>
			<div className="space-y-4">
				<Textarea
					placeholder="投稿内容を入力してください"
					value={content}
					onChange={(e) => setContent(e.target.value)}
				/>
				<LocationCombobox value={location} onChange={setLocation} />
				<Input
					type="text"
					placeholder="分類"
					value={classification}
					onChange={(e) => setClassification(e.target.value)}
				/>
				<ImageUpload value={imageFiles} onChange={setImageFiles} />
				<Button
					onClick={handleSubmit}
					disabled={isSubmitting || imageFiles.length === 0}
					className="w-full"
				>
					{isSubmitting ? "投稿中..." : "投稿する"}
				</Button>
			</div>
		</DialogContent>
	);
}
