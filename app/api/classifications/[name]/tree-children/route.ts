import { createClient } from "@/app/lib/supabase-server";
import { NextResponse } from "next/server";
import { safeYamlParse, findRelatedClassifications } from "@/app/lib/yaml-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);

    if (!decodedName) {
      return NextResponse.json(
        { error: "分類名が必要です" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. 指定された分類名を含む系統樹データを検索
    const { data: phylogeneticTrees, error: searchError } = await supabase
      .from("phylogenetic_trees")
      .select("id, content, classification_id")
      .ilike("content", `%${decodedName}%`);

    if (searchError) {
      console.error("系統樹データ検索エラー:", searchError);
      return NextResponse.json(
        { error: "系統樹データの検索に失敗しました" },
        { status: 500 }
      );
    }

    if (!phylogeneticTrees || phylogeneticTrees.length === 0) {
      return NextResponse.json({
        children: [],
        message: `「${decodedName}」を含む系統樹データが見つかりませんでした`
      });
    }

    console.log(`「${decodedName}」を含む系統樹データの数:`, phylogeneticTrees.length);

    // 2. 各系統樹データを解析してchildren要素を取得
    const allChildren: string[] = [];
    const processedTrees: Array<{
      treeId: string;
      classificationId: string | null;
      children: string[];
      treeName?: string;
    }> = [];

    for (const tree of phylogeneticTrees) {
      try {
        // YAMLデータを解析
        const treeData = safeYamlParse(tree.content);
        if (!treeData) {
          console.warn(`系統樹データの解析に失敗: ${tree.id}`);
          continue;
        }

        // 指定された分類名のchildren要素を取得
        const children = findRelatedClassifications(treeData, decodedName);
        
        if (children.length > 0) {
          // 系統樹のルート名を取得
          const treeName = typeof treeData === 'object' && treeData !== null && 'name' in treeData 
            ? (treeData as { name: string }).name 
            : '不明';

          processedTrees.push({
            treeId: tree.id,
            classificationId: tree.classification_id,
            children,
            treeName
          });

          // 重複を除いてchildrenを追加
          for (const child of children) {
            if (!allChildren.includes(child)) {
              allChildren.push(child);
            }
          }

          console.log(`系統樹 "${treeName}" (ID: ${tree.id}) から取得したchildren:`, children);
        }
      } catch (error) {
        console.error(`系統樹データの処理エラー (ID: ${tree.id}):`, error);
      }
    }

    return NextResponse.json({
      children: allChildren,
      processedTrees,
      message: `「${decodedName}」のchildren要素を${allChildren.length}個取得しました`,
      totalTrees: phylogeneticTrees.length,
      treesWithChildren: processedTrees.length
    });

  } catch (error) {
    console.error("Tree children API error:", error);
    return NextResponse.json(
      { error: "内部サーバーエラー" },
      { status: 500 }
    );
  }
} 