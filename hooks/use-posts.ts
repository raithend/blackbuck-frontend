import { Post } from "@/types/post";
import useSWR from "swr";
import { fetcher } from "@/lib/api";

export function usePosts(apiUrl: string) {
  const { data: posts, error, isLoading } = useSWR<Post[]>(apiUrl, fetcher);

  return {
    posts: posts || [],
    loading: isLoading,
    error: error?.message || null,
  };
} 