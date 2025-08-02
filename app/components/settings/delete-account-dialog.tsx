"use client";

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
import { createClient } from "@/app/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteAccountDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

export function DeleteAccountDialog({
	isOpen,
	onClose,
}: DeleteAccountDialogProps) {
	const [confirmationText, setConfirmationText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	const handleDelete = async () => {
		if (confirmationText !== "アカウント削除") {
			toast.error("確認テキストが正しくありません");
			return;
		}

		setIsDeleting(true);
		try {
			const supabase = createClient();

			// セッションからアクセストークンを取得
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) {
				throw new Error("セッションが見つかりません");
			}

			// APIエンドポイントを呼び出してアカウントを削除
			const response = await fetch("/api/users/me/delete", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.access_token}`,
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "アカウントの削除に失敗しました");
			}

			// ログアウトしてホームページにリダイレクト
			await supabase.auth.signOut();
			toast.success("アカウントを削除しました");
			router.push("/");
		} catch (error) {
			console.error("アカウント削除エラー:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "アカウントの削除に失敗しました",
			);
		} finally {
			setIsDeleting(false);
			onClose();
		}
	};

	const handleCancel = () => {
		setConfirmationText("");
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>アカウントの削除</DialogTitle>
					<DialogDescription>
						この操作は元に戻せません。アカウントを削除すると、すべてのデータが永久に削除されます。
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="confirmation">
							確認のため「アカウント削除」と入力してください
						</Label>
						<Input
							id="confirmation"
							value={confirmationText}
							onChange={(e) => setConfirmationText(e.target.value)}
							placeholder="アカウント削除"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={handleCancel}
						disabled={isDeleting}
					>
						キャンセル
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={confirmationText !== "アカウント削除" || isDeleting}
					>
						{isDeleting ? "削除中..." : "アカウントを削除"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
