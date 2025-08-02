import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { safeYamlParse } from "@/app/lib/yaml-utils";

// YAMLデータからname要素と分類名を抽出する関数
function extractNamesWithRoot(yamlContent: string, classificationName: string): Array<{name: string, classificationName: string}> {
	try {
		const parsed = safeYamlParse(yamlContent);
		if (!parsed) return [];

		const results: Array<{name: string, classificationName: string}> = [];

		// 再帰的にname要素を抽出する関数
		const extractNames = (node: any): void => {
			if (typeof node === 'object' && node !== null) {
				if (node.name && typeof node.name === 'string') {
					results.push({
						name: node.name,
						classificationName: classificationName
					});
				}
				if (node.children && Array.isArray(node.children)) {
					node.children.forEach(extractNames);
				}
			}
		};

		extractNames(parsed);
		return results;
	} catch (error) {
		console.error("YAML解析エラー:", error);
		return [];
	}
}

export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q");

		if (!query || query.trim() === "") {
			return NextResponse.json({ classifications: [] });
		}

		// postsテーブルから分類名を検索
		const { data: postClassifications, error: postError } = await supabase
			.from("posts")
			.select("classification")
			.not("classification", "is", null)
			.ilike("classification", `%${query}%`)
			.limit(10);

		if (postError) {
			console.error("投稿分類検索エラー:", postError);
			return NextResponse.json(
				{ error: "分類検索に失敗しました" },
				{ status: 500 },
			);
		}

		// classificationsテーブルから分類名を検索
		const { data: classificationData, error: classificationError } = await supabase
			.from("classifications")
			.select("name")
			.ilike("name", `%${query}%`)
			.limit(10);

		if (classificationError) {
			console.error("分類テーブル検索エラー:", classificationError);
			return NextResponse.json(
				{ error: "分類検索に失敗しました" },
				{ status: 500 },
			);
		}

		// phylogenetic_treesテーブルから系統樹のname要素を検索（classificationsテーブルとJOIN）
		const { data: phylogeneticData, error: phylogeneticError } = await supabase
			.from("phylogenetic_trees")
			.select(`
				content,
				classifications(name)
			`)
			.not("content", "is", null);

		if (phylogeneticError) {
			console.error("系統樹検索エラー:", phylogeneticError);
			return NextResponse.json(
				{ error: "分類検索に失敗しました" },
				{ status: 500 },
			);
		}

		// 系統樹のYAMLデータからname要素と分類名を抽出
		const phylogeneticResults: Array<{name: string, classificationName: string}> = [];
		phylogeneticData?.forEach((tree) => {
			if (tree.content && tree.classifications?.name) {
				const results = extractNamesWithRoot(tree.content, tree.classifications.name);
				phylogeneticResults.push(...results);
			}
		});

		// 抽出したname要素から検索クエリに一致するものをフィルタリング
		const matchingPhylogeneticResults = phylogeneticResults.filter(result =>
			result.name.toLowerCase().includes(query.toLowerCase())
		);

		// 検索結果の形式を統一
		const matchingPhylogeneticNames = matchingPhylogeneticResults.map(result => result.name);

		// 両方の結果を結合
		const postClassificationsList = postClassifications?.map((c) => c.classification).filter(Boolean) || [];
		const classificationNamesList = classificationData?.map((c) => c.name).filter(Boolean) || [];
		
		// 重複を除去してユニークな分類を取得
		const allClassifications = [...postClassificationsList, ...classificationNamesList, ...matchingPhylogeneticNames];
		const uniqueClassifications = Array.from(new Set(allClassifications)).slice(0, 10);

		// 関連項目の情報を整理
		const relatedItems: { [key: string]: string[] } = {};
		
		// 系統樹から抽出された分類名について、分類名を関連項目として追加
		matchingPhylogeneticResults.forEach(result => {
			if (result.classificationName && uniqueClassifications.includes(result.name)) {
				if (!relatedItems[result.name]) {
					relatedItems[result.name] = [];
				}
				relatedItems[result.name].push(result.classificationName);
			}
		});

		return NextResponse.json({ 
			classifications: uniqueClassifications,
			relatedItems: relatedItems
		});
	} catch (error) {
		console.error("分類検索エラー:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
