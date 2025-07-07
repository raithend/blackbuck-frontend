"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/app/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Upload, File, X } from "lucide-react";
import type { Classification } from "@/app/types/types";

interface ClassificationEditDialogProps {
	classification: Classification | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (data: Partial<Classification>) => Promise<void>;
}

export function ClassificationEditDialog({
	classification,
	open,
	onOpenChange,
	onSave,
}: ClassificationEditDialogProps) {
	const [formData, setFormData] = useState<Partial<Classification>>({
		english_name: classification?.english_name || "",
		scientific_name: classification?.scientific_name || "",
		description: classification?.description || "",
		era_start: classification?.era_start || "",
		era_end: classification?.era_end || "",
	});

	const [treeFile, setTreeFile] = useState<File | null>(null);
	const [geographicFile, setGeographicFile] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// 系統樹ファイル用のドロップゾーン
	const {
		getRootProps: getTreeRootProps,
		getInputProps: getTreeInputProps,
		isDragActive: isTreeDragActive,
	} = useDropzone({
		accept: {
			'application/json': ['.json'],
			'text/yaml': ['.yml', '.yaml'],
		},
		maxFiles: 1,
		onDrop: (acceptedFiles) => {
			setTreeFile(acceptedFiles[0]);
		},
	});

	// 地理データファイル用のドロップゾーン
	const {
		getRootProps: getGeographicRootProps,
		getInputProps: getGeographicInputProps,
		isDragActive: isGeographicDragActive,
	} = useDropzone({
		accept: {
			'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
		},
		maxFiles: 1,
		onDrop: (acceptedFiles) => {
			setGeographicFile(acceptedFiles[0]);
		},
	});

	const handleInputChange = (field: keyof Classification, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSave = async () => {
		setIsLoading(true);
		try {
			// ファイル内容を読み込み
			let phylogeneticTreeContent: string | undefined;
			let geographicDataContent: string | undefined;

			if (treeFile) {
				phylogeneticTreeContent = await readFileAsText(treeFile);
			}

			if (geographicFile) {
				geographicDataContent = await readFileAsBase64(geographicFile);
			}

			// 分類情報を更新または作成
			await onSave({
				...formData,
			});

			onOpenChange(false);
		} catch (error) {
			console.error("分類情報の保存に失敗しました:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// ファイルをテキストとして読み込む
	const readFileAsText = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsText(file);
		});
	};

	// ファイルをBase64として読み込む
	const readFileAsBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				// data:image/jpeg;base64, の部分を除去
				const base64 = result.split(',')[1];
				resolve(base64);
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	};

	const removeTreeFile = () => {
		setTreeFile(null);
	};

	const removeGeographicFile = () => {
		setGeographicFile(null);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{classification ? '分類情報を編集' : '分類情報を作成'}
					</DialogTitle>
					<DialogDescription>
						{classification 
							? `${classification.name}の情報を編集できます。`
							: '新しい分類の情報を入力してください。'
						}
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="english_name">英語名</Label>
							<Input
								id="english_name"
								value={formData.english_name || ""}
								onChange={(e) => handleInputChange("english_name", e.target.value)}
								placeholder="英語名を入力"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="scientific_name">学名</Label>
							<Input
								id="scientific_name"
								value={formData.scientific_name || ""}
								onChange={(e) => handleInputChange("scientific_name", e.target.value)}
								placeholder="学名を入力"
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="era_start">時代（開始）</Label>
							<Input
								id="era_start"
								value={formData.era_start || ""}
								onChange={(e) => handleInputChange("era_start", e.target.value)}
								placeholder="例: 中生代"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="era_end">時代（終了）</Label>
							<Input
								id="era_end"
								value={formData.era_end || ""}
								onChange={(e) => handleInputChange("era_end", e.target.value)}
								placeholder="例: 新生代"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">説明</Label>
						<Textarea
							id="description"
							value={formData.description || ""}
							onChange={(e) => handleInputChange("description", e.target.value)}
							placeholder="分類の説明を入力"
							rows={3}
						/>
					</div>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label>系統樹ファイル</Label>
							<div
								{...getTreeRootProps()}
								className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
									isTreeDragActive
										? "border-blue-500 bg-blue-50"
										: "border-gray-300 hover:border-gray-400"
								}`}
							>
								<input {...getTreeInputProps()} />
								{treeFile ? (
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-2">
											<File className="h-4 w-4" />
											<span>{treeFile.name}</span>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={removeTreeFile}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								) : (
									<div>
										<Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
										<p className="text-sm text-gray-600">
											{isTreeDragActive
												? "ファイルをドロップしてください"
												: "JSONまたはYAMLファイルをドラッグ&ドロップまたはクリックして選択"}
										</p>
									</div>
								)}
							</div>
						</div>

						<div className="space-y-2">
							<Label>地理データファイル</Label>
							<div
								{...getGeographicRootProps()}
								className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
									isGeographicDragActive
										? "border-blue-500 bg-blue-50"
										: "border-gray-300 hover:border-gray-400"
								}`}
							>
								<input {...getGeographicInputProps()} />
								{geographicFile ? (
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-2">
											<File className="h-4 w-4" />
											<span>{geographicFile.name}</span>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={removeGeographicFile}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								) : (
									<div>
										<Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
										<p className="text-sm text-gray-600">
											{isGeographicDragActive
												? "ファイルをドロップしてください"
												: "画像ファイルをドラッグ&ドロップまたはクリックして選択"}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						キャンセル
					</Button>
					<Button 
						onClick={() => {
							console.log("保存ボタンがクリックされました");
							handleSave();
						}} 
						disabled={isLoading}
					>
						{isLoading ? "保存中..." : "保存"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
} 