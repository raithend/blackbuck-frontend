"use client";

import { EventDialog } from "@/app/components/event/event-dialog";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogTrigger } from "@/app/components/ui/dialog";
import { useUser } from "@/app/contexts/user-context";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function EventButton() {
	const [open, setOpen] = useState(false);
	const { user, session } = useUser();

	const handleSave = async (data: {
		name: string;
		description?: string;
		header_url?: string;
	}) => {
		try {
			if (!session) {
				toast.error("認証が必要です");
				return;
			}

			const response = await fetch("/api/events", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.access_token}`,
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "イベントの作成に失敗しました");
			}

			toast.success("イベントを作成しました");
			setOpen(false);
			// ページをリロードして新しいイベントを表示
			window.location.reload();
		} catch (error) {
			console.error("イベント作成エラー:", error);
			toast.error(
				error instanceof Error ? error.message : "イベントの作成に失敗しました",
			);
		}
	};

	if (!user) {
		return null; // ログインしていない場合は表示しない
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm" className="gap-2">
					<Plus className="w-4 h-4" />
					イベントを追加
				</Button>
			</DialogTrigger>
			<EventDialog onSave={handleSave} />
		</Dialog>
	);
} 