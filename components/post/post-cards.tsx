"use client";

import { PostCard } from "@/components/main-content/post-card";
import { usePosts } from "@/hooks/use-posts";

interface PostCardsProps {
  apiUrl: string;
}

export function PostCards({ apiUrl }: PostCardsProps) {
  const { posts, loading, error } = usePosts(apiUrl);

  if (loading) {
    return <div></div>;
  }

  if (error) {
    return <div className="text-red-500">エラー: {error}</div>;
  }

  if (posts.length === 0) {
    return <div>投稿はありません</div>;
  }

  return (
    <div className="grid gap-2">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
} 