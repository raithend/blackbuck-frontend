"use client";

import { AuthDialog } from "@/app/components/auth/auth-dialog";
import { PostDialog } from "@/app/components/post/post-dialog";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogTrigger } from "@/app/components/ui/dialog";
import { useUser } from "@/app/contexts/user-context";
import { useState } from "react";
import { toast } from "sonner";

export function PostButton() {
	const [open, setOpen] = useState(false);
	const [authDialogOpen, setAuthDialogOpen] = useState(false);
	const [resetKey, setResetKey] = useState(0); // リセット用のキー
	const { user, session } = useUser();

	const handlePost = async (data: {
		content?: string;
		location?: string;
		event?: string;
		classification?: string;
		imageUrls: string[];
	}) => {
		try {
			// 投稿内容または画像のいずれかが必要
			if (
				(!data.content || data.content.trim() === "") &&
				(!data.imageUrls || data.imageUrls.length === 0)
			) {
				toast.error("投稿内容または画像のいずれかが必要です");
				return;
			}

			if (!session) {
				toast.error("認証が必要です");
				return;
			}

			const response = await fetch("/api/posts", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.access_token}`,
				},
				body: JSON.stringify({
					content: data.content || "",
					location: data.location || "",
					event: data.event || "",
					classification: data.classification || "",
					image_urls: data.imageUrls,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				console.error("投稿エラー:", error);
				throw new Error(error.error || "投稿に失敗しました");
			}

			toast.success("投稿が完了しました");
			setOpen(false);
			setResetKey(prev => prev + 1); // リセットキーを更新
		} catch (error) {
			console.error("投稿エラー:", error);
			toast.error(
				error instanceof Error ? error.message : "投稿に失敗しました",
			);
		}
	};

	if (!user) {
		return (
			<>
				<Button onClick={() => setAuthDialogOpen(true)}>投稿する</Button>
				<AuthDialog
					isOpen={authDialogOpen}
					onClose={() => setAuthDialogOpen(false)}
					mode="login"
				/>
			</>
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>投稿する</Button>
			</DialogTrigger>
			<PostDialog key={resetKey} onPost={handlePost} />
		</Dialog>
	);
}
