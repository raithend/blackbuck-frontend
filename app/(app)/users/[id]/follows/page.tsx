"use client";

import { FollowCards } from "@/components/follow/follow-cards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FollowsPage() {

	const { data: followees, error: followeesError } = useSWR(
		`/api/v1/users/[id]/followees`,
		fetcher,
	);

	const { data: followers, error: followersError } = useSWR(
		`/api/v1/users/[id]/followers`,
		fetcher,
	);

	if (followeesError || followersError) {
		return <div>エラーが発生しました</div>;
	}

	if (!followees || !followers) {
		return <div>読み込み中...</div>;
	}

	return (
		<div>
			<Tabs defaultValue="followee">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="followee">フォロー中</TabsTrigger>
					<TabsTrigger value="follower">フォロワー</TabsTrigger>
				</TabsList>
				<TabsContent value="followee">
					<FollowCards
						initialUsers={followees}
						apiUrl={`/api/v1/users/[id]/followees`}
					/>
				</TabsContent>
				<TabsContent value="follower">
					<FollowCards
						initialUsers={followers}
						apiUrl={`/api/v1/users/[id]/followers`}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
