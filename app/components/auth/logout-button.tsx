"use client";

import { Button } from "@/app/components/ui/button";
import { createClient } from "@/app/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface LogoutButtonProps {
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	size?: "default" | "sm" | "lg" | "icon";
}

const signOut = async () => {
	const supabase = createClient();
	const { error } = await supabase.auth.signOut();
	if (error) {
		throw error;
	}
};

export function LogoutButton({
	variant = "default",
	size = "default",
}: LogoutButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleLogout = async () => {
		setIsLoading(true);
		try {
			await signOut();
			// SWRの自動更新に任せるため、手動でrefreshUserを呼び出す必要はない
			router.push("/login");
			toast.success("ログアウトしました");
		} catch (error) {
			console.error("ログアウトエラー:", error);
			toast.error("ログアウトに失敗しました");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			variant={variant}
			size={size}
			onClick={handleLogout}
			disabled={isLoading}
		>
			{isLoading ? "ログアウト中..." : "ログアウト"}
		</Button>
	);
}
