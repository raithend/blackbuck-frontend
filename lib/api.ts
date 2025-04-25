import { Profile } from "@/contexts/profile-context";

export async function getProfile(): Promise<Profile> {
  const response = await fetch("/api/profile");
  if (!response.ok) {
    throw new Error("プロフィール情報の取得に失敗しました");
  }
  return response.json();
} 