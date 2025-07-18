"use client";

import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/lib/utils";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploadProps {
	value: File[];
	onChange: (value: File[]) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			// プレビューURLの生成
			const newPreviewUrls = acceptedFiles.map((file) =>
				URL.createObjectURL(file),
			);
			setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);

			// 親コンポーネントにファイルを渡す
			onChange([...value, ...acceptedFiles]);
		},
		[value, onChange],
	);

	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			"image/*": [".jpeg", ".jpg", ".png", ".gif"],
		},
		onDrop,
	});

	const handleRemove = (index: number) => {
		// プレビューURLの削除
		const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
		setPreviewUrls(newPreviewUrls);

		// 親コンポーネントに更新されたファイルリストを渡す
		const newFiles = value.filter((_, i) => i !== index);
		onChange(newFiles);
	};

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-4">
				{previewUrls.map((url, index) => (
					<div key={url} className="relative aspect-square">
						<Image
							src={url}
							alt={`アップロード画像 ${index + 1}`}
							fill
							className="object-cover rounded-lg"
						/>
						<Button
							variant="destructive"
							size="icon"
							className="absolute top-2 right-2"
							onClick={() => handleRemove(index)}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				))}
			</div>
			<div className="grid gap-2">
				<div
					{...getRootProps()}
					className="border-2 border-dashed p-4 rounded-lg"
				>
					<input {...getInputProps()} />
					<p>画像をドラッグ＆ドロップ、またはクリックして選択</p>
				</div>
			</div>
		</div>
	);
}
