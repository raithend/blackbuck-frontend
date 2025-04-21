'use client'

import { SignInDialog } from "@/components/auth/sign-in-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { UserRound } from "lucide-react";
import Link from "next/link";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useEffect } from "react";

export function UseProfileItem() {
	const { session, user, loading, error } = useSupabaseAuth();

	// セッション状態をデバッグ用にコンソールに出力
	useEffect(() => {
		console.log('UseProfileItem: セッション状態', {
			hasSession: !!session,
			user: user ? {
				id: user.id,
				email: user.email,
				hasMetadata: !!user.user_metadata
			} : null,
			loading,
			error: error?.message
		});
	}, [session, user, loading, error]);

	// ローディング中は基本的なプロフィールアイコンを表示
	if (loading) {
		return (
			<div className="flex items-center p-2 md:p-6">
				<UserRound className="h-8 w-8" />
				<div className="hidden lg:block text-xl ml-4">プロフィール</div>
			</div>
		);
	}

	// ログインしていない場合はサインインダイアログを表示
	if (!session) {
		console.log('UseProfileItem: セッションなし、ログインダイアログを表示します');
		return (
			<Dialog>
				<DialogTrigger>
					<div className="flex items-center p-2 md:p-6 hover:bg-accent hover:text-accent-foreground">
						<UserRound className="h-8 w-8" />
						<div className="hidden lg:block text-xl ml-4">プロフィール</div>
					</div>
				</DialogTrigger>
				<SignInDialog />
			</Dialog>
		);
	}

	// ログインしている場合はプロフィールページへのリンクを表示
	console.log('UseProfileItem: セッションあり、プロフィールリンクを表示します', {
		userId: user?.id,
		userEmail: user?.email
	});
	
	return (
		<Link href="/profile">
			<div className="flex items-center m-2 p-0 rounded-full md:m-0 md:p-6 md:rounded-none hover:bg-accent hover:text-accent-foreground">
				<Avatar className="h-8 w-8">
					<AvatarImage src={user?.user_metadata?.avatar_url} />
					<AvatarFallback>
						<UserRound />
					</AvatarFallback>
				</Avatar>
				<div className="hidden lg:block text-xl ml-4">プロフィール</div>
			</div>
		</Link>
	);
}
