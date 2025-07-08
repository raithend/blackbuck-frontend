import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const supabase = await createClient();
    
    // paramsをawait
    const { accountId } = await params;
    
    // 対象ユーザーを取得
    const { data: targetUser, error: targetError } = await supabase
      .from("users")
      .select("id")
      .eq("account_id", accountId)
      .single();

    if (targetError || !targetUser) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // フォロー数を取得
    const { count: followingCount, error: followingError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", targetUser.id);

    if (followingError) {
      return NextResponse.json(
        { error: "フォロー数の取得に失敗しました" },
        { status: 500 }
      );
    }

    // フォロワー数を取得
    const { count: followerCount, error: followerError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", targetUser.id);

    if (followerError) {
      return NextResponse.json(
        { error: "フォロワー数の取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      following_count: followingCount || 0,
      follower_count: followerCount || 0,
    });
  } catch (error) {
    console.error("フォロー数取得エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
} 