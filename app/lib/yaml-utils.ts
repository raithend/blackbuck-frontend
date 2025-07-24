import yaml from "js-yaml";

// YAMLの前処理：無効な行や文字を除去
export function preprocessYaml(content: string): string {
  if (!content) return "";
  
  const lines = content.split('\n');
  const processedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 空行は保持
    if (line.trim() === '') {
      processedLines.push(line);
      continue;
    }
    
    // コメント行は保持
    if (line.trim().startsWith('#')) {
      processedLines.push(line);
      continue;
    }
    
    // インデントを計算
    const indent = line.match(/^\s*/)?.[0] || '';
    const content = line.trim();
    
    // 有効なYAML構造かチェック
    if (isValidYamlLine(content)) {
      processedLines.push(line);
    } else {
      // 無効な行は空行に置換（インデントは保持）
      processedLines.push(indent);
    }
  }
  
  return processedLines.join('\n');
}

// 行が有効なYAML構造かチェック
function isValidYamlLine(content: string): boolean {
  // 空文字列は有効
  if (content === '') return true;
  
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
    /^[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]+$/
  ];
  
  return validPatterns.some(pattern => pattern.test(content));
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
    console.warn('YAML解析エラー（無視されます）:', error);
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
    const lines = content.split('\n');
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
        return safeYamlParse(validLines.join('\n'));
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
}

// 分類名を含む系統樹を探し出し、そのchildren要素のnameを重複のない配列として取得
export function findRelatedClassifications(treeData: unknown, targetName: string): string[] {
  const relatedNames = new Set<string>();
  let targetFound = false;
  let targetPath: string[] = [];
  let targetParentNode: TreeNode | undefined = undefined;
  
  // 再帰的に系統樹を探索
  function traverseTree(node: unknown, path: string[] = [], parentNode?: TreeNode): void {
    if (!node || typeof node !== 'object') return;
    
    const treeNode = node as TreeNode;
    
    // 現在のノードの名前をパスに追加
    const currentPath = [...path, treeNode.name];
    
    // デバッグ用：探索中のノード名を出力
    console.log(`探索中: "${treeNode.name}" (パス: ${currentPath.join(' > ')})`);
    
    // 目標の分類名が見つかった場合
    if (treeNode.name === targetName) {
      console.log(`=== 目標分類名 "${targetName}" を発見 ===`);
      console.log('発見場所のパス:', currentPath.join(' > '));
      targetFound = true;
      targetPath = currentPath;
      targetParentNode = parentNode;
      
      // 1. 自分自身にchildrenがある場合はそれを収集
      if (treeNode.children) {
        console.log('目標ノードにchildrenがあります');
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
  function collectChildrenNames(children: TreeNode[], namesSet: Set<string>): void {
    for (const child of children) {
      if (child.name && child.name.trim() !== '') {
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
    console.log('目標ノードは葉ノードです。関連分類名はありません。');
  }
  
  const result = Array.from(relatedNames);
  console.log('=== 関連分類名の収集完了 ===');
  console.log('収集された分類名の数:', result.length);
  console.log('収集された分類名:', result);
  
  return result;
} 