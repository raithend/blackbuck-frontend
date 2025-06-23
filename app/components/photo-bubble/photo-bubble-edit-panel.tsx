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
import { createClient } from "@/app/lib/supabase-browser";
import { ImageUploadCropper } from "@/app/components/ui/image-upload-cropper";

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

	// 画像アップロード処理
	const handleImageSelected = useCallback(async (file: File, croppedImageUrl: string) => {
		try {
			// 認証情報を取得
			const supabase = createClient();
			const { data: { session } } = await supabase.auth.getSession();
			
			if (!session) {
				throw new Error('認証が必要です');
			}
			
			// フォトバブル専用のアップロードAPIを使用
			const formData = new FormData();
			formData.append('file', file);
			
			const response = await fetch('/api/upload/photo-bubble', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${session.access_token}`,
				},
				body: formData,
			});
			
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || '画像のアップロードに失敗しました');
			}
			
			const result = await response.json();
			setFormData(prev => ({ ...prev, imageUrl: result.url }));
		} catch (error) {
			console.error('Error uploading image:', error);
			alert(error instanceof Error ? error.message : '画像のアップロードに失敗しました');
		}
	}, []);

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

	const handleSave = async () => {
		try {
			// 認証情報を取得
			const supabase = createClient();
			const { data: { session } } = await supabase.auth.getSession();
			
			if (!session) {
				throw new Error('認証が必要です');
			}
			
			if (selectedBubble) {
				// 更新処理
				const response = await fetch(`/api/photo-bubbles?id=${selectedBubble.id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${session.access_token}`,
					},
					body: JSON.stringify({
						name: formData.description || '',
						image_url: formData.imageUrl || '',
						target_url: formData.targetUrl || '',
						x_position: formData.x,
						y_position: formData.y,
					}),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || 'フォトバブルの更新に失敗しました');
				}

				const updatedBubble = await response.json();
				const updatedBubbles = photoBubbles.map(bubble => 
					bubble.id === selectedBubble.id 
						? { ...bubble, ...updatedBubble }
						: bubble
				);
				onPhotoBubblesChange(updatedBubbles);
			} else {
				// 新規作成処理
				const response = await fetch('/api/photo-bubbles', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${session.access_token}`,
					},
					body: JSON.stringify({
						name: formData.description || '',
						page_url: window.location.pathname, // 現在のページURL
						image_url: formData.imageUrl || '',
						target_url: formData.targetUrl || '',
						x_position: formData.x,
						y_position: formData.y,
					}),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || 'フォトバブルの作成に失敗しました');
				}

				const newBubble = await response.json();
				onPhotoBubblesChange([...photoBubbles, {
					id: newBubble.id,
					x: newBubble.x_position,
					y: newBubble.y_position,
					description: newBubble.name,
					imageUrl: newBubble.image_url,
					targetUrl: newBubble.target_url,
				}]);
			}

			// フォームをリセット
			setSelectedBubble(null);
			setIsAdding(false);
			setFormData({ description: '', imageUrl: '', targetUrl: '', x: 100, y: 100 });
			onClose();
		} catch (error) {
			console.error('Error saving photo bubble:', error);
			alert(error instanceof Error ? error.message : 'エラーが発生しました');
		}
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
								<ImageUploadCropper
									onImageSelected={handleImageSelected}
									currentImageUrl={formData.imageUrl}
									placeholder="フォトバブル用の画像をアップロード"
								/>
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