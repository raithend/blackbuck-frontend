"use client";

import { PostCard } from './post-card';

interface Post {
  id: string;
  content: string;
  image_urls: string[];
  created_at: string;
  updated_at: string;
  liked: boolean;
  user: {
    id: string;
    username: string;
    avatar_url: string | undefined;
  };
}

interface PostCardsProps {
  posts?: Post[];
}

export function PostCards({ posts = [] }: PostCardsProps) {
  if (posts.length === 0) {
    return <div>投稿がありません</div>;
  }

  return (
    <div className="grid gap-2">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
} 