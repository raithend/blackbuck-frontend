"use client";

import { LocationEditDialog } from "@/app/components/location/location-edit-dialog";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogTrigger } from "@/app/components/ui/dialog";
import { useUser } from "@/app/contexts/user-context";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function LocationButton() {
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

			const response = await fetch("/api/locations", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.access_token}`,
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "場所の作成に失敗しました");
			}

			toast.success("場所を作成しました");
			setOpen(false);
			// ページをリロードして新しい場所を表示
			window.location.reload();
		} catch (error) {
			console.error("場所作成エラー:", error);
			toast.error(
				error instanceof Error ? error.message : "場所の作成に失敗しました",
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
					場所を追加
				</Button>
			</DialogTrigger>
            <LocationEditDialog onSave={handleSave} />
		</Dialog>
	);
}
