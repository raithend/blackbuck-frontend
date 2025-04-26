import { NextResponse } from "next/server";
import { Post } from "@/types/post";

const dummyPosts: Post[] = [
  {
    id: "1",
    content: "今日は素晴らしい天気でした。",
    location: "東京都渋谷区",
    species: "イヌ",
    imageUrls: [
      "/blackbuck.jpg",
      "/blackbuck.jpg",
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5分前
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    liked: true,
    user: {
      id: "user1",
      username: "ユーザー1",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
    },
  },
  {
    id: "2",
    content: "新しいカメラで撮影してみました。",
    location: "神奈川県横浜市",
    species: "ネコ",
    imageUrls: [
      "/blackbuck.jpg",
      "/blackbuck.jpg",
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分前
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    liked: true,
    user: {
      id: "user2",
      username: "ユーザー2",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
    },
  },
  {
    id: "3",
    content: "散歩中に見つけた素敵な場所。",
    location: "大阪府大阪市",
    species: "ウサギ",
    imageUrls: [
      "/blackbuck.jpg",
      "/blackbuck.jpg",
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1時間前
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    liked: true,
    user: {
      id: "user3",
      username: "ユーザー3",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
    },
  },
];

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const params = await Promise.resolve(context.params);
  const userId = params.id;

  // 実際のAPIでは、userIdに基づいていいねした投稿を取得します
  // ここでは、すべての投稿を返します
  return NextResponse.json(dummyPosts);
} 