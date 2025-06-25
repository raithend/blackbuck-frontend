import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
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
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // paramsをawait
    const { accountId } = await params;

    // フォロー対象のユーザーを取得
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

    // 自分自身をフォローできないようにする
    if (user.id === targetUser.id) {
      return NextResponse.json(
        { error: "自分自身をフォローすることはできません" },
        { status: 400 }
      );
    }

    // 現在のユーザー情報を取得
    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (currentUserError || !currentUser) {
      return NextResponse.json(
        { error: "ユーザー情報が見つかりません" },
        { status: 404 }
      );
    }

    // フォロー関係を作成
    const { error: followError } = await supabase
      .from("follows")
      .insert({
        follower_id: currentUser.id,
        following_id: targetUser.id,
      });

    if (followError) {
      // 既にフォローしている場合はエラー
      if (followError.code === "23505") {
        return NextResponse.json(
          { error: "既にフォローしています" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "フォローに失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "フォローしました" },
      { status: 201 }
    );
  } catch (error) {
    console.error("フォローエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
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
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // paramsをawait
    const { accountId } = await params;

    // フォロー対象のユーザーを取得
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

    // 現在のユーザー情報を取得
    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (currentUserError || !currentUser) {
      return NextResponse.json(
        { error: "ユーザー情報が見つかりません" },
        { status: 404 }
      );
    }

    // フォロー関係を削除
    const { error: unfollowError } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", currentUser.id)
      .eq("following_id", targetUser.id);

    if (unfollowError) {
      return NextResponse.json(
        { error: "アンフォローに失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "アンフォローしました" },
      { status: 200 }
    );
  } catch (error) {
    console.error("アンフォローエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
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
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // paramsをawait
    const { accountId } = await params;

    // フォロー対象のユーザーを取得
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

    // 現在のユーザー情報を取得
    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (currentUserError || !currentUser) {
      return NextResponse.json(
        { error: "ユーザー情報が見つかりません" },
        { status: 404 }
      );
    }

    // フォロー状態を確認
    const { data: followStatus, error: followStatusError } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", targetUser.id)
      .single();

    if (followStatusError && followStatusError.code !== "PGRST116") {
      return NextResponse.json(
        { error: "フォロー状態の確認に失敗しました" },
        { status: 500 }
      );
    }

    const isFollowing = !!followStatus;

    return NextResponse.json(
      { isFollowing },
      { status: 200 }
    );
  } catch (error) {
    console.error("フォロー状態確認エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
} 