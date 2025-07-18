import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/app/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";
import Link from "next/link";

import { SearchBox } from "../search-box";

import { PostButton } from "@/app/components/post/post-button";

export function RightSidebar() {
	return (
		<div className="grid gap-2">
			<Card>
				<CardHeader>
					<CardTitle>Site description</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription>
						Blackbuck is a website for posting and sharing photos of animals.
					</CardDescription>
				</CardContent>
			</Card>

			<SearchBox />

			<div className="mt-8">
				<PostButton />
			</div>
		</div>
	);
}
