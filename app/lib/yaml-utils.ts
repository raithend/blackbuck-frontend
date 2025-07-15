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