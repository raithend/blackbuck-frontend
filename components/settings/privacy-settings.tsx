"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function PrivacySettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">プライバシー設定</h2>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>プロフィールの公開設定</Label>
            <p className="text-sm text-gray-500">
              プロフィールを公開するかどうかを設定します
            </p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>投稿の公開設定</Label>
            <p className="text-sm text-gray-500">
              投稿を公開するかどうかを設定します
            </p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>フォロワーの表示設定</Label>
            <p className="text-sm text-gray-500">
              フォロワーを表示するかどうかを設定します
            </p>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  );
} 