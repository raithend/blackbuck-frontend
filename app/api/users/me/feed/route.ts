import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 認証トークンの取得
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // トークンの検証
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error("認証エラー:", authError);
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // フォロー中のユーザーIDを取得
    const { data: followingData, error: followingError } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    if (followingError) {
      console.error("フォロー中ユーザー取得エラー:", followingError);
      return NextResponse.json(
        { error: "フォロー中ユーザーの取得に失敗しました" },
        { status: 500 }
      );
    }

    // 自分自身とフォロー中のユーザーIDを結合
    const followingIds = followingData?.map(f => f.following_id) || [];
    const allUserIds = [user.id, ...followingIds];

    // 投稿を取得（自分自身とフォロー中のユーザーの投稿）
    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        location,
        created_at,
        user_id,
        users!posts_user_id_fkey (
          id,
          account_id,
          username,
          avatar_url
        )
      `)
      .in("user_id", allUserIds)
      .order("created_at", { ascending: false })
      .limit(50);

    if (postsError) {
      console.error("投稿取得エラー:", postsError);
      return NextResponse.json(
        { error: "投稿の取得に失敗しました" },
        { status: 500 }
      );
    }

    // 投稿データを整形
    const formattedPosts = postsData?.map(post => ({
      id: post.id,
      content: post.content,
      locationName: post.location,
      createdAt: post.created_at,
      user: {
        id: post.users.id,
        accountId: post.users.account_id,
        username: post.users.username,
        avatarUrl: post.users.avatar_url,
      },
    })) || [];

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error("フィード取得エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
} 