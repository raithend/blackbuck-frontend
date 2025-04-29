"use client";

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ImageIcon, ImageUp } from "lucide-react";
import { LocationCombobox } from "./location-combobox";
import { TaxonomyCombobox } from "./taxonomy-combobox";

export function PostButton() {
	const [content, setContent] = useState('')
	const [files, setFiles] = useState<File[]>([])
	const [isUploading, setIsUploading] = useState(false)

	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			'image/*': ['.jpeg', '.jpg', '.png', '.gif']
		},
		onDrop: (acceptedFiles) => {
			setFiles(acceptedFiles)
		}
	})

	const handleSubmit = async () => {
		if (files.length === 0) return

		setIsUploading(true)
		try {
			// 画像をS3にアップロード
			const imageUrls = await Promise.all(
				files.map(async (file) => {
					// 署名付きURLを取得
					const { signedUrl } = await fetch('/api/v1/upload', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							fileName: file.name,
							fileType: file.type,
						}),
					}).then(res => res.json())

					// S3にアップロード
					await fetch(signedUrl, {
						method: 'PUT',
						body: file,
						headers: {
							'Content-Type': file.type,
						},
					})

					// アップロードされた画像のURLを返す
					const imageUrl = signedUrl.split('?')[0]
					console.log('Uploaded image URL:', imageUrl)
					return imageUrl
				})
			)

			console.log('All uploaded image URLs:', imageUrls)
			setFiles([])

		} catch (error) {
			console.error('Error uploading images:', error)
		} finally {
			setIsUploading(false)
		}
	}

	return (
		<div className="flex items-center justify-center">
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline" className="flex gap-2 px-4 py-6">
						<ImageUp className="h-8 w-8" />
						<div className="hidden md:block">投稿を作成</div>
					</Button>
				</DialogTrigger>

				<DialogContent className="w-full max-w-xl">
					<DialogHeader>
						<DialogTitle>投稿を作成</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4">
						<div className="grid gap-4">
							<div className="grid gap-2">
								<Textarea
									placeholder="いまどうしてる？"
									value={content}
									onChange={(e) => setContent(e.target.value)}
								/>
							</div>
							<div className="grid gap-2">
								<div {...getRootProps()} className="border-2 border-dashed p-4 rounded-lg">
									<input {...getInputProps()} />
									<p>画像をドラッグ＆ドロップ、またはクリックして選択</p>
								</div>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="width">分類</Label>
								<TaxonomyCombobox />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="width">撮影地</Label>
								<LocationCombobox />
							</div>
						</div>
						{files.length > 0 && (
							<div className="flex gap-2">
								{files.map((file, index) => (
									<img
										key={index}
										src={URL.createObjectURL(file)}
										alt={`Preview ${index}`}
										className="w-20 h-20 object-cover rounded"
									/>
								))}
							</div>
						)}
						<div className="w-full flex justify-center">
							<Button
								variant="outline"
								className="w-24"
								onClick={handleSubmit}
								disabled={isUploading}
							>
								{isUploading ? 'アップロード中...' : 'アップロード'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
