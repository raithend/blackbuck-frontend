import { createClient } from "@/app/lib/supabase-server";
import { safeYamlParse, collectAllChildrenNamesWithLinkedTree } from "@/app/lib/yaml-utils";
import type { Database } from "@/app/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

interface PostImage {
  id: string;
  image_url: string;
  order_index: number;
}

interface PostUser {
  id: string;
  username: string;
  avatar_url: string | null;
  account_id: string | null;
  bio: string | null;
  created_at: string;
  header_url: string | null;
  updated_at: string;
}

interface Post {
  id: string;
  classification: string | null;
  content: string;
  created_at: string;
  event: string | null;
  location: string | null;
  updated_at: string;
  user_id: string;
  users: PostUser;
  post_images: PostImage[];
  likes: { id: string }[];
}

interface FormattedPost {
  id: string;
  classification: string | null;
  content: string;
  created_at: string;
  event: string | null;
  location: string | null;
  updated_at: string;
  user_id: string;
  user: PostUser;
  likeCount: number;
  isLiked: boolean;
  images: PostImage[];
}

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
}

async function fetchBatch(
  supabase: SupabaseClient<Database>,
  classifications: string[],
  userLikes: string[],
): Promise<FormattedPost[]> {
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `*,
       users!posts_user_id_fkey (
         id, username, avatar_url, account_id, bio, created_at, header_url, updated_at
       ),
       post_images ( id, image_url, order_index ),
       likes ( id )
      `,
    )
    .in("classification", classifications)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const formatted: FormattedPost[] =
    posts?.map((post: Post) => ({
      ...post,
      user: post.users,
      likeCount: post.likes?.length || 0,
      isLiked: userLikes.includes(post.id),
      images:
        post.post_images?.sort(
          (a: PostImage, b: PostImage) => a.order_index - b.order_index,
        ) || [],
    })) || [];

  return formatted;
}

export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  const url = new URL(request.url);
  const accessToken = url.searchParams.get("access_token") || undefined;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const enqueue = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sseEvent(event, data)));
      };

      try {
        if (!decodedName) {
          enqueue("error", { message: "分類名が必要です" });
          controller.close();
          return;
        }

        // 認証あり/なしでクライアント作成（EventSourceはヘッダー不可のためクエリのaccess_token対応）
        const supabase: SupabaseClient<Database> = await createClient(accessToken);

        // 認証ユーザーのいいね状態
        let userLikes: string[] = [];
        if (accessToken) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const { data: likes } = await supabase
              .from("likes")
              .select("post_id")
              .eq("user_id", user.id);
            userLikes = likes?.map((l) => l.post_id) || [];
          }
        }

        // フェーズ1: 完全一致（バッチ1として即送信）
        try {
          const phase1Posts = await fetchBatch(supabase, [decodedName], userLikes);
          console.log("SSE Phase 1 fetched:", { count: phase1Posts.length });
          if (phase1Posts.length > 0) {
            enqueue("batch", { phase: "Phase 1", batchNumber: 1, posts: phase1Posts });
          }
        } catch (e) {
          enqueue("warn", { phase: "Phase 1", message: "取得失敗", error: String(e) });
        }

        // フェーズ2: 分類ページに紐づく系統樹の子要素を収集し、バッチ毎に送信
        let children: string[] = [];
        try {
          const { data: classification } = await supabase
            .from("classifications")
            .select("id")
            .eq("name", decodedName)
            .single();

          if (classification) {
            const { data: tree } = await supabase
              .from("phylogenetic_trees")
              .select("content")
              .eq("classification_id", classification.id)
              .single();

            const treeData = tree?.content ? safeYamlParse(tree.content) : null;
            if (treeData) {
              children = await collectAllChildrenNamesWithLinkedTree(treeData, supabase);
            }
          }
        } catch (e) {
          // フェーズ2の前処理失敗は警告のみ
          enqueue("warn", { phase: "Phase 2", message: "前処理失敗", error: String(e) });
        }

        if (children.length > 0) {
          const BATCH_SIZE = 50;
          let batchIndex = 0;
          for (let i = 0; i < children.length; i += BATCH_SIZE) {
            batchIndex += 1;
            const slice = children.slice(i, i + BATCH_SIZE);
            try {
              const formatted = await fetchBatch(supabase, slice, userLikes);
              console.log("SSE Phase 2 fetched:", { batchNumber: batchIndex, children: slice.length, posts: formatted.length });
              if (formatted.length > 0) {
                enqueue("batch", { phase: "Phase 2", batchNumber: batchIndex, posts: formatted });
              }
            } catch (e) {
              enqueue("warn", { phase: "Phase 2", batchNumber: batchIndex, message: "取得失敗", error: String(e) });
            }
          }
        } else {
          // フェーズ3: データベースの系統樹から関連分類名を探索
          try {
            const { data: phylogeneticTrees } = await supabase
              .from("phylogenetic_trees")
              .select("id, content, classification_id")
              .ilike("content", `%${decodedName}%`);

            if (phylogeneticTrees && phylogeneticTrees.length > 0) {
              const allChildrenSet = new Set<string>();
              for (const tree of phylogeneticTrees) {
                try {
                  const treeData = tree?.content ? safeYamlParse(tree.content) : null;
                  if (!treeData) continue;
                  const names = await collectAllChildrenNamesWithLinkedTree(treeData, supabase);
                  for (const n of names) if (n && n !== decodedName) allChildrenSet.add(n);
                } catch (err) {
                  enqueue("warn", { phase: "Phase 3", message: `ツリー解析失敗 (${tree.id})`, error: String(err) });
                }
              }

              const allChildren = Array.from(allChildrenSet);
              if (allChildren.length > 0) {
                const BATCH_SIZE = 50;
                let batchIndex = 0;
                for (let i = 0; i < allChildren.length; i += BATCH_SIZE) {
                  batchIndex += 1;
                  const slice = allChildren.slice(i, i + BATCH_SIZE);
                  try {
                    const formatted = await fetchBatch(supabase, slice, userLikes);
                    console.log("SSE Phase 3 fetched:", { batchNumber: batchIndex, children: slice.length, posts: formatted.length });
                    if (formatted.length > 0) {
                      enqueue("batch", { phase: "Phase 3", batchNumber: batchIndex, posts: formatted });
                    }
                  } catch (e) {
                    enqueue("warn", { phase: "Phase 3", batchNumber: batchIndex, message: "取得失敗", error: String(e) });
                  }
                }
              }
            }
          } catch (e) {
            enqueue("warn", { phase: "Phase 3", message: "前処理失敗", error: String(e) });
          }
        }

        // ストリーム終了
        enqueue("end", { done: true });
        controller.close();
      } catch (err) {
        try {
          controller.enqueue(new TextEncoder().encode(sseEvent("error", { message: String(err) })));
        } finally {
          controller.close();
        }
      }
    },
    cancel() {
      // クライアント切断時
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}


