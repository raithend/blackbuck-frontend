import yaml from "js-yaml";

// YAMLの前処理：無効な行や文字を除去
export function preprocessYaml(content: string): string {
	if (!content) return "";

	const lines = content.split("\n");
	const processedLines: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// 空行は保持
		if (line.trim() === "") {
			processedLines.push(line);
			continue;
		}

		// コメント行は保持
		if (line.trim().startsWith("#")) {
			processedLines.push(line);
			continue;
		}

		// インデントを計算
		const indent = line.match(/^\s*/)?.[0] || "";
		const content = line.trim();

		// 有効なYAML構造かチェック
		if (isValidYamlLine(content)) {
			processedLines.push(line);
		} else {
			// 無効な行は空行に置換（インデントは保持）
			processedLines.push(indent);
		}
	}

	return processedLines.join("\n");
}

// 行が有効なYAML構造かチェック
function isValidYamlLine(content: string): boolean {
	// 空文字列は有効
	if (content === "") return true;

	// 基本的なYAMLパターンをチェック
	const validPatterns = [
		// キー: 値 の形式
		/^[a-zA-Z_][a-zA-Z0-9_]*\s*:\s*.*$/,
		// 配列要素
		/^-\s*.*$/,
		// 空の配列要素
		/^-\s*$/,
		// 空のオブジェクト
		/^[a-zA-Z_][a-zA-Z0-9_]*\s*:\s*$/,
		// コメント
		/^#.*$/,
		// 数値
		/^-?\d+(\.\d+)?$/,
		// 文字列（クォートあり）
		/^['"`].*['"`]$/,
		// 文字列（クォートなし、特殊文字なし）
		/^[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]+$/,
	];

	return validPatterns.some((pattern) => pattern.test(content));
}

// 安全なYAML解析
export function safeYamlParse(content: string): unknown {
	try {
		// 前処理を実行
		const processedContent = preprocessYaml(content);

		// YAML解析を試行
		const parsed = yaml.load(processedContent);
		return parsed;
	} catch (error) {
		console.warn("YAML解析エラー（無視されます）:", error);
		return null;
	}
}

// 部分的なYAML解析（エラーが発生しても有効な部分を返す）
export function partialYamlParse(content: string): unknown {
	if (!content) return null;

	try {
		return safeYamlParse(content);
	} catch (error) {
		// エラーが発生した場合、行ごとに解析を試行
		const lines = content.split("\n");
		const validLines: string[] = [];

		for (const line of lines) {
			try {
				// 単一行のYAMLとして解析を試行
				const testContent = `test: ${line}`;
				yaml.load(testContent);
				validLines.push(line);
			} catch {
				// 無効な行はスキップ
			}
		}

		// 有効な行のみで再解析
		if (validLines.length > 0) {
			try {
				return safeYamlParse(validLines.join("\n"));
			} catch {
				return null;
			}
		}

		return null;
	}
}

// 系統樹ノードの型定義
interface TreeNode {
	name: string;
	en_name?: string; // 英語名（任意）
	children?: TreeNode[];
	from?: string;
	to?: string;
	linked_tree?: string; // 追加: linked_tree予約語
	non_post_leaf?: boolean; // 追加: リーフノードだが投稿取得時に無視するもの
	post_branch?: boolean; // 追加: リーフノードではないが投稿取得に含めるもの
	link_only?: boolean; // 追加: この系統樹はlinked_treeのみを参照するもの
}

// 分類名を含む系統樹を探し出し、そのchildren要素のnameを重複のない配列として取得
export function findRelatedClassifications(
	treeData: unknown,
	targetName: string,
): string[] {
	const relatedNames = new Set<string>();
	let targetFound = false;
	let targetPath: string[] = [];
	let targetParentNode: TreeNode | undefined = undefined;

	// 再帰的に系統樹を探索
	function traverseTree(
		node: unknown,
		path: string[] = [],
		parentNode?: TreeNode,
	): void {
		if (!node || typeof node !== "object") return;

		const treeNode = node as TreeNode;

		// 現在のノードの名前をパスに追加
		const currentPath = [...path, treeNode.name];

		// デバッグ用：探索中のノード名を出力
		console.log(
			`探索中: "${treeNode.name}" (パス: ${currentPath.join(" > ")})`,
		);

		// 目標の分類名が見つかった場合
		if (treeNode.name === targetName) {
			console.log(`=== 目標分類名 "${targetName}" を発見 ===`);
			console.log("発見場所のパス:", currentPath.join(" > "));
			targetFound = true;
			targetPath = currentPath;
			targetParentNode = parentNode;

			// 1. 自分自身にchildrenがある場合はそれを収集
			if (treeNode.children) {
				console.log("目標ノードにchildrenがあります");
				collectChildrenNames(treeNode.children, relatedNames);
			}
		}

		// 子ノードを再帰的に探索
		if (treeNode.children) {
			for (const child of treeNode.children) {
				traverseTree(child, currentPath, treeNode);
			}
		}
	}

	// childrenの名前を収集する関数
	function collectChildrenNames(
		children: TreeNode[],
		namesSet: Set<string>,
	): void {
		for (const child of children) {
			if (child.name && child.name.trim() !== "") {
				namesSet.add(child.name.trim());
				console.log(`関連分類名を追加: "${child.name}"`);
			}

			// さらに深い階層も探索
			if (child.children) {
				collectChildrenNames(child.children, namesSet);
			}
		}
	}

	// 系統樹の探索開始
	traverseTree(treeData);

	// 目標が見つかって、かつ葉ノードの場合は空配列を返す（兄弟分類名は取得しない）
	if (targetFound && !relatedNames.size) {
		console.log("目標ノードは葉ノードです。関連分類名はありません。");
	}

	const result = Array.from(relatedNames);
	console.log("=== 関連分類名の収集完了 ===");
	console.log("収集された分類名の数:", result.length);
	console.log("収集された分類名:", result);

	return result;
}

/**
 * 指定した targetName と一致するノードをツリー内から探索し、
 * そのノードの children の name を配列で返す（重複排除）。
 * link_only / linked_tree の処理は Phase 2 と同様に扱うため、
 * 対象ノードが見つかったらその部分木に対して collectAllChildrenNamesWithLinkedTree を適用する。
 */
export async function collectDirectChildrenNamesOfTarget(
  treeData: unknown,
  targetName: string,
  supabase: unknown,
): Promise<string[]> {
  if (!treeData) return [];

  // まず通常探索で targetName ノードを取得
  function findNode(node: unknown): TreeNode | null {
    if (!node || typeof node !== "object") return null;
    const n = node as Partial<TreeNode>;
    if (n.name === targetName) return n as TreeNode;
    if (Array.isArray(n.children)) {
      for (const child of n.children as unknown[]) {
        const found = findNode(child);
        if (found) return found;
      }
    }
    return null;
  }

  const targetNode = findNode(treeData);
  if (!targetNode) return [];

  // 対象ノードの直下だけをサブツリーとして抽出し、Phase 2 と同等のロジックで子nameを収集
  // link_only/linked_tree による分岐や外部参照も collectAllChildrenNamesWithLinkedTree に任せる
  const subTree = { ...targetNode };
  return await collectAllChildrenNamesWithLinkedTree(subTree, supabase);
}

// Supabaseクライアントの型（必要なメソッドのみ）
// type SupabaseLike = { ... } // ← 削除

/**
 * linked_treeを再帰的にたどり、すべての子要素nameを配列で返す
 * @param treeData YAMLパース済み系統樹
 * @param supabase Supabaseクライアント
 * @param visitedTreeIds 無限ループ防止用の訪問済みUUIDセット
 * @returns Promise<string[]>
 */
export type SupabaseMinimal = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        single: () => Promise<{ data: { content?: string } | null }>;
      };
    };
  };
};

export async function collectAllChildrenNamesWithLinkedTree(
  treeData: unknown,
  supabase: unknown,
  visitedTreeIds: Set<string> = new Set(),
): Promise<string[]> {
	const names = new Set<string>();
  // Supabaseの最小インターフェースに寄せて利用
  const sp = supabase as SupabaseMinimal as unknown as SupabaseMinimal;

	// link_only用の再帰関数：linked_treeを持つノードのみを処理
  async function collectLinkedTreeOnly(node: TreeNode) {
		console.log(
			"collectLinkedTreeOnly:",
			node.name,
			"linked_tree:",
			node.linked_tree,
		);

		// このノードにlinked_treeがある場合
    if (node.linked_tree && !visitedTreeIds.has(node.linked_tree)) {
			console.log("linked_treeを辿ります:", node.linked_tree);
			visitedTreeIds.add(node.linked_tree);
      const { data: linkedTree } = await sp
				.from("phylogenetic_trees")
				.select("content")
        .eq("id", node.linked_tree)
        .single();
			if (linkedTree?.content) {
				console.log("linked_treeの内容を取得しました");
				const linkedTreeData = safeYamlParse(linkedTree.content);
				if (linkedTreeData) {
					console.log("linked_treeをパースしました。再帰的に処理します。");
					await collect(linkedTreeData as TreeNode);
				} else {
					console.log("linked_treeのパースに失敗しました");
				}
			} else {
				console.log("linked_treeの内容を取得できませんでした");
			}
		}

		// childrenがあれば再帰的に辿る
		if (node.children) {
			for (const child of node.children) {
				await collectLinkedTreeOnly(child);
			}
		}
	}

  async function collect(node: TreeNode) {
		// link_onlyがtrueの場合、このノード自身のnameは追加せず、linked_treeのみを辿る
		if (node.link_only === true) {
			console.log(
				"link_only: true が検出されました。linked_treeのみを辿ります。",
			);
			// すべての子孫要素を再帰的に辿ってlinked_treeを探す
			if (node.children) {
				console.log("childrenの数:", node.children.length);
				for (const child of node.children) {
					await collectLinkedTreeOnly(child);
				}
			} else {
				console.log("childrenがありません");
			}
			return; // link_onlyの場合はここで終了
		}

		// 通常の投稿取得対象の判定
		let shouldIncludeInPosts = false;

		// 1. リーフノード（childrenがない、または空配列）の場合
		if (!node.children || node.children.length === 0) {
			// non_post_leafがtrueでない限り、リーフノードは投稿取得対象
			shouldIncludeInPosts = !node.non_post_leaf;
		} else {
			// 2. 非リーフノード（ブランチノード）の場合
			// post_branchがtrueの場合のみ投稿取得対象
			shouldIncludeInPosts = node.post_branch === true;
		}

		// 投稿取得対象の場合、nameを追加
		if (shouldIncludeInPosts && node.name && node.name.trim() !== "") {
			console.log("nameを追加:", node.name.trim());
			names.add(node.name.trim());
		}

		// childrenがあれば再帰的にたどる
		if (node.children) {
			for (const child of node.children) {
				await collect(child);
			}
		}

		// linked_treeがあれば、その系統樹も再帰的にたどる
    if (node.linked_tree && !visitedTreeIds.has(node.linked_tree)) {
			console.log("通常処理でlinked_treeを辿ります:", node.linked_tree);
			visitedTreeIds.add(node.linked_tree);
      const { data: linkedTree } = await sp
				.from("phylogenetic_trees")
				.select("content")
        .eq("id", node.linked_tree)
        .single();
			if (linkedTree?.content) {
				const linkedTreeData = safeYamlParse(linkedTree.content);
				if (linkedTreeData) {
					await collect(linkedTreeData as TreeNode);
				}
			}
		}
	}

	await collect(treeData as TreeNode);
	return Array.from(names);
}
