"use client";

import { useState, useCallback, useEffect } from "react";
import { Rnd } from "react-rnd";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { X, Move, Plus, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface PhotoBubbleData {
	id: string;
	x: number;
	y: number;
	description?: string;
	imageUrl?: string;
	targetUrl?: string;
}

interface PhotoBubbleEditPanelProps {
	photoBubbles: PhotoBubbleData[];
	onPhotoBubblesChange: (bubbles: PhotoBubbleData[]) => void;
	headerImageUrl?: string;
	initialPosition?: { x: number; y: number };
	onClose: () => void;
}

export function PhotoBubbleEditPanel({ 
	photoBubbles, 
	onPhotoBubblesChange,
	headerImageUrl,
	initialPosition = { x: 100, y: 100 },
	onClose
}: PhotoBubbleEditPanelProps) {
	const [selectedBubble, setSelectedBubble] = useState<PhotoBubbleData | null>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [clickedPosition, setClickedPosition] = useState<{ x: number; y: number } | null>(null);
	const [formData, setFormData] = useState({
		description: '',
		imageUrl: '',
		targetUrl: '',
		x: initialPosition.x,
		y: initialPosition.y
	});

	// 初期位置を設定
	useEffect(() => {
		if (initialPosition) {
			setFormData(prev => ({ ...prev, x: initialPosition.x, y: initialPosition.y }));
		}
	}, [initialPosition]);

	const onDrop = useCallback((acceptedFiles: File[]) => {
		if (acceptedFiles.length > 0) {
			const file = acceptedFiles[0];
			const imageUrl = URL.createObjectURL(file);
			setFormData(prev => ({ ...prev, imageUrl }));
		}
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
		},
		multiple: false
	});

	const handleAddBubble = () => {
		const newBubble: PhotoBubbleData = {
			id: `bubble-${Date.now()}`,
			x: formData.x,
			y: formData.y,
			description: formData.description || undefined,
			imageUrl: formData.imageUrl || undefined,
			targetUrl: formData.targetUrl || undefined,
		};
		onPhotoBubblesChange([...photoBubbles, newBubble]);
		setIsAdding(false);
		setFormData({ description: '', imageUrl: '', targetUrl: '', x: 100, y: 100 });
		onClose();
	};

	const handleEditBubble = () => {
		if (!selectedBubble) return;
		
		const updatedBubbles = photoBubbles.map(bubble => 
			bubble.id === selectedBubble.id 
				? { ...bubble, ...formData }
				: bubble
		);
		onPhotoBubblesChange(updatedBubbles);
		setSelectedBubble(null);
		setFormData({ description: '', imageUrl: '', targetUrl: '', x: 100, y: 100 });
		onClose();
	};

	const handleDeleteBubble = (id: string) => {
		onPhotoBubblesChange(photoBubbles.filter(bubble => bubble.id !== id));
	};

	const handleBubbleClick = (bubble: PhotoBubbleData) => {
		setSelectedBubble(bubble);
		setFormData({
			description: bubble.description || '',
			imageUrl: bubble.imageUrl || '',
			targetUrl: bubble.targetUrl || '',
			x: bubble.x,
			y: bubble.y
		});
		setClickedPosition({ x: bubble.x, y: bubble.y });
	};

	const handleHeaderClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		
		setClickedPosition({ x, y });
		setFormData(prev => ({ ...prev, x, y }));
		
		if (isAdding) {
			// 追加モードの場合は自動的にフォームに反映
		} else {
			// 編集モードの場合は選択されたバブルを更新
			if (selectedBubble) {
				setFormData(prev => ({ ...prev, x, y }));
			}
		}
	};

	const handleSave = () => {
		if (selectedBubble) {
			handleEditBubble();
		} else if (isAdding) {
			handleAddBubble();
		}

		// フォームをリセット
		setSelectedBubble(null);
		setIsAdding(false);
		setFormData({ description: '', imageUrl: '', targetUrl: '', x: 100, y: 100 });
		onClose();
	};

	const handleCancel = () => {
		setSelectedBubble(null);
		setIsAdding(false);
		setFormData({ description: '', imageUrl: '', targetUrl: '', x: 100, y: 100 });
		onClose();
	};

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
			<Rnd
				default={{
					x: window.innerWidth / 2 - 400,
					y: window.innerHeight / 2 - 300,
					width: 800,
					height: 600,
				}}
				minWidth={600}
				minHeight={400}
				maxWidth={window.innerWidth - 40}
				maxHeight={window.innerHeight - 40}
				bounds="window"
				enableResizing={false}
				dragHandleClassName="drag-handle"
				disableDragging={false}
				onDragStart={(e) => {
					e.stopPropagation();
				}}
				onDrag={(e) => {
					e.stopPropagation();
				}}
				onDragStop={(e) => {
					e.stopPropagation();
				}}
			>
				<Card className="w-full h-full overflow-y-auto shadow-2xl">
					<CardHeader className="drag-handle cursor-move">
						<CardTitle className="flex items-center justify-between">
							<span>フォトバブル編集</span>
							{clickedPosition && (
								<span className="text-sm text-gray-500">
									クリック位置: ({Math.round(clickedPosition.x)}, {Math.round(clickedPosition.y)})
								</span>
							)}
							<Button onClick={onClose} variant="ghost" size="sm">
								<X className="w-4 h-4" />
							</Button>
						</CardTitle>
					</CardHeader>
					
					<CardContent>
						<div className="space-y-4">
							{/* 説明文 */}
							<div>
								<Label htmlFor="description">説明文</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
									placeholder="フォトバブルにホバーした時に表示される説明文"
									className="min-h-[80px]"
								/>
							</div>
							
							{/* リンク先URL */}
							<div>
								<Label htmlFor="targetUrl">リンク先URL</Label>
								<Input
									id="targetUrl"
									value={formData.targetUrl}
									onChange={(e) => setFormData(prev => ({ ...prev, targetUrl: e.target.value }))}
									placeholder="クリック時の遷移先URL"
								/>
							</div>
							
							{/* 画像アップロード */}
							<div>
								<Label>画像</Label>
								<div
									{...getRootProps()}
									className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
										isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
									}`}
								>
									<input {...getInputProps()} />
									<Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
									{isDragActive ? (
										<p className="text-blue-500">ファイルをドロップしてください</p>
									) : (
										<div>
											<p className="text-gray-600">クリックまたはドラッグ&ドロップで画像をアップロード</p>
											<p className="text-sm text-gray-500">PNG, JPG, GIF, WebP</p>
										</div>
									)}
								</div>
								{formData.imageUrl && (
									<div className="mt-2">
										<img
											src={formData.imageUrl}
											alt="プレビュー"
											className="w-16 h-16 object-cover rounded border"
										/>
									</div>
								)}
							</div>
							
							{/* ボタン */}
							<div className="flex gap-2 pt-4">
								<Button onClick={handleSave} className="flex-1">
									{selectedBubble ? '更新' : '追加'}
								</Button>
								<Button onClick={handleCancel} variant="outline">
									キャンセル
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</Rnd>
		</div>
	);
} 