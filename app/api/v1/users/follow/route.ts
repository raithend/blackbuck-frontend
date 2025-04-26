import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // 実際のAPIでは、ここでデータベースにフォロー情報を保存します
    // 今回はダミーレスポンスを返します
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "フォローに失敗しました" },
      { status: 400 }
    );
  }
} 