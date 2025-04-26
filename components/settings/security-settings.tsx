"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">パスワードの変更</h2>
        <div className="space-y-2">
          <Label htmlFor="current-password">現在のパスワード</Label>
          <Input id="current-password" type="password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password">新しいパスワード</Label>
          <Input id="new-password" type="password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">新しいパスワード（確認）</Label>
          <Input id="confirm-password" type="password" />
        </div>
        <Button>パスワードを変更</Button>
      </div>
    </div>
  );
} 