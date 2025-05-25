"use client";

import { PostCard } from './post-card';
import { Post } from '@/types/post';

interface PostCardsProps {
  posts?: Post[];
}

export function PostCards({ posts = [] }: PostCardsProps) {
  if (posts.length === 0) {
    return <div>投稿がありません</div>;
  }

  // APIレスポンスをPost型に変換
  const transformedPosts: Post[] = posts.map(post => ({
    ...post,
    location: post.location || '',
    classification: post.classification || '',
    post_images: post.post_images || []
  }));

  return (
    <div className="grid gap-2">
      {transformedPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
} 