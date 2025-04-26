"use client";

import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FollowCards } from "@/components/follow/follow-cards";
import { useEffect, useState } from "react";
import { User } from "@/types/user";

export default function Page() {
	const params = useParams();
	const userId = params.id as string;
	const [followees, setFollowees] = useState<User[]>([]);
	const [followers, setFollowers] = useState<User[]>([]);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const [followeesRes, followersRes] = await Promise.all([
					fetch(`/api/v1/users/${userId}/followees`),
					fetch(`/api/v1/users/${userId}/followers`)
				]);
				const followeesData = await followeesRes.json();
				const followersData = await followersRes.json();
				setFollowees(followeesData);
				setFollowers(followersData);
			} catch (error) {
				console.error("ユーザー情報の取得に失敗しました:", error);
			}
		};

		fetchUsers();
	}, [userId]);

	return (
		<div>
			<Tabs defaultValue="followee">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="followee">フォロー中</TabsTrigger>
					<TabsTrigger value="follower">フォロワー</TabsTrigger>
				</TabsList>
				<TabsContent value="followee">
					<FollowCards initialUsers={followees} apiUrl={`/api/v1/users/${userId}/followees`} />
				</TabsContent>
				<TabsContent value="follower">
					<FollowCards initialUsers={followers} apiUrl={`/api/v1/users/${userId}/followers`} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
