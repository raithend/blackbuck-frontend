"use client";

import { UserAuthButton } from "@/app/components/auth/user-auth-button";
import { PostButton } from "@/app/components/post/post-button";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

export function Header() {
	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-14 items-center">
				<div className="mr-4 flex">
					<Link href="/" className="mr-6 flex items-center space-x-2">
						<span className="font-bold">BlackBuck</span>
					</Link>
				</div>
				<PostButton />
				<div className="flex flex-1 items-center justify-end space-x-4">
					<nav className="flex items-center space-x-2">
						<UserAuthButton />
					</nav>
				</div>
			</div>
		</header>
	);
}
