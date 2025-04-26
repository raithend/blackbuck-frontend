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
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className={post.liked ? "text-red-500" : ""}
          >
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          最終更新:{" "}
          {formatDistanceToNow(new Date(post.updatedAt), {
            addSuffix: true,
            locale: ja,
          })}
        </p>
      </div>
    </div>
  );
} 