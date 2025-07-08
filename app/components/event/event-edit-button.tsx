"use client";

import { EventDialog } from "@/app/components/event/event-dialog";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogTrigger } from "@/app/components/ui/dialog";
import { useUser } from "@/app/contexts/user-context";
import { useState } from "react";
import { toast } from "sonner";
import { Edit } from "lucide-react";
import type { Event } from "@/app/types/types";

interface EventEditButtonProps {
	event: Event;
}

export function EventEditButton({ event }: EventEditButtonProps) {
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

			const response = await fetch(`/api/events/${encodeURIComponent(event.name)}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.access_token}`,
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "イベントの更新に失敗しました");
			}

			toast.success("イベントを更新しました");
			setOpen(false);
			// ページをリロードして更新されたイベントを表示
			window.location.reload();
		} catch (error) {
			console.error("イベント更新エラー:", error);
			toast.error(
				error instanceof Error ? error.message : "イベントの更新に失敗しました",
			);
		}
	};

	if (!user) {
		return null; // ログインしていない場合は表示しない
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2">
					<Edit className="w-4 h-4" />
					編集
				</Button>
			</DialogTrigger>
			<EventDialog event={event} onSave={handleSave} />
		</Dialog>
	);
} 