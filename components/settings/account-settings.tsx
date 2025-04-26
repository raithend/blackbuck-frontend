"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogoutButton } from "@/components/auth/logout-button";
import { ModeRadioGroup } from "@/components/settings/mode-radio-group";

export function AccountSettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">プロフィール情報</h2>
        <div className="space-y-2">
          <Label htmlFor="username">ユーザー名</Label>
          <Input id="username" placeholder="ユーザー名を入力" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">自己紹介</Label>
          <Textarea id="bio" placeholder="自己紹介を入力" />
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">表示</h2>
        <ModeRadioGroup />
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">ログアウト</h2>
        <LogoutButton />
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">アカウントの削除</h2>
        <p className="text-sm text-gray-500">
          アカウントを削除すると、すべてのデータが永久に削除されます。この操作は元に戻せません。
        </p>
        <Button variant="destructive">アカウントを削除</Button>
      </div>
    </div>
  );
} 