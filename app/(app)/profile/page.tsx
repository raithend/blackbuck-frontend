"use client";

import { useParams } from "next/navigation";
import { PostCards } from "@/components/post/post-cards";
import { ProfileHeader } from "@/components/profile/profile-header";
import { useProfile } from "@/contexts/profile-context";
import useSWR from "swr";
import { getProfile } from "@/lib/api";

const fetcher = async () => {
	const data = await getProfile();
	return data;
};

export default function Page() {
	const params = useParams();
	const userId = params.id as string;
	const { setProfile } = useProfile();

	const { data: profile, error } = useSWR("profile", fetcher, {
		onSuccess: (data) => {
			setProfile(data);
		},
	});

	if (error) {
		return <div>エラーが発生しました</div>;
	}

	if (!profile) {
		return <div>読み込み中...</div>;
	}

	return (
		<div>
			<ProfileHeader profile={profile} />
			<PostCards apiUrl={`/api/v1/posts/users/${userId}`} />
		</div>
	);
}
