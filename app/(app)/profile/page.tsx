"use client";

import { ProfileHeader } from "@/components/profile/profile-header";
import { PostCards } from "@/components/post/post-cards";
import { useProfile } from "@/contexts/profile-context";
import { useEffect } from "react";
import { getProfile } from "@/lib/api";

export default function ProfilePage() {
	const { profile, setProfile } = useProfile();

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const data = await getProfile();
				setProfile(data);
			} catch (error) {
				console.error("プロフィール情報の取得に失敗しました:", error);
			}
		};

		fetchProfile();
	}, [setProfile]);

	return (
		<div className="min-h-screen bg-background">
			<div className="grid gap-2">
				<ProfileHeader profile={profile} />
				<PostCards apiUrl="/api/v1/posts" />
			</div>
		</div>
	);
}
