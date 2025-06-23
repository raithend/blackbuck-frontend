"use client";

import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { toast } from "sonner";
import { useCallback, useState } from "react";
import { ImageUploadCropper } from "@/app/components/ui/image-upload-cropper";
import { useDropzone } from "react-dropzone";

interface ProfileImageUploadProps {
	type: "avatar" | "header";
	currentUrl?: string;
	onUploadComplete: (url: string) => void;
	children: React.ReactNode;
}

export function ProfileImageUpload({
	type,
	currentUrl,
	onUploadComplete,
	children,
}: ProfileImageUploadProps) {
	const [isUploading, setIsUploading] = useState(false);

	const handleRemoveImage = () => {
		onUploadComplete("");
	};

	const handleImageSelected = useCallback(
		async (file: File, croppedImageUrl: string) => {
			setIsUploading(true);

			try {
				const formData = new FormData();
				formData.append("file", file);
				formData.append("type", type);

				const response = await fetch("/api/upload/profile", {
					method: "POST",
					body: formData,
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "アップロードに失敗しました");
				}

				const { url } = await response.json();
				onUploadComplete(url);
				toast.success(`${type === "avatar" ? "アバター" : "ヘッダー"}画像をアップロードしました`);
			} catch (error) {
				console.error("アップロードエラー:", error);
				toast.error(error instanceof Error ? error.message : "アップロードに失敗しました");
			} finally {
				setIsUploading(false);
			}
		},
		[type, onUploadComplete],
	);

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (acceptedFiles.length === 0) return;

			const file = acceptedFiles[0];
			setIsUploading(true);

			try {
				const formData = new FormData();
				formData.append("file", file);
				formData.append("type", type);

				const response = await fetch("/api/upload/profile", {
					method: "POST",
					body: formData,
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "アップロードに失敗しました");
				}

				const { url } = await response.json();
				onUploadComplete(url);
				toast.success(`${type === "avatar" ? "アバター" : "ヘッダー"}画像をアップロードしました`);
			} catch (error) {
				console.error("アップロードエラー:", error);
				toast.error(error instanceof Error ? error.message : "アップロードに失敗しました");
			} finally {
				setIsUploading(false);
			}
		},
		[type, onUploadComplete],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"image/*": [".jpeg", ".jpg", ".png", ".webp"],
		},
		maxFiles: 1,
		maxSize: type === "avatar" ? 5 * 1024 * 1024 : 10 * 1024 * 1024, // アバター5MB、ヘッダー10MB
	});

	const getMaxSizeText = () => {
		return type === "avatar" ? "5MB" : "10MB";
	};

	const getTypeText = () => {
		return type === "avatar" ? "アバター" : "ヘッダー";
	};

	return (
		<div className="space-y-2">
			<Label>{getTypeText()}画像</Label>
			{type === "avatar" ? (
				<div className={isUploading ? "opacity-50 pointer-events-none" : ""}>
					<ImageUploadCropper
						onImageSelected={handleImageSelected}
						onRemoveImage={handleRemoveImage}
						currentImageUrl={currentUrl}
						maxSize={5 * 1024 * 1024}
						placeholder="アバター画像をアップロード"
					/>
				</div>
			) : (
				<div
					{...getRootProps()}
					className={
						`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ` +
						(isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400") +
						(isUploading ? " opacity-50 cursor-not-allowed" : "")
					}
				>
					<input {...getInputProps()} />
					<div className="flex flex-col items-center space-y-2">
						{children}
						<div className="text-center">
							{isUploading ? (
								<p className="text-sm text-gray-600">アップロード中...</p>
							) : isDragActive ? (
								<p className="text-sm text-blue-600">ここにファイルをドロップしてください</p>
							) : (
								<div className="space-y-1">
									<p className="text-sm text-gray-600">
										クリックまたはドラッグ&ドロップで画像をアップロード
									</p>
									<p className="text-xs text-gray-500">
										JPEG、PNG、WebP形式、最大{getMaxSizeText()}
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
			{isUploading && type !== "avatar" && (
				<p className="text-sm text-gray-600 text-center">アップロード中...</p>
			)}
		</div>
	);
} 