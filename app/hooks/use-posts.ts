import type { Post } from "@/app/types/types";
import useSWR from "swr";

// フェッチャー関数
const fetcher = async (url: string) => {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error("Failed to fetch data");
		}
		return response.json();
	} catch (error) {
		// ネットワークエラーの場合は既存データを保持するため、エラーを投げない
		if (error instanceof TypeError && error.message.includes("fetch")) {
			console.warn(
				"ネットワークエラーが発生しましたが、既存のデータを表示し続けます:",
				error,
			);
			return null; // nullを返すことで、既存のデータを保持
		}
		throw error;
	}
};

export function usePosts(apiUrl: string) {
	const { data: posts, error, isLoading } = useSWR<Post[]>(apiUrl, fetcher);

	return {
		posts: posts || [],
		loading: isLoading,
		error: error?.message || null,
	};
}
