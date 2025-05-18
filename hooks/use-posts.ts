import { Post } from "@/types/post";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("APIがJSONを返していません");
  }

  return response.json();
};

export function usePosts(apiUrl: string) {
  const { data: posts, error, isLoading } = useSWR<Post[]>(apiUrl, fetcher);

  return {
    posts: posts || [],
    loading: isLoading,
    error: error?.message || null,
  };
} 