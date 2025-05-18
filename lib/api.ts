

export async function getProfile() {
  const response = await fetch("/api/v1/users/[id]");
  if (!response.ok) {
    throw new Error("プロフィール情報の取得に失敗しました");
  }
  return response.json();
} 