'use client'

import { SignInDialog } from "@/components/auth/sign-in-dialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { NavbarItem } from "./navbar-item";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";

export function UseNavbarItem({
	label,
	url,
	icon: Icon,
}: { label: string; url: string; icon: LucideIcon }) {
	const { session, loading } = useSupabaseAuth();

	// ローディング中は何も表示しない
	if (loading) {
		return <NavbarItem label={label} icon={Icon} />;
	}

	// セッションがない場合（未ログイン）はサインインダイアログを表示
	if (!session) {
		return (
			<Dialog>
				<DialogTrigger>
					<NavbarItem label={label} icon={Icon} />
				</DialogTrigger>
				<SignInDialog />
			</Dialog>
		);
	}

	// ログイン済みの場合は通常のリンクを表示
	return (
		<Link href={url}>
			<NavbarItem label={label} icon={Icon} />
		</Link>
	);
}
