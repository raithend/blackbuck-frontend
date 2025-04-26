import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // 実際のAPIでは、ここでデータベースからフォロー情報を削除します
    // 今回はダミーレスポンスを返します
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "フォロー解除に失敗しました" },
      { status: 400 }
    );
  }
} 