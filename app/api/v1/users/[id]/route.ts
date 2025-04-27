import { NextResponse } from "next/server";

const dummyProfile = {
  id: "dummy",
  username: "dummy_user",
  avatar_url: "https://github.com/raithend.png",
  header_url: "https://picsum.photos/800/200",
  bio: "これはダミーのプロフィールです。バックエンドAPIが完成するまでの仮のデータです。",
  posts: [
    {
      id: "1",
      content: "これはダミーの投稿です。",
      image_urls: ["/blackbuck.jpg", "/blackbuck.jpg"],
      created_at: "2023-01-01",
      updated_at: "2023-01-01",
      liked: false,
      user: {
        id: "dummy",
        username: "dummy_user",
        avatar_url: "https://picsum.photos/200/300",
      },
    },
    {
      id: "2",
      content: "これはダミーの投稿です。",
      image_urls: ["/blackbuck.jpg", "/blackbuck.jpg"],
      created_at: "2023-01-01",
      updated_at: "2023-01-01",
      liked: false,
      user: {
        id: "dummy",
        username: "dummy_user",
        avatar_url: "https://picsum.photos/200/300",        
      },
      
    },
    
  ],
  followers: [],
  followees: [],
  likes: [],
};

export async function GET() {
  // 実際のAPIでは、ここでデータベースからプロフィール情報を取得します
  return NextResponse.json(dummyProfile);
} 