import type { Post } from "@/types/post";
import { NextResponse } from "next/server";

const dummyPosts: Post[] = [
	{
		id: "1",
		content: "今日は素晴らしい天気でした。",
		location: "東京都渋谷区",
		species: "イヌ",
		image_urls: ["/blackbuck.jpg", "/blackbuck.jpg"],
		created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5分前
		updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
		liked: false,
		user: {
			id: "user1",
			username: "ユーザー1",
			avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
		},
	},
	{
		id: "2",
		content: "新しいカメラで撮影してみました。",
		location: "神奈川県横浜市",
		species: "ネコ",
		image_urls: ["/blackbuck.jpg", "/blackbuck.jpg"],
		created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分前
		updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
		liked: true,
		user: {
			id: "user2",
			username: "ユーザー2",
			avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
		},
	},
	{
		id: "3",
		content: "散歩中に見つけた素敵な場所。",
		location: "大阪府大阪市",
		species: "ウサギ",
		image_urls: ["/blackbuck.jpg", "/blackbuck.jpg"],
		created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1時間前
		updated_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
		liked: false,
		user: {
			id: "user3",
			username: "ユーザー3",
			avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
		},
	},
];

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");

	let filteredPosts = dummyPosts;

	if (userId) {
		filteredPosts = dummyPosts.filter((post) => post.user.id === userId);
	}

	return NextResponse.json(filteredPosts);
}
