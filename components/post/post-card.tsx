import Image from "next/image";
import { Post } from "@/types/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { UserRound } from "lucide-react";
import { CommentButton } from "@/components/comment/comment-button";
import { HeartButton } from "./heart-button";

interface PostCardProps {
	post: Post;
}
  
export function PostCard({ post }: PostCardProps) {
	return (
		<Card className="grid gap-2 p-0 md:px-16">
			<CardHeader className="flex-row items-center p-0 m-4 md:m-0">
				<div>
					<Avatar>
						<AvatarImage src={post.user.avatar_url || undefined}  />
						<AvatarFallback>
							<UserRound />
						</AvatarFallback>
					</Avatar>
				</div>
				<div className="pl-2">
					<div className="text-base font-semibold">{post.user.name}</div>
					<div>{post.user.account_id}</div>
				</div>
			</CardHeader>

			<CardContent className="p-0">
				<Carousel>
					<CarouselContent>
						{post.post_images.map((image) => (
							<CarouselItem key={image.id}>
								<Card>
									<CardContent className="flex aspect-square items-center justify-center p-0">
										<Image
											src={image.url}
											alt="species picture"
											width={1000}
											height={1000}
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
							<HeartButton />
							<CommentButton postId={post.id.toString()} />
						</div>
						<div className="text-sm text-gray-500 text-right">
							最終更新：{formatDistanceToNow(new Date(post.updated_at), { locale: ja })}
						</div>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
}
