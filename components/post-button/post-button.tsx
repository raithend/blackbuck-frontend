"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image, ImageUp } from "lucide-react";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { LocationCombobox } from "./location-combobox";
import { TaxonomyCombobox } from "./taxonomy-combobox";

function Dropzone() {
	const onDrop = useCallback((acceptedFiles: File[]) => {
		console.log("受け取ったファイル:", acceptedFiles);
	}, []);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

	return (
		<div
			{...getRootProps()}
			className={`flex flex-col items-center justify-center h-full w-full
            ${isDragActive ? "bg-accent text-accent-foreground" : ""}`}
		>
			<input {...getInputProps()} />
			<div className="flex flex-col items-center">
				<Image className="h-16 w-16 mb-4" />
			</div>
			<div>画像をドラッグアンドドロップ</div>
			<div>または</div>
			<div>コンピューターから選択</div>
		</div>
	);
}

export function PostButton() {
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
								<Label htmlFor="width">画像</Label>
								<Card className="h-72 w-full">
									<CardContent className="h-full p-0">
										<Dropzone />
									</CardContent>
								</Card>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="width">コメント</Label>
								<Textarea />
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
						<div className="w-full flex justify-center">
							<Button variant="outline" className="w-24">
								投稿 !
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
