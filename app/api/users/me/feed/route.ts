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

    // 現在のユーザー情報を取得
    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (currentUserError || !currentUser) {
      console.error("現在のユーザー取得エラー:", currentUserError);
      return NextResponse.json(
        { error: "ユーザー情報が見つかりません" },
        { status: 404 }
      );
    }

    // フォロー中のユーザーIDを取得
    const { data: followingData, error: followingError } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", currentUser.id);

    if (followingError) {
      console.error("フォロー情報取得エラー:", followingError);
      return NextResponse.json(
        { error: "フォロー情報の取得に失敗しました" },
        { status: 500 }
      );
    }

    const followingIds = followingData?.map(item => item.following_id) || [];
    
    // 自分のIDも含める
    const allUserIds = [currentUser.id, ...followingIds];

    console.log("フィード対象ユーザーID:", allUserIds);

    // フィードの投稿を取得（自分の投稿とフォロー中のユーザーの投稿）
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(`
        *,
        users (
          id,
          account_id,
          username,
          avatar_url,
          bio
        ),
        post_images (
          id,
          image_url,
          order_index
        )
      `)
      .in("user_id", allUserIds)
      .order("created_at", { ascending: false });

    if (postsError) {
      console.error("投稿取得エラー:", postsError);
      return NextResponse.json(
        { error: "投稿の取得に失敗しました" },
        { status: 500 }
      );
    }

    // 投稿データを整形
    const formattedPosts = posts?.map(post => ({
      ...post,
      user: post.users,
      post_images: post.post_images?.sort((a, b) => a.order_index - b.order_index) || []
    })) || [];

    console.log("フィード取得結果:", { count: formattedPosts.length });

    return NextResponse.json({
      posts: formattedPosts
    });
  } catch (error) {
    console.error("フィード取得エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
} 