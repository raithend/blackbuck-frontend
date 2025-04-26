import { useState, useEffect } from "react";
import { Post } from "@/types/post";

export function usePosts(apiUrl: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("APIがJSONを返していません");
        }

        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("投稿の取得に失敗しました:", error);
        setError(error instanceof Error ? error.message : "投稿の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [apiUrl]);

  return { posts, loading, error };
} 