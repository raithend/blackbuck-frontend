"use client";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { LogoutButton } from "@/app/components/auth/logout-button";
import { ModeRadioGroup } from "@/app/components/settings/mode-radio-group";

export function AccountSettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">プロフィール情報</h2>
        <div className="space-y-2">
          <Label htmlFor="name">ユーザー名</Label>
          <Input id="name" placeholder="ユーザー名を入力" />
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