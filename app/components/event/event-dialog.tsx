"use client";

import { Button } from "@/app/components/ui/button";
import {
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import type { Event } from "@/app/types/types";
import { useState } from "react";

interface EventDialogProps {
	event?: Event;
	onSave: (data: {
		name: string;
		description?: string;
		header_url?: string;
	}) => Promise<void>;
}

export function EventDialog({ event, onSave }: EventDialogProps) {
	const [name, setName] = useState(event?.name || "");
	const [description, setDescription] = useState(event?.description || "");
	const [headerUrl, setHeaderUrl] = useState(event?.header_url || "");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async () => {
		try {
			setIsSubmitting(true);
			await onSave({
				name,
				description: description || undefined,
				header_url: headerUrl || undefined,
			});
		} catch (error) {
			console.error("保存エラー:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>
					{event ? "イベントを編集" : "新しいイベントを追加"}
				</DialogTitle>
			</DialogHeader>
			<div className="space-y-4">
				<div>
					<label className="text-sm font-medium">イベント名 *</label>
					<Input
						placeholder="例: 特別展「恐竜」"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
				</div>
				<div>
					<label className="text-sm font-medium">説明</label>
					<Textarea
						placeholder="イベントの説明を入力してください"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={3}
					/>
				</div>
				<div>
					<label className="text-sm font-medium">ヘッダー画像URL</label>
					<Input
						placeholder="https://example.com/header.jpg"
						value={headerUrl}
						onChange={(e) => setHeaderUrl(e.target.value)}
						type="url"
					/>
				</div>
				<Button
					onClick={handleSubmit}
					disabled={isSubmitting || !name.trim()}
					className="w-full"
				>
					{isSubmitting ? "保存中..." : "保存"}
				</Button>
			</div>
		</DialogContent>
	);
}
