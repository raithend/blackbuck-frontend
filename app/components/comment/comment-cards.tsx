"use client";

import { CommentButton } from "@/app/components/comment/comment-button";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/app/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/app/components/ui/carousel";
import { Dialog, DialogTrigger } from "@/app/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { MoreHorizontal, Edit, Trash2, UserRound } from "lucide-react";
import Image from "next/image";
import { useUser } from "@/app/contexts/user-context";
import { useState } from "react";
import { CommentHeartButton } from "./comment-heart-button";

interface CommentWithPost {
	id: string;
	content: string;
	location: string | null;
	event: string | null;
	classification: string | null;
	created_at: string;
	updated_at: string;
	likeCount: number;
	isLiked: boolean;
	user: {
		id: string;
		account_id: string;
		username: string;
		avatar_url: string | null;
	};
	comment_images: Array<{
		id: string;
		image_url: string;
		order_index: number;
	}>;
}

interface CommentCardsProps {
	comments: CommentWithPost[];
	onLikeChange?: (commentId: string, likeCount: number, isLiked: boolean) => void;
	onCommentUpdate?: (commentId: string) => void;
	onCommentDelete?: (commentId: string) => void;
}

// 日付を安全にフォーマットする関数
const formatDateSafely = (dateString: string | undefined) => {
	if (!dateString) return "日時不明";
	
	try {
		const date = new Date(dateString);
		if (Number.isNaN(date.getTime())) {
			return "日時不明";
		}
		return formatDistanceToNow(date, { locale: ja });
	} catch (error) {
		return "日時不明";
	}
};

export function CommentCards({ comments, onLikeChange, onCommentUpdate, onCommentDelete }: CommentCardsProps) {
	const { user: currentUser } = useUser();
	const [isEditDialogOpen, setIsEditDialogOpen] = useState<string | null>(null);

	const handleLikeChange = (commentId: string, likeCount: number, isLiked: boolean) => {
		onLikeChange?.(commentId, likeCount, isLiked);
	};

	const handleEdit = (commentId: string) => {
		setIsEditDialogOpen(commentId);
	};

	const handleEditSubmit = async (commentId: string, data: {
		content?: string;
		location?: string;
		event?: string;
		classification?: string;
		imageUrls: string[];
	}) => {
		try {
			const supabase = await import("@/app/lib/supabase-browser").then(m => m.createClient());
			const { data: { session } } = await supabase.auth.getSession();
			
			if (!session?.access_token) {
				throw new Error("認証トークンが取得できません");
			}

			const response = await fetch(`/api/comments/${commentId}`, {
				method: "PUT",
				headers: {
					"Authorization": `Bearer ${session.access_token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "コメントの更新に失敗しました");
			}

			onCommentUpdate?.(commentId);
		} catch (error) {
			console.error("コメント更新エラー:", error);
		}
	};

	const handleDelete = async (commentId: string) => {
		try {
			const supabase = await import("@/app/lib/supabase-browser").then(m => m.createClient());
			const { data: { session } } = await supabase.auth.getSession();
			
			if (!session?.access_token) {
				throw new Error("認証トークンが取得できません");
			}

			const response = await fetch(`/api/comments/${commentId}`, {
				method: "DELETE",
				headers: {
					"Authorization": `Bearer ${session.access_token}`,
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "コメントの削除に失敗しました");
			}

			onCommentDelete?.(commentId);
		} catch (error) {
			console.error("コメント削除エラー:", error);
		}
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{comments.map((comment) => {
				const isOwnComment = currentUser?.account_id === comment.user.account_id;
				
				return (
					<Card key={comment.id} className="grid gap-2 p-0 md:px-16">
						<CardHeader className="flex-row items-center justify-between p-0 m-4 md:m-0">
							<div className="flex items-center">
								<Avatar>
									<AvatarImage src={comment.user.avatar_url || undefined} />
									<AvatarFallback>
										<UserRound />
									</AvatarFallback>
								</Avatar>
								<div className="pl-2">
									<div className="text-base font-semibold">{comment.user.username}</div>
									<div>{comment.user.account_id}</div>
								</div>
							</div>
							
							{/* 自分のコメントの場合のみドットメニューを表示 */}
							{isOwnComment && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="h-8 w-8">
											<MoreHorizontal className="h-4 w-4 text-gray-500" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => handleEdit(comment.id)}>
											<Edit className="mr-2 h-4 w-4" />
											<span>編集</span>
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => handleDelete(comment.id)} className="text-red-600">
											<Trash2 className="mr-2 h-4 w-4" />
											<span>削除</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</CardHeader>

						<CardContent className="p-0">
							{comment.comment_images && comment.comment_images.length > 0 && (
								<Carousel>
									<CarouselContent>
										{comment.comment_images.map((image) => (
											<CarouselItem key={image.id}>
												<Card>
													<CardContent className="flex aspect-square items-center justify-center p-0">
														<Image
															src={image.image_url}
															alt="comment image"
															width={1000}
															height={1000}
															style={{ width: "auto", height: "auto" }}
														/>
													</CardContent>
												</Card>
											</CarouselItem>
										))}
									</CarouselContent>
									<div className="hidden md:block">
										<CarouselPrevious />
									</div>
									<div className="hidden md:block">
										<CarouselNext />
									</div>
								</Carousel>
							)}
						</CardContent>

						<CardFooter className="ml-12 md:m-0 p-0">
							<div className="grid gap-4">
								<div className="grid gap-1">
									<div>{comment.content}</div>
									{comment.location && (
										<div className="text-sm">
											撮影地：{comment.location}
										</div>
									)}
									{comment.event && (
										<div className="text-sm">
											イベント：{comment.event}
										</div>
									)}
									{comment.classification && (
										<div className="text-sm">
											分類：{comment.classification}
										</div>
									)}
								</div>
															<div className="flex justify-between items-center">
								<div className="flex gap-2">
									<CommentHeartButton 
										commentId={comment.id}
										initialLikeCount={comment.likeCount || 0}
										initialIsLiked={comment.isLiked || false}
										onLikeChange={(likeCount, isLiked) => handleLikeChange(comment.id, likeCount, isLiked)}
									/>
									<CommentButton postId={comment.id.toString()} commentCount={0} />
								</div>
								<div className="text-sm text-gray-500 text-right">
									<div>最終更新：{formatDateSafely(comment.updated_at)}</div>
								</div>
							</div>
							</div>
						</CardFooter>
					</Card>
				);
			})}
		</div>
	);
} 