"use client";

import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FollowCards } from "@/components/follow/follow-cards";

export default function Page() {
	const params = useParams();
	const userId = params.id as string;

	return (
		<div>
			<Tabs defaultValue="followee">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="followee">フォロー中</TabsTrigger>
					<TabsTrigger value="follower">フォロワー</TabsTrigger>
				</TabsList>
				<TabsContent value="followee">
					<FollowCards apiUrl={`/api/v1/users/${userId}/followees`} />
				</TabsContent>
				<TabsContent value="follower">
					<FollowCards apiUrl={`/api/v1/users/${userId}/followers`} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
