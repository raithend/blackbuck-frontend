"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { GeologicalAgeProvider } from "@/app/components/geological/geological-context";
import { GeologicalAgeCard } from "@/app/components/geological/geological-age-card";
import { PhylogeneticTree } from "@/app/components/phylogenetic/phylogenetic-tree";

// Monaco Editorを動的インポート（SSRを避けるため）
const MonacoEditor = dynamic(
	() => import("@monaco-editor/react"),
	{ ssr: false }
);

export default function PhylogeneticTreeViewPage() {
	const params = useParams();
	const router = useRouter();
	const decodedName = decodeURIComponent(params.name as string);
	const [treeContent, setTreeContent] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	// 既存の系統樹データを取得
	useEffect(() => {
		const fetchTreeData = async () => {
			setIsLoading(true);
			try {
				const response = await fetch(`/api/classifications/${encodeURIComponent(decodedName)}/phylogenetic-trees`);
				if (response.ok) {
					const data = await response.json();
					const content = data.phylogeneticTree?.content || "";
					setTreeContent(content);
				}
			} catch (error) {
				console.error('系統樹データの取得に失敗しました:', error);
				toast.error('系統樹データの取得に失敗しました');
			} finally {
				setIsLoading(false);
			}
		};

		fetchTreeData();
	}, [decodedName]);

	// ファイルダウンロード
	const handleDownload = () => {
		const blob = new Blob([treeContent], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${decodedName}_phylogenetic_tree.yml`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-center h-64">
					<div>系統樹データを読み込み中...</div>
				</div>
			</div>
		);
	}

	if (!treeContent) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-center h-64">
					<div className="text-center">
						<p className="text-gray-500 mb-4">系統樹データが見つかりません</p>
						<Button
							variant="outline"
							onClick={() => router.push(`/classifications/${encodeURIComponent(decodedName)}`)}
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							戻る
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<GeologicalAgeProvider>
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center gap-4 mb-6">
					<Button
						variant="outline"
						onClick={() => router.push(`/classifications/${encodeURIComponent(decodedName)}`)}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						戻る
					</Button>
					<h1 className="text-2xl font-bold">系統樹表示: {decodedName}</h1>
					<div className="ml-auto flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleDownload}
							disabled={!treeContent}
						>
							<Download className="h-4 w-4 mr-2" />
							ダウンロード
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
					{/* 左側: エディター（読み取り専用） */}
					<div className="flex flex-col">
						<Card className="flex-1">
							<CardContent className="flex-1 p-0 h-full">
								<MonacoEditor
									height="100%"
									defaultLanguage="yaml"
									theme="vs-dark"
									value={treeContent}
									options={{
										minimap: { enabled: true },
										scrollBeyondLastLine: false,
										fontSize: 14,
										wordWrap: 'on',
										automaticLayout: true,
										theme: 'vs-dark',
										lineNumbers: 'on',
										glyphMargin: true,
										folding: true,
										lineDecorationsWidth: 10,
										lineNumbersMinChars: 3,
										renderLineHighlight: 'all',
										selectOnLineNumbers: true,
										roundedSelection: false,
										readOnly: true, // 読み取り専用
										cursorStyle: 'line',
										contextmenu: true,
										mouseWheelZoom: true,
										quickSuggestions: false,
										wordBasedSuggestions: 'off',
										parameterHints: {
											enabled: false
										},
										tabCompletion: 'on',
										tabSize: 2,
										insertSpaces: true,
										wrappingIndent: 'indent',
										scrollbar: {
											vertical: 'visible',
											horizontal: 'visible',
											verticalScrollbarSize: 14,
											horizontalScrollbarSize: 14
										}
									}}
									onMount={(editor, monaco) => {
										console.log('MonacoEditor onMount');
										monaco.languages.registerCompletionItemProvider('yaml', {
											triggerCharacters: ['-', 'c', 'f', 't'],
											provideCompletionItems: (model, position) => {
												const lineContent = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
												console.log('provideCompletionItems called. lineContent:', lineContent);
												const suggestions = [];
												if (/^\s*-$/.test(lineContent)) {
													suggestions.push({
														label: '- name:',
														kind: monaco.languages.CompletionItemKind.Snippet,
														insertText: '- name: ',
														insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
														range: {
															startLineNumber: position.lineNumber,
															startColumn: 1,
															endLineNumber: position.lineNumber,
															endColumn: position.column,
														},
													});
													console.log('Triggered - name: snippet');
												}
												if (/^\s*c$/.test(lineContent)) {
													suggestions.push({
														label: 'children:',
														kind: monaco.languages.CompletionItemKind.Snippet,
														insertText: 'children: ',
														insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
														range: {
															startLineNumber: position.lineNumber,
															startColumn: 1,
															endLineNumber: position.lineNumber,
															endColumn: position.column,
														},
													});
													console.log('Triggered children: snippet');
												}
												if (/^\s*f$/.test(lineContent)) {
													suggestions.push({
														label: 'from:',
														kind: monaco.languages.CompletionItemKind.Snippet,
														insertText: 'from: ',
														insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
														range: {
															startLineNumber: position.lineNumber,
															startColumn: 1,
															endLineNumber: position.lineNumber,
															endColumn: position.column,
														},
													});
													console.log('Triggered from: snippet');
												}
												if (/^\s*t$/.test(lineContent)) {
													suggestions.push({
														label: 'to:',
														kind: monaco.languages.CompletionItemKind.Snippet,
														insertText: 'to: ',
														insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
														range: {
															startLineNumber: position.lineNumber,
															startColumn: 1,
															endLineNumber: position.lineNumber,
															endColumn: position.column,
														},
													});
													console.log('Triggered to: snippet');
												}
												console.log('suggestions:', suggestions);
												return { suggestions };
											},
										});
										console.log('registerCompletionItemProvider called');
									}}
								/>
							</CardContent>
						</Card>
					</div>

					{/* 右側: プレビュー */}
					<div className="flex flex-col space-y-4">
						{/* 地質時代カード */}
						<Card>
							<CardContent>
								<GeologicalAgeCard enableMenu={false} />
							</CardContent>
						</Card>

						{/* 系統樹プレビュー */}
						<Card className="flex-1">
							<CardContent className="flex-1 p-0 h-full">
								<div className="h-full min-h-[400px]">
									<PhylogeneticTree customTreeContent={treeContent} />
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</GeologicalAgeProvider>
	);
} 