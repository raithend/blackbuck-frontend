import { useUser } from "@/app/contexts/user-context";
import { useEffect, useState } from "react";
import useSWR from "swr";

interface UseFollowStatusProps {
	targetAccountId: string;
}

export function useFollowStatus({ targetAccountId }: UseFollowStatusProps) {
	const { user } = useUser();
	const [isFollowing, setIsFollowing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// フォロー状態を取得
	const { data, error, mutate } = useSWR(
		user ? `/api/users/account/${targetAccountId}/follow` : null,
		async (url) => {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error("フォロー状態の取得に失敗しました");
			}
			return response.json();
		},
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
		},
	);

	// データが更新されたら状態を同期
	useEffect(() => {
		if (data) {
			setIsFollowing(data.isFollowing);
		}
	}, [data]);

	// フォロー/アンフォロー操作
	const toggleFollow = async () => {
		if (!user) {
			throw new Error("ログインが必要です");
		}

		setIsLoading(true);

		try {
			const url = `/api/users/account/${targetAccountId}/follow`;
			const method = isFollowing ? "DELETE" : "POST";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "操作に失敗しました");
			}

			// ローカル状態を更新
			setIsFollowing(!isFollowing);

			// SWRキャッシュを更新
			await mutate({ isFollowing: !isFollowing });

			return !isFollowing;
		} catch (error) {
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		isFollowing,
		isLoading: isLoading || (!data && !error),
		error,
		toggleFollow,
		mutate,
	};
}
