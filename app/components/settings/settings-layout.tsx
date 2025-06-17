"use client";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/app/components/ui/tabs";
import { AccountSettings } from "./account-settings";
import { HelpSupport } from "./help-support";
import { SecuritySettings } from "./security-settings";

export function SettingsLayout() {
	return (
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
	);
}
