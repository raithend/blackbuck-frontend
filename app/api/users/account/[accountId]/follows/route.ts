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
    
    // URLからクエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'following' または 'followers'
    
    if (!type || (type !== 'following' && type !== 'followers')) {
      return NextResponse.json(
        { error: "typeパラメータは 'following' または 'followers' である必要があります" },
        { status: 400 }
      );
    }

    // 対象ユーザーを取得
    const { data: targetUser, error: targetError } = await supabase
      .from("users")
      .select("id")
      .eq("account_id", accountId)
      .single();

    if (targetError || !targetUser) {
      console.error("対象ユーザー取得エラー:", targetError);
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    let users: any[] = [];

    if (type === 'following') {
      // フォロー中のユーザーを取得
      const { data: followingData, error: followingError } = await supabase
        .from("follows")
        .select(`
          following_id,
          users!follows_following_id_fkey (
            id,
            account_id,
            username,
            avatar_url,
            bio
          )
        `)
        .eq("follower_id", targetUser.id);

      if (followingError) {
        console.error("フォロー中ユーザー取得エラー:", followingError);
        return NextResponse.json(
          { error: "フォロー中のユーザー取得に失敗しました" },
          { status: 500 }
        );
      }

      users = followingData?.map(item => item.users).filter(Boolean) || [];
    } else {
      // フォロワーを取得
      const { data: followersData, error: followersError } = await supabase
        .from("follows")
        .select(`
          follower_id,
          users!follows_follower_id_fkey (
            id,
            account_id,
            username,
            avatar_url,
            bio
          )
        `)
        .eq("following_id", targetUser.id);

      if (followersError) {
        console.error("フォロワー取得エラー:", followersError);
        return NextResponse.json(
          { error: "フォロワー取得に失敗しました" },
          { status: 500 }
        );
      }

      users = followersData?.map(item => item.users).filter(Boolean) || [];
    }

    // 結果を返す
    return NextResponse.json({ users, type });
  } catch (error) {
    console.error("フォロー/フォロワー取得エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
} 