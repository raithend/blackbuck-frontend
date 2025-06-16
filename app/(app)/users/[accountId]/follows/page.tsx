"use client";

import { fetcher } from "@/app/lib/fetcher";
import { User } from "@/app/types/types";
import useSWR from "swr";

export default function FollowsPage({ params }: { params: { id: string } }) {
	// const {
	// 	data: follows,
	// 	error,
	// 	isLoading,
	// } = useSWR<User[]>(`/api/users/${params.id}/follows`, fetcher);

	// if (error) {
	// 	return <div>エラーが発生しました</div>;
	// }

	// if (isLoading) {
	// 	return <div>読み込み中...</div>;
	// }

	return (
		<div>
			{/* {follows?.map((user) => (
				<div key={user.id}>{user.username}</div>
			))} */}
		</div>
	);
}
