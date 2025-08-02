"use client";

import { useState } from "react";
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
import { Textarea } from "@/app/components/ui/textarea";
import { Sparkles } from "lucide-react";
import type { Classification } from "@/app/types/types";

interface ClassificationEditDialogProps {
	classification: Classification | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (data: Partial<Classification>) => Promise<void>;
	classificationName: string;
}

export function ClassificationEditDialog({
	classification,
	open,
	onOpenChange,
	onSave,
	classificationName,
}: ClassificationEditDialogProps) {
	const [formData, setFormData] = useState<Partial<Classification>>({
		english_name: classification?.english_name || "",
		scientific_name: classification?.scientific_name || "",
		description: classification?.description || "",
		era_start: classification?.era_start || "",
		era_end: classification?.era_end || "",
	});

	const [isLoading, setIsLoading] = useState(false);
	const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

	const handleInputChange = (field: keyof Classification, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSave = async () => {
		setIsLoading(true);
		try {
			// 分類情報を更新または作成
			await onSave({
				...formData,
			});

			onOpenChange(false);
		} catch (error) {
			console.error("分類情報の保存に失敗しました:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGenerateSummary = async () => {
		setIsGeneratingSummary(true);
		try {
			// 認証トークンを取得
			const supabase = await import("@/app/lib/supabase-browser").then(m => m.createClient());
			const { data: { session } } = await supabase.auth.getSession();
			
			if (!session?.access_token) {
				throw new Error("認証トークンが取得できません");
			}

			const response = await fetch(`/api/classifications/${encodeURIComponent(classificationName)}/wikipedia-summary`, {
				headers: {
					"Authorization": `Bearer ${session.access_token}`,
				},
			});
			
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Wikipediaからの概要取得に失敗しました");
			}
			
			const data = await response.json();
			if (data.summary) {
				// Wikipediaからの引用元を明記
				const citation = `\n\n---\n出典: Wikipedia (${data.language === 'en' ? '英語版' : '日本語版'}) - ${data.url || 'https://wikipedia.org'}`;
				const summaryWithCitation = data.summary + citation;
				
				setFormData(prev => ({
					...prev,
					description: summaryWithCitation
				}));
			} else {
				throw new Error("Wikipediaから概要を取得できませんでした");
			}
		} catch (error) {
			console.error("Wikipedia概要生成エラー:", error);
			alert(error instanceof Error ? error.message : "Wikipediaからの概要取得に失敗しました");
		} finally {
			setIsGeneratingSummary(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{classification ? '分類情報を編集' : '分類情報を作成'}
					</DialogTitle>
					<DialogDescription>
						{classification 
							? `${classification.name}の情報を編集できます。`
							: '新しい分類の情報を入力してください。'
						}
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="english_name">英語名</Label>
							<Input
								id="english_name"
								value={formData.english_name || ""}
								onChange={(e) => handleInputChange("english_name", e.target.value)}
								placeholder="英語名を入力"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="scientific_name">学名</Label>
							<Input
								id="scientific_name"
								value={formData.scientific_name || ""}
								onChange={(e) => handleInputChange("scientific_name", e.target.value)}
								placeholder="学名を入力"
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="era_start">時代（開始）</Label>
							<Input
								id="era_start"
								value={formData.era_start || ""}
								onChange={(e) => handleInputChange("era_start", e.target.value)}
								placeholder="例: 中生代"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="era_end">時代（終了）</Label>
							<Input
								id="era_end"
								value={formData.era_end || ""}
								onChange={(e) => handleInputChange("era_end", e.target.value)}
								placeholder="例: 新生代"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">説明</Label>
						<div className="flex gap-2">
							<Textarea
								id="description"
								value={formData.description || ""}
								onChange={(e) => handleInputChange("description", e.target.value)}
								placeholder="分類の説明を入力"
								rows={3}
								className="flex-1"
							/>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleGenerateSummary}
								disabled={isGeneratingSummary}
								className="flex-shrink-0"
							>
								<Sparkles className="h-4 w-4 mr-2" />
								{isGeneratingSummary ? "生成中..." : "Wikipediaから生成"}
							</Button>
						</div>
					</div>


				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						キャンセル
					</Button>
					<Button 
						onClick={() => {
							console.log("保存ボタンがクリックされました");
							handleSave();
						}} 
						disabled={isLoading}
					>
						{isLoading ? "保存中..." : "保存"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
} 