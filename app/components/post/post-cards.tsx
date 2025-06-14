"use client";

import { PostCard } from './post-card';
import { Post } from '@/app/types';

interface PostCardsProps {
  posts: Post[];
}

export function PostCards({ posts }: PostCardsProps) {
  if (posts.length === 0) return <div>投稿がありません</div>;

  return (
    <div className="grid gap-2">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
} 