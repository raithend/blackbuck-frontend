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
        classification,
        created_at,
        updated_at,
        user_id,
        users!posts_user_id_fkey (
          id,
          account_id,
          username,
          avatar_url
        ),
        post_images (
          id,
          image_url
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

    // 各投稿のいいね数を取得
    const postIds = postsData?.map(post => post.id) || [];
    const { data: likeCounts, error: likeCountsError } = await supabase
      .from("likes")
      .select("post_id")
      .in("post_id", postIds);

    if (likeCountsError) {
      console.error("いいね数取得エラー:", likeCountsError);
    }

    // いいね数を集計
    const likeCountMap = new Map<string, number>();
    likeCounts?.forEach(like => {
      const count = likeCountMap.get(like.post_id) || 0;
      likeCountMap.set(like.post_id, count + 1);
    });

    // ユーザーがいいねした投稿を取得
    const { data: userLikes, error: userLikesError } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", user.id);

    if (userLikesError) {
      console.error("ユーザーいいね取得エラー:", userLikesError);
    }

    const userLikedPostIds = userLikes?.map(like => like.post_id) || [];

    // 投稿データを整形
    const formattedPosts = postsData?.map(post => ({
      id: post.id,
      content: post.content,
      location: post.location,
      classification: post.classification,
      created_at: post.created_at,
      updated_at: post.updated_at,
      likeCount: likeCountMap.get(post.id) || 0,
      isLiked: userLikedPostIds.includes(post.id),
      user: {
        id: post.users.id,
        account_id: post.users.account_id,
        username: post.users.username,
        avatar_url: post.users.avatar_url,
      },
      post_images: post.post_images || [],
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