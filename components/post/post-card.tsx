"use client";

import { Post } from "@/types/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <Avatar>
          <AvatarImage src={post.user.avatarUrl} />
          <AvatarFallback>{post.user.username[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{post.user.username}</p>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.createdAt), {
              addSuffix: true,
              locale: ja,
            })}
          </p>
        </div>
      </div>
      {post.imageUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {post.imageUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`投稿画像 ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg"
            />
          ))}
        </div>
      )}
      <p className="whitespace-pre-wrap">{post.content}</p>
      {post.location && (
        <p className="text-sm text-gray-500">場所: {post.location}</p>
      )}
      {post.species && (
        <p className="text-sm text-gray-500">種: {post.species}</p>
      )}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className={post.liked ? "text-red-500" : ""}
        >
          <Heart className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
} 