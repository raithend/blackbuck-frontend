"use client";

import { Button } from "@/app/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/app/components/ui/dialog";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/app/components/ui/tabs";
import { signOut } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginForm } from "./login-form";
import { SignUpForm } from "./signup-form";

interface AuthDialogProps {
	isOpen: boolean;
	onClose: () => void;
	mode: "login" | "logout";
}

export function AuthDialog({ isOpen, onClose, mode }: AuthDialogProps) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleLogout = async () => {
		setIsLoading(true);
		try {
			await signOut();
			router.push("/login");
		} catch (error) {
			console.error("ログアウトエラー:", error);
		} finally {
			setIsLoading(false);
			onClose();
		}
	};

	if (mode === "login") {
		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>アカウント</DialogTitle>
						<DialogDescription>
							アカウントにログインするか、新規登録してください。
						</DialogDescription>
					</DialogHeader>
					<Tabs defaultValue="login" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="login">ログイン</TabsTrigger>
							<TabsTrigger value="signup">新規登録</TabsTrigger>
						</TabsList>
						<TabsContent value="login">
							<LoginForm />
						</TabsContent>
						<TabsContent value="signup">
							<SignUpForm />
						</TabsContent>
					</Tabs>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>ログアウト</DialogTitle>
					<DialogDescription>
						ログアウトしてもよろしいですか？
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={isLoading}>
						キャンセル
					</Button>
					<Button
						variant="destructive"
						onClick={handleLogout}
						disabled={isLoading}
					>
						{isLoading ? "ログアウト中..." : "ログアウト"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
