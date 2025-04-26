import { NextResponse } from "next/server";

const dummyFollowees = [
  {
    id: "1",
    name: "山田太郎",
    username: "yamada_taro",
    avatarUrl: "https://github.com/shadcn.png",
    bio: "プログラミングが好きです"
  },
  {
    id: "2",
    name: "佐藤花子",
    username: "sato_hanako",
    avatarUrl: "https://github.com/shadcn.png",
    bio: "デザインを勉強中"
  },
  {
    id: "3",
    name: "鈴木一郎",
    username: "suzuki_ichiro",
    avatarUrl: "https://github.com/shadcn.png",
    bio: "写真撮影が趣味です"
  }
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(dummyFollowees);
} 