import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ name: string }> }
) {
	try {
		const { name } = await params;
		const decodedName = decodeURIComponent(name);

		if (!decodedName) {
			return NextResponse.json(
				{ error: "Classification name is required" },
				{ status: 400 }
			);
		}

		const supabase = await createClient();

		// 分類が存在するかチェック
		const { data: classification, error: classificationError } = await supabase
			.from("classifications")
			.select("id")
			.eq("name", decodedName)
			.single();

		if (classificationError && classificationError.code !== "PGRST116") {
			throw classificationError;
		}

		// 分類が存在しない場合は空のデータを返す
		if (!classification) {
			return NextResponse.json({ 
				phylogeneticTree: null,
				classification: null
			});
		}

		// 系統樹データを取得
		const { data: phylogeneticTree, error: treeError } = await supabase
			.from("phylogenetic_trees")
			.select("*")
			.eq("classification_id", classification.id)
			.single();

		if (treeError && treeError.code !== "PGRST116") {
			throw treeError;
		}

		return NextResponse.json({ 
			phylogeneticTree: phylogeneticTree || null,
			classification: classification
		});
	} catch (error) {
		console.error("Phylogenetic tree API error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ name: string }> }
) {
	try {
		const { name } = await params;
		const decodedName = decodeURIComponent(name);
		const body = await request.json();

		if (!decodedName) {
			return NextResponse.json(
				{ error: "Classification name is required" },
				{ status: 400 }
			);
		}

		// Authorizationヘッダーからアクセストークンを取得
		const authHeader = request.headers.get("authorization");
		const accessToken = authHeader?.replace("Bearer ", "");

		if (!accessToken) {
			return NextResponse.json(
				{ error: "認証が必要です" },
				{ status: 401 }
			);
		}

		// アクセストークンを使ってSupabaseクライアントを作成
		const supabase = await createClient(accessToken);

		// ユーザー情報を取得
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json(
				{ error: "認証が必要です" },
				{ status: 401 }
			);
		}

		// 分類が存在するかチェック
		const { data: classification, error: classificationError } = await supabase
			.from("classifications")
			.select("id")
			.eq("name", decodedName)
			.single();

		let classificationId: string;

		if (classificationError && classificationError.code === "PGRST116") {
			// 分類が存在しない場合は作成
			const { data: newClassification, error: createError } = await supabase
				.from("classifications")
				.insert({
					name: decodedName,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				})
				.select("id")
				.single();

			if (createError) {
				throw createError;
			}

			classificationId = newClassification.id;
		} else if (classificationError) {
			throw classificationError;
		} else {
			classificationId = classification.id;
		}

		// 既存の系統樹データをチェック
		const { data: existingTree, error: treeCheckError } = await supabase
			.from("phylogenetic_trees")
			.select("id")
			.eq("classification_id", classificationId)
			.single();

		let phylogeneticTree: unknown;
		let operationError: unknown;

		if (treeCheckError && treeCheckError.code === "PGRST116") {
			// 系統樹データが存在しない場合は作成
			const { data: newTree, error: createTreeError } = await supabase
				.from("phylogenetic_trees")
				.insert({
					classification_id: classificationId,
					content: body.content || "",
					creator: user.id,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				})
				.select()
				.single();

			phylogeneticTree = newTree;
			operationError = createTreeError;
		} else if (treeCheckError) {
			throw treeCheckError;
		} else {
			// 系統樹データが存在する場合は更新
			const { data: updatedTree, error: updateTreeError } = await supabase
				.from("phylogenetic_trees")
				.update({
					content: body.content,
					creator: user.id,
					updated_at: new Date().toISOString(),
				})
				.eq("classification_id", classificationId)
				.select()
				.single();

			phylogeneticTree = updatedTree;
			operationError = updateTreeError;
		}

		if (operationError) {
			console.error("Phylogenetic tree operation error:", operationError);
			return NextResponse.json(
				{ error: "Failed to save phylogenetic tree" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ phylogeneticTree });
	} catch (error) {
		console.error("Phylogenetic tree API error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
} 