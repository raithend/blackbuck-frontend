import { NextResponse } from "next/server";

const dummyFollowers = [
  {
    id: "4",
    name: "田中次郎",
    username: "tanaka_jiro",
    avatarUrl: "https://github.com/shadcn.png",
    bio: "旅行が好きです"
  },
  {
    id: "5",
    name: "中村美咲",
    username: "nakamura_misaki",
    avatarUrl: "https://github.com/shadcn.png",
    bio: "料理を勉強中"
  },
  {
    id: "6",
    name: "小林健太",
    username: "kobayashi_kenta",
    avatarUrl: "https://github.com/shadcn.png",
    bio: "スポーツが趣味です"
  }
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(dummyFollowers);
} 