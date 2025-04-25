import { NextResponse } from "next/server";

const dummyProfile = {
  id: "dummy",
  username: "dummy_user",
  avatar_url: "https://github.com/raithend.png",
  header_url: "https://picsum.photos/800/200",
  bio: "これはダミーのプロフィールです。バックエンドAPIが完成するまでの仮のデータです。"
};

export async function GET() {
  // 実際のAPIでは、ここでデータベースからプロフィール情報を取得します
  return NextResponse.json(dummyProfile);
} 