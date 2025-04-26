"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "./account-settings";
import { PrivacySettings } from "./privacy-settings";
import { NotificationSettings } from "./notification-settings";
import { SecuritySettings } from "./security-settings";
import { HelpSupport } from "./help-support";

export function SettingsLayout() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">設定</h1>
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account">アカウント</TabsTrigger>
          <TabsTrigger value="privacy">プライバシー</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
          <TabsTrigger value="security">セキュリティ</TabsTrigger>
          <TabsTrigger value="help">ヘルプ</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <AccountSettings />
        </TabsContent>
        <TabsContent value="privacy">
          <PrivacySettings />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationSettings />
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