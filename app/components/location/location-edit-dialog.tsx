"use client";

import { Button } from "@/app/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import type { Location } from "@/app/types/types";
import { useState } from "react";

interface LocationEditDialogProps {
  location?: Location;
  onSave: (data: { name: string; description?: string; header_url?: string }) => Promise<void>;
}

export function LocationEditDialog({ location, onSave }: LocationEditDialogProps) {
  const [name, setName] = useState(location?.name || "");
  const [description, setDescription] = useState(location?.description || "");
  const [headerUrl, setHeaderUrl] = useState(location?.header_url || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSave({ name, description: description || undefined, header_url: headerUrl || undefined });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{location ? "場所を編集" : "新しい場所を追加"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">場所名 *</label>
          <Input placeholder="例: 東京" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-medium">説明</label>
          <Textarea placeholder="場所の説明を入力してください" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <div>
          <label className="text-sm font-medium">ヘッダー画像URL</label>
          <Input placeholder="https://example.com/header.jpg" value={headerUrl} onChange={(e) => setHeaderUrl(e.target.value)} type="url" />
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()} className="w-full">
          {isSubmitting ? "保存中..." : "保存"}
        </Button>
      </div>
    </DialogContent>
  );
}


