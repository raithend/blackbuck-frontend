import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { safeYamlParse } from "@/app/lib/yaml-utils";

export async function GET() {
	try {
		// 系統樹データファイルのパス
		const treeDataPath = path.join(process.cwd(), "app", "data", "tree-data.yml");
		
		// ファイルを読み込み
		const treeDataContent = fs.readFileSync(treeDataPath, "utf-8");
		
		// YAMLを解析
		const treeData = safeYamlParse(treeDataContent);
		
		if (!treeData) {
			return NextResponse.json(
				{ error: "系統樹データの解析に失敗しました" },
				{ status: 500 }
			);
		}
		
		return NextResponse.json(treeData);
		
	} catch (error) {
		console.error("系統樹データ取得エラー:", error);
		return NextResponse.json(
			{ error: "系統樹データの取得に失敗しました" },
			{ status: 500 }
		);
	}
} 