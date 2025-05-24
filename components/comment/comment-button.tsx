"use client";

import { useState } from "react";
import { useUser } from "@/contexts/user-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound, MessageCircle } from "lucide-react";

interface CommentProps {
  postId: string;
}

export function CommentButton({ postId }: CommentProps) {
  const [content, setContent] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/v1/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("コメントの投稿に失敗しました");
      }

      setContent("");
      setIsOpen(false);
    } catch (error) {
      console.error("コメントの投稿に失敗しました:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild><MessageCircle /></DialogTrigger>
      <DialogContent>
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
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.id}</p>
            </div>
          </div>
          <Textarea
            placeholder="コメントを入力..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmit}>投稿</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 