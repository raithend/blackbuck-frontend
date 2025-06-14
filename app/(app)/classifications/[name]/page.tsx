import { Post } from "@/app/api/db/types";
import { PostCard } from "@/app/components/post/post-card";

async function getPosts(name: string) {
  const response = await fetch(`/api/classifications/${name}`);
  if (!response.ok) {
    throw new Error("投稿の取得に失敗しました");
  }
  return response.json();
}

export default async function ClassificationPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const { posts } = await getPosts(decodedName);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">{decodedName}の投稿一覧</h1>
      <div className="space-y-6">
        {posts.map((post: Post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
} 