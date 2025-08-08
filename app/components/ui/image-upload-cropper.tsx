"use client";

import { Button } from "@/app/components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploadCropperProps {
	onImageSelected: (file: File, croppedImageUrl: string) => void;
	onRemoveImage?: () => void;
	currentImageUrl?: string;
	className?: string;
	accept?: Record<string, string[]>;
	maxSize?: number;
	placeholder?: string;
}

export function ImageUploadCropper({
	onImageSelected,
	onRemoveImage,
	currentImageUrl,
	className = "",
	accept = { "image/*": [".jpeg", ".jpg", ".png", ".gif"] },
	maxSize = 5 * 1024 * 1024, // 5MB
	placeholder = "クリックまたはドラッグ&ドロップで画像をアップロード",
}: ImageUploadCropperProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(
		currentImageUrl || null,
	);
	const [isCropping, setIsCropping] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);

	const onDrop = useCallback((acceptedFiles: File[]) => {
		const file = acceptedFiles[0];
		if (file) {
			setSelectedFile(file);
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
			setIsCropping(true);
		}
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept,
		maxSize,
		multiple: false,
	});

	const cropImage = useCallback(() => {
		if (!canvasRef.current || !imageRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const image = imageRef.current;
		const size = Math.min(image.naturalWidth, image.naturalHeight);
		const x = (image.naturalWidth - size) / 2;
		const y = (image.naturalHeight - size) / 2;

		// キャンバスサイズを設定（正方形）
		canvas.width = size;
		canvas.height = size;

		// 円形マスクを作成
		ctx.save();
		ctx.beginPath();
		ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
		ctx.clip();

		// 画像を描画
		ctx.drawImage(image, x, y, size, size, 0, 0, size, size);
		ctx.restore();

		// キャンバスからBlobを取得
		canvas.toBlob(
			(blob) => {
				if (blob) {
					const croppedFile = new File(
						[blob],
						selectedFile?.name || "cropped-image.jpg",
						{
							type: "image/jpeg",
						},
					);
					const croppedUrl = URL.createObjectURL(blob);
					onImageSelected(croppedFile, croppedUrl);
					setIsCropping(false);
				}
			},
			"image/jpeg",
			0.9,
		); // JPEG形式で品質0.9に設定
	}, [selectedFile, onImageSelected]);

	const handleRemoveImage = () => {
		setSelectedFile(null);
		setPreviewUrl(null);
		setIsCropping(false);
		onRemoveImage?.();
	};

	const handleCancelCrop = () => {
		setSelectedFile(null);
		setPreviewUrl(currentImageUrl || null);
		setIsCropping(false);
		onRemoveImage?.();
	};

	return (
		<div className={`space-y-4 ${className}`}>
			{/* ドロップゾーン */}
			{!selectedFile && !isCropping && (
				<div
					{...getRootProps()}
					className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
						isDragActive
							? "border-blue-500 bg-blue-50"
							: "border-gray-300 hover:border-gray-400"
					}`}
				>
					<input {...getInputProps()} />
					<Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
					{isDragActive ? (
						<p className="text-blue-500">ファイルをドロップしてください</p>
					) : (
						<div>
							<p className="text-gray-600">{placeholder}</p>
							<p className="text-sm text-gray-500">PNG, JPG, GIF</p>
						</div>
					)}
				</div>
			)}

			{/* 切り抜き画面（画像が選択された場合は必ず表示） */}
			{selectedFile && (
				<div className="space-y-4">
					<div className="relative w-80 h-80 mx-auto">
						{/* 背景画像（グレーアウト） */}
						<div className="absolute inset-0 bg-gray-300 rounded-lg overflow-hidden">
							<Image
								ref={imageRef}
								src={previewUrl || ""}
								alt="切り抜き対象"
								width={320}
								height={320}
								className="w-full h-full object-cover opacity-50"
								style={{ width: "auto", height: "auto" }}
							/>
						</div>

						{/* 円形マスク */}
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="w-64 h-64 rounded-full border-4 border-white shadow-lg overflow-hidden ring-4 ring-blue-500 ring-opacity-50">
								<Image
									src={previewUrl || ""}
									alt="切り抜きプレビュー"
									width={256}
									height={256}
									className="w-full h-full object-cover"
									style={{ width: "auto", height: "auto" }}
								/>
							</div>
						</div>

						{/* 切り抜きガイド */}
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
							<div className="w-64 h-64 rounded-full border-2 border-dashed border-white opacity-75"></div>
						</div>
					</div>

					{/* 隠しキャンバス */}
					<canvas ref={canvasRef} className="hidden" />

					{/* ボタン */}
					<div className="flex gap-2 justify-center">
						<Button onClick={cropImage} variant="default" className="px-6">
							確定
						</Button>
						<Button
							onClick={handleCancelCrop}
							variant="outline"
							className="px-6"
						>
							キャンセル
						</Button>
					</div>
				</div>
			)}

			{/* プレビュー */}
			{previewUrl && !selectedFile && !isCropping && (
				<div className="relative inline-block">
					<Image
						src={previewUrl}
						alt="プレビュー"
						width={64}
						height={64}
						className="w-16 h-16 object-cover rounded-full border-2 border-white shadow-lg"
						style={{ width: "auto", height: "auto" }}
					/>
					<Button
						variant="destructive"
						size="sm"
						className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
						onClick={handleRemoveImage}
					>
						<X className="w-3 h-3" />
					</Button>
				</div>
			)}
		</div>
	);
}
