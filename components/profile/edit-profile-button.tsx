"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function EditProfileButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={() => router.push("/settings/profile")}
    >
      プロフィールを編集
    </Button>
  );
} 