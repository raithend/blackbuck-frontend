"use client";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/app/components/ui/tabs";
import { useEffect, useState } from "react";
import { AccountSettings } from "./account-settings";
import { HelpSupport } from "./help-support";
import { SecuritySettings } from "./security-settings";

export function SettingsLayout() {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		return (
			<div className="container mx-auto px-4 py-8 w-full space-y-6">
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">設定</h2>
					<div className="h-10 w-full animate-pulse rounded-md bg-muted" />
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<Tabs defaultValue="account" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="account">アカウント</TabsTrigger>
					<TabsTrigger value="security">セキュリティ</TabsTrigger>
					<TabsTrigger value="help">ヘルプ</TabsTrigger>
				</TabsList>
				<TabsContent value="account">
					<AccountSettings />
				</TabsContent>
				<TabsContent value="security">
					<SecuritySettings />
				</TabsContent>
				<TabsContent value="help">
					<HelpSupport />
				</TabsContent>
			</Tabs>
		</div>
	);
}
