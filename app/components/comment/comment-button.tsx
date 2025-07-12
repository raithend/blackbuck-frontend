"use client";

import { ImageUpload } from "@/app/components/post/image-upload";
import { LocationDropdownMenu } from "@/app/components/post/location-dropdown-menu";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { useUser } from "@/app/contexts/user-context";
import { MessageCircle, UserRound } from "lucide-react";
import { useState } from "react";

interface CommentProps {
	postId: string;
	commentCount?: number;
}

export function CommentButton({ postId, commentCount = 0 }: CommentProps) {
	const [content, setContent] = useState("");
	const [location, setLocation] = useState("");
	const [classification, setClassification] = useState("");
	const [imageFiles, setImageFiles] = useState<File[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { user } = useUser();

	const uploadToS3 = async (file: File): Promise<string> => {
		const formData = new FormData();
		formData.append("file", file);

		const response = await fetch("/api/upload/posts", {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error("アップロードに失敗しました");
		}

		const data = await response.json();
		return data.url;
	};

	const handleSubmit = async () => {
		if (!content.trim()) {
			return;
		}

		try {
			setIsSubmitting(true);

			// S3に画像をアップロード
			const imageUrls = await Promise.all(
				imageFiles.map((file) => uploadToS3(file)),
			);

			// 認証トークンを取得
			const supabase = await import("@/app/lib/supabase-browser").then(m => m.createClient());
			const { data: { session } } = await supabase.auth.getSession();
			
			if (!session?.access_token) {
				throw new Error("認証トークンが取得できません");
			}

			const response = await fetch(`/api/posts/${postId}/comments`, {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${session.access_token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					content: content.trim(),
					location: location || undefined,
					classification: classification || undefined,
					imageUrls,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "コメントの投稿に失敗しました");
			}

			// フォームをリセット
			setContent("");
			setLocation("");
			setClassification("");
			setImageFiles([]);
			setIsOpen(false);
		} catch (error) {
			console.error("コメント投稿エラー:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm" className="flex items-center gap-2">
					<MessageCircle className="h-4 w-4" />
					<span>コメント</span>
					{commentCount > 0 && (
						<span className="text-sm text-gray-600 min-w-[1rem] text-center">
							{commentCount}
						</span>
					)}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>コメントを投稿</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<div className="flex items-center space-x-2">
						<Avatar>
							<AvatarImage src={user?.avatar_url ?? undefined} />
							<AvatarFallback>
								<UserRound />
							</AvatarFallback>
						</Avatar>
						<div>
							<p className="font-medium">{user?.username}</p>
							<p className="text-sm text-gray-500">{user?.account_id}</p>
						</div>
					</div>
					<Textarea
						placeholder="コメントを入力..."
						value={content}
						onChange={(e) => setContent(e.target.value)}
						className="min-h-[100px]"
					/>
					<LocationDropdownMenu value={location} onChange={setLocation} />
					<Input
						type="text"
						placeholder="分類"
						value={classification}
						onChange={(e) => setClassification(e.target.value)}
					/>
					<ImageUpload value={imageFiles} onChange={setImageFiles} />
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => setIsOpen(false)}
							disabled={isSubmitting}
						>
							キャンセル
						</Button>
						<Button 
							onClick={handleSubmit}
							disabled={isSubmitting || !content.trim()}
						>
							{isSubmitting ? "投稿中..." : "投稿"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
