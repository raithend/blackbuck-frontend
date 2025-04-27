"use client";

import { useParams } from "next/navigation";
import { PostCards } from "@/components/post/post-cards";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LikesPage() {
  const params = useParams();
  const userId = params.id as string;

  const { data: posts, error, isLoading } = useSWR(
    `/api/v1/users/${userId}/likes`,
    fetcher
  );

  if (error) {
    return <div>エラーが発生しました</div>;
  }

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <PostCards apiUrl={`/api/v1/users/${userId}/likes`} />
    </div>
  );
} 