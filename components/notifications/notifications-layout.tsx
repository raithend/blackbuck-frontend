"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationList } from "./notification-list";

export function NotificationsLayout() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">通知</h1>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="follows">フォロー</TabsTrigger>
          <TabsTrigger value="likes">いいね</TabsTrigger>
          <TabsTrigger value="comments">コメント</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <NotificationList type="all" />
        </TabsContent>
        <TabsContent value="follows">
          <NotificationList type="follows" />
        </TabsContent>
        <TabsContent value="likes">
          <NotificationList type="likes" />
        </TabsContent>
        <TabsContent value="comments">
          <NotificationList type="comments" />
        </TabsContent>
      </Tabs>
    </div>
  );
} 