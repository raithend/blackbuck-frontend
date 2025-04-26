"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">通知設定</h2>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>フォロー通知</Label>
            <p className="text-sm text-gray-500">
              フォローされたときに通知を受け取ります
            </p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>いいね通知</Label>
            <p className="text-sm text-gray-500">
              投稿にいいねされたときに通知を受け取ります
            </p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>コメント通知</Label>
            <p className="text-sm text-gray-500">
              投稿にコメントされたときに通知を受け取ります
            </p>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  );
} 