"use client";

import { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { X, Move, Plus } from "lucide-react";

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
	};

	const handleHeaderClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (isAdding) {
			const rect = event.currentTarget.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			setFormData(prev => ({ ...prev, x, y }));
		}
	};

	const handleSave = () => {
		if (selectedBubble) {
			handleEditBubble();
		} else if (isAdding) {
			handleAddBubble();
		}
	};

	const handleCancel = () => {
		setSelectedBubble(null);
		setIsAdding(false);
		setFormData({ description: '', imageUrl: '', targetUrl: '', x: 100, y: 100 });
		onClose();
	};

	return (
		<div className="fixed inset-0 bg-black/50 z-50">
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
					<CardHeader className="drag-handle cursor-grab active:cursor-grabbing select-none">
						<div className="flex justify-between items-center">
							<div className="flex items-center gap-2">
								<Move className="w-4 h-4 text-gray-500" />
								<CardTitle>フォトバブル編集</CardTitle>
								<span className="text-xs text-gray-400">(ドラッグで移動)</span>
							</div>
							<Button onClick={onClose} variant="ghost" size="sm">
								<X className="w-4 h-4" />
							</Button>
						</div>
					</CardHeader>
					
					<CardContent>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* ヘッダー画像エリア */}
							<div className="space-y-4">
								<h4 className="font-medium">ヘッダー画像</h4>
								<div 
									className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden cursor-crosshair"
									onClick={handleHeaderClick}
								>
									{headerImageUrl ? (
										<img
											src={headerImageUrl}
											alt="ヘッダー画像"
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
											<span className="text-white text-lg font-medium">
												ヘッダー画像
											</span>
										</div>
									)}

									{/* フォトバブル表示 */}
									{photoBubbles.map((bubble) => (
										<div
											key={bubble.id}
											className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer ${
												selectedBubble?.id === bubble.id ? 'border-blue-500' : 'border-white'
											}`}
											style={{ left: bubble.x - 16, top: bubble.y - 16 }}
											onClick={(e) => {
												e.stopPropagation();
												handleBubbleClick(bubble);
											}}
										>
											{bubble.imageUrl ? (
												<img 
													src={bubble.imageUrl} 
													alt={bubble.description || "フォトバブル"} 
													className="w-full h-full object-cover rounded-full"
												/>
											) : (
												<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
													<span className="text-white text-xs">📷</span>
												</div>
											)}
										</div>
									))}

									{/* 追加位置のプレビュー */}
									{isAdding && (
										<div
											className="absolute w-8 h-8 rounded-full border-2 border-green-500 bg-green-500/20"
											style={{ left: formData.x - 16, top: formData.y - 16 }}
										>
											<Plus className="w-full h-full text-green-500" />
										</div>
									)}
								</div>
								
								<div className="flex gap-2">
									<Button
										onClick={() => setIsAdding(true)}
										variant="outline"
										size="sm"
										className="flex-1"
									>
										<Plus className="w-4 h-4 mr-2" />
										新しいフォトバブルを追加
									</Button>
								</div>
							</div>

							{/* 編集フォーム */}
							<div className="space-y-4">
								<h4 className="font-medium">
									{selectedBubble ? 'フォトバブル編集' : isAdding ? '新しいフォトバブル' : 'フォトバブル一覧'}
								</h4>
								
								{(selectedBubble || isAdding) ? (
									<div className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div>
												<Label htmlFor="x">X座標</Label>
												<Input
													id="x"
													type="number"
													value={formData.x}
													onChange={(e) => setFormData(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
												/>
											</div>
											<div>
												<Label htmlFor="y">Y座標</Label>
												<Input
													id="y"
													type="number"
													value={formData.y}
													onChange={(e) => setFormData(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
												/>
											</div>
										</div>
										
										<div>
											<Label htmlFor="description">説明文</Label>
											<Textarea
												id="description"
												value={formData.description}
												onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
												placeholder="フォトバブルの説明文を入力"
											/>
										</div>
										
										<div>
											<Label htmlFor="imageUrl">画像URL</Label>
											<Input
												id="imageUrl"
												value={formData.imageUrl}
												onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
												placeholder="画像のURLを入力"
											/>
										</div>
										
										<div>
											<Label htmlFor="targetUrl">リンク先URL</Label>
											<Input
												id="targetUrl"
												value={formData.targetUrl}
												onChange={(e) => setFormData(prev => ({ ...prev, targetUrl: e.target.value }))}
												placeholder="クリック時の遷移先URLを入力"
											/>
										</div>
										
										<div className="flex gap-2">
											<Button onClick={handleSave} className="flex-1">
												{selectedBubble ? '更新' : '追加'}
											</Button>
											<Button onClick={handleCancel} variant="outline">
												キャンセル
											</Button>
										</div>
									</div>
								) : (
									<div className="space-y-2">
										{photoBubbles.length === 0 ? (
											<p className="text-gray-500">フォトバブルがありません</p>
										) : (
											photoBubbles.map((bubble) => (
												<div
													key={bubble.id}
													className="flex items-center justify-between p-3 border rounded-lg"
												>
													<div className="flex items-center gap-3">
														<div className="w-8 h-8 rounded-full overflow-hidden">
															{bubble.imageUrl ? (
																<img 
																	src={bubble.imageUrl} 
																	alt={bubble.description || "フォトバブル"} 
																	className="w-full h-full object-cover"
																/>
															) : (
																<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
																	<span className="text-white text-xs">📷</span>
																</div>
															)}
														</div>
														<div>
															<p className="font-medium">{bubble.description || '説明なし'}</p>
															<p className="text-sm text-gray-500">({bubble.x}, {bubble.y})</p>
														</div>
													</div>
													<div className="flex gap-1">
														<Button
															onClick={() => handleBubbleClick(bubble)}
															variant="outline"
															size="sm"
														>
															<Move className="w-4 h-4" />
														</Button>
														<Button
															onClick={() => handleDeleteBubble(bubble.id)}
															variant="destructive"
															size="sm"
														>
															<X className="w-4 h-4" />
														</Button>
													</div>
												</div>
											))
										)}
									</div>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			</Rnd>
		</div>
	);
} 