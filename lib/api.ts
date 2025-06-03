export async function getProfile() {
  const response = await fetch("/api/v1/users/[id]", {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error("プロフィール情報の取得に失敗しました");
  }
  return response.json();
}

// 共通のフェッチャー関数
export const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("APIがJSONを返していません");
  }

  return response.json();
}; 