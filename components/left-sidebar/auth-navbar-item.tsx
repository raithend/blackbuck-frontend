'use client'

import { SignInDialog } from "@/components/auth/sign-in-dialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { NavbarItem } from "./navbar-item";
import { useUser } from "@/contexts/user-context";

export function AuthNavbarItem({
	label,
	url,
	icon: Icon,
}: { label: string; url: string; icon: React.ComponentType }) {
	const { user } = useUser();

	// セッションがない場合（未ログイン）はサインインダイアログを表示
	if (!user) {
		return (
			<Dialog>
				<DialogTrigger>
					<NavbarItem label={label} icon={Icon} url={url} isActive={false} />
				</DialogTrigger>
				<SignInDialog />
			</Dialog>
		);
	}

	// ログイン済みの場合は通常のリンクを表示
	return (
		<div>
			<NavbarItem label={label} icon={Icon} url={url} isActive={true} />
		</div>
	);
}
