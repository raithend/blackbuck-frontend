"use client";

import { AuthDialog } from "@/app/components/auth/auth-dialog";
import { Button } from "@/app/components/ui/button";
import { useUser } from "@/app/contexts/user-context";
import type { Classification } from "@/app/types/types";
import { Edit, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ClassificationEditDialog } from "./classification-edit-dialog";

interface ClassificationEditButtonProps {
	classification: Classification | null;
	onUpdate: () => void;
}

export function ClassificationEditButton({
	classification,
	onUpdate,
}: ClassificationEditButtonProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [authDialogOpen, setAuthDialogOpen] = useState(false);
	const { user } = useUser();
	const params = useParams();
	const decodedName = decodeURIComponent(params.name as string);

	const handleSave = async (data: Partial<Classification>) => {
		console.log("handleSaveが呼び出されました", { classification, data });
		try {
			const supabase = await import("@/app/lib/supabase-browser").then((m) =>
				m.createClient(),
			);
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.access_token) {
				throw new Error("認証トークンが取得できません");
			}

			if (classification) {
				// 既存の分類情報を更新
				console.log("既存の分類情報を更新します", classification.name);
				const response = await fetch(
					`/api/classifications/${encodeURIComponent(classification.name)}`,
					{
						method: "PUT",
						headers: {
							Authorization: `Bearer ${session.access_token}`,
							"Content-Type": "application/json",
						},
						body: JSON.stringify(data),
					},
				);

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "分類情報の更新に失敗しました");
				}
			} else {
				// 新しい分類情報を作成
				console.log("新しい分類情報を作成します", decodedName);
				const response = await fetch("/api/classifications", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${session.access_token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: decodedName,
						...data,
					}),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "分類情報の作成に失敗しました");
				}
			}

			console.log("分類情報の保存が完了しました");
			onUpdate();
		} catch (error) {
			console.error("分類情報更新エラー:", error);
			throw error;
		}
	};

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={() => {
					if (!user) {
						// 未ログイン状態の場合はauthダイアログを表示
						setAuthDialogOpen(true);
						return;
					}
					setIsDialogOpen(true);
				}}
				className="flex items-center gap-2"
			>
				{classification ? (
					<>
						<Edit className="h-4 w-4" />
						編集
					</>
				) : (
					<>
						<Plus className="h-4 w-4" />
						分類情報を作成
					</>
				)}
			</Button>

			{user && (
				<ClassificationEditDialog
					classification={classification}
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
					onSave={handleSave}
					classificationName={decodedName}
				/>
			)}
			<AuthDialog
				isOpen={authDialogOpen}
				onClose={() => setAuthDialogOpen(false)}
				mode="login"
			/>
		</>
	);
}
