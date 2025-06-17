"use client";

import { PostCards } from "@/app/components/post/post-cards";
import { ProfileHeader } from "@/app/components/profile/profile-header";
import { fetcher } from "@/app/lib/fetcher";
import { Post, User } from "@/app/types/types";
import useSWR from "swr";

// const fetcherWithProfile = async (url: string): Promise<User> => {
// 	const data = await fetcher<User>(url);
// 	return data;
// };

// const fetcherWithPosts = async (url: string): Promise<Post[]> => {
// 	const data = await fetcher<Post[]>(url);
// 	return data;
// };

export default function UserProfilePage() {
	// export default function UserProfilePage({ params }: { params: { accountId: string } }) {
	// 	const { data: profile, error: profileError } = useSWR<User>(`/api/users/account/${params.accountId}`, fetcherWithProfile);
	// 	const { data: posts, error: postsError } = useSWR<Post[]>(`/api/users/account/${params.accountId}/posts`, fetcherWithPosts);

	// 	if (profileError || postsError) {
	// 		return <div>エラーが発生しました</div>;
	// 	}

	// 	if (!profile) {
	// 		return <div>読み込み中...</div>;
	// 	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* <ProfileHeader profile={profile} />
			<PostCards posts={posts || []} /> */}
		</div>
	);
}
