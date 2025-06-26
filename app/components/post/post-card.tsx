import { CommentButton } from "@/app/components/comment/comment-button";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/app/components/ui/avatar";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/app/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/app/components/ui/carousel";
import {
	Dialog,
	DialogTrigger,
} from "@/app/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import type { PostWithUser } from "@/app/types/types";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { MoreHorizontal, Edit, Trash2, UserRound } from "lucide-react";
import Image from "next/image";
import { useUser } from "@/app/contexts/user-context";
import { HeartButton } from "./heart-button";
import { PostEditDialog } from "./post-edit-dialog";
import { useState } from "react";

interface PostCardProps {
	post: PostWithUser;
	onLikeChange?: (postId: string, likeCount: number, isLiked: boolean) => void;
	onPostUpdate?: (postId: string) => void;
	onPostDelete?: (postId: string) => void;
}

// 日付を安全にフォーマットする関数
const formatDateSafely = (dateString: string | undefined) => {
	if (!dateString) return "日時不明";
	
	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			return "日時不明";
		}
		return formatDistanceToNow(date, { locale: ja });
	} catch (error) {
		return "日時不明";
	}
};

export function PostCard({ post, onLikeChange, onPostUpdate, onPostDelete }: PostCardProps) {
	const { user: currentUser } = useUser();
	const isOwnPost = currentUser?.account_id === post.user.account_id;
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	const handleLikeChange = (likeCount: number, isLiked: boolean) => {
		onLikeChange?.(post.id, likeCount, isLiked);
	};

	const handleEdit = () => {
		setIsEditDialogOpen(true);
	};

	const handleEditSubmit = async (postId: string, data: {
		content?: string;
		location?: string;
		classification?: string;
		imageUrls: string[];
	}) => {
		try {
			const supabase = await import("@/app/lib/supabase-browser").then(m => m.createClient());
			const { data: { session } } = await supabase.auth.getSession();
			
			if (!session?.access_token) {
				throw new Error("認証トークンが取得できません");
			}

			const response = await fetch(`/api/posts/${postId}`, {
				method: "PUT",
				headers: {
					"Authorization": `Bearer ${session.access_token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "投稿の更新に失敗しました");
			}

			onPostUpdate?.(postId);
		} catch (error) {
			console.error("投稿更新エラー:", error);
		}
	};

	const handleDelete = async () => {
		try {
			const supabase = await import("@/app/lib/supabase-browser").then(m => m.createClient());
			const { data: { session } } = await supabase.auth.getSession();
			
			if (!session?.access_token) {
				throw new Error("認証トークンが取得できません");
			}

			const response = await fetch(`/api/posts/${post.id}`, {
				method: "DELETE",
				headers: {
					"Authorization": `Bearer ${session.access_token}`,
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "投稿の削除に失敗しました");
			}

			onPostDelete?.(post.id);
		} catch (error) {
			console.error("投稿削除エラー:", error);
		}
	};

	return (
		<>
			<Card className="grid gap-2 p-0 md:px-16">
				<CardHeader className="flex-row items-center justify-between p-0 m-4 md:m-0">
					<div className="flex items-center">
						<Avatar>
							<AvatarImage src={post.user.avatar_url || undefined} />
							<AvatarFallback>
								<UserRound />
							</AvatarFallback>
						</Avatar>
						<div className="pl-2">
							<div className="text-base font-semibold">{post.user.username}</div>
							<div>{post.user.account_id}</div>
						</div>
					</div>
					
					{/* 自分の投稿の場合のみドットメニューを表示 */}
					{isOwnPost && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
									<MoreHorizontal className="h-4 w-4 text-gray-500" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
									<DialogTrigger asChild>
										<DropdownMenuItem onClick={handleEdit}>
											<Edit className="mr-2 h-4 w-4" />
											<span>編集</span>
										</DropdownMenuItem>
									</DialogTrigger>
								</Dialog>
								<DropdownMenuItem onClick={handleDelete} className="text-red-600">
									<Trash2 className="mr-2 h-4 w-4" />
									<span>削除</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</CardHeader>

				<CardContent className="p-0">
					{post.post_images && post.post_images.length > 0 && (
						<Carousel>
							<CarouselContent>
								{post.post_images.map((image) => (
									<CarouselItem key={image.id}>
										<Card>
											<CardContent className="flex aspect-square items-center justify-center p-0">
												<Image
													src={image.image_url}
													alt="species picture"
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
							<div>{post.content}</div>
							<div>{post.location}</div>
							<div>{post.classification}</div>
						</div>
						<div className="flex justify-between items-center">
							<div className="flex gap-2">
								<HeartButton 
									postId={post.id}
									initialLikeCount={post.likeCount || 0}
									initialIsLiked={post.isLiked || false}
									onLikeChange={handleLikeChange}
								/>
								<CommentButton postId={post.id.toString()} />
							</div>
							<div className="text-sm text-gray-500 text-right">
								<div>最終更新：{formatDateSafely(post.updated_at)}</div>
							</div>
						</div>
					</div>
				</CardFooter>
			</Card>

			{/* 編集ダイアログ */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<PostEditDialog
					post={post}
					onEdit={handleEditSubmit}
					onClose={() => setIsEditDialogOpen(false)}
				/>
			</Dialog>
		</>
	);
}
