import { fetcher } from "@/app/lib/fetcher";
import type { Post } from "@/app/types/types";
import useSWR from "swr";

export function usePosts(apiUrl: string) {
	const { data: posts, error, isLoading } = useSWR<Post[]>(apiUrl, fetcher);

	return {
		posts: posts || [],
		loading: isLoading,
		error: error?.message || null,
	};
}
