"use client";

import { PostCards } from "@/components/post/post-cards";
import { ProfileHeader } from "@/components/profile/profile-header";
import { getProfile } from "@/lib/api";
import useSWR from "swr";
import { fetcher } from "@/lib/api";

const fetcherWithProfile = async () => {
	const data = await getProfile();
	return data;
};

export default function ProfilePage() {

	const { data: profile, error } = useSWR(`/api/v1/users/[id]`, fetcherWithProfile);

	if (error) {
		return <div>エラーが発生しました</div>;
	}

	if (!profile) {
		return <div>読み込み中...</div>;
	}

	return (
		<div>
			<ProfileHeader profile={profile} />
			<PostCards posts={profile.posts} />
		</div>
	);
}
