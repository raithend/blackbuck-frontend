"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ArrowLeft, Save, Download, Upload, Sparkles } from "lucide-react";
import { createClient } from "@/app/lib/supabase-browser";
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

export default function PhylogeneticTreeEditPage() {
	const params = useParams();
	const router = useRouter();
	const decodedName = decodeURIComponent(params.name as string);
	const [treeContent, setTreeContent] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [originalContent, setOriginalContent] = useState("");
	const [yamlError, setYamlError] = useState<string | null>(null);

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
					setOriginalContent(content);
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

	// Wikipediaから系統樹を生成
	const handleGenerateFromWikipedia = async () => {
		setIsGenerating(true);
		try {
			const supabase = createClient();
			const { data: { session } } = await supabase.auth.getSession();
			
			const response = await fetch(`/api/classifications/${encodeURIComponent(decodedName)}/generate-tree`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${session?.access_token}`,
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || '生成に失敗しました');
			}

			const data = await response.json();
			setTreeContent(data.yaml);
			setOriginalContent(data.yaml);
			toast.success('Wikipediaから系統樹を生成しました');
		} catch (error) {
			console.error('系統樹生成エラー:', error);
			toast.error(error instanceof Error ? error.message : '系統樹の生成に失敗しました');
		} finally {
			setIsGenerating(false);
		}
	};

	// 保存処理
	const handleSave = async () => {
		setIsSaving(true);
		try {
			const supabase = createClient();
			const { data: { session } } = await supabase.auth.getSession();
			
			const response = await fetch(`/api/classifications/${encodeURIComponent(decodedName)}/phylogenetic-trees`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${session?.access_token}`,
				},
				body: JSON.stringify({
					content: treeContent
				}),
			});

			if (!response.ok) {
				throw new Error('保存に失敗しました');
			}

			setOriginalContent(treeContent);
			toast.success('系統樹を保存しました');
		} catch (error) {
			console.error('保存エラー:', error);
			toast.error('保存に失敗しました');
		} finally {
			setIsSaving(false);
		}
	};

	// ファイルダウンロード
	const handleDownload = () => {
		const blob = new Blob([treeContent], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${decodedName}_phylogenetic_tree.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	// ファイルアップロード
	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				setTreeContent(content);
			};
			reader.readAsText(file);
		}
	};

	// 変更があるかどうかをチェック
	const hasChanges = treeContent !== originalContent;

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-center h-64">
					<div>系統樹データを読み込み中...</div>
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
					<h1 className="text-2xl font-bold">系統樹編集: {decodedName}</h1>
					<div className="ml-auto flex items-center gap-2">
						{hasChanges && (
							<div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200 mr-2">
								<span className="block lg:hidden">⚠️ 未保存</span>
								<span className="hidden lg:block">⚠️ 未保存の変更があります</span>
							</div>
						)}
						<Button
							variant="outline"
							size="sm"
							onClick={handleGenerateFromWikipedia}
							disabled={isGenerating}
						>
							<Sparkles className="h-4 w-4 mr-2" />
							{isGenerating ? "生成中..." : "生成"}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleDownload}
							disabled={!treeContent}
						>
							<Download className="h-4 w-4 mr-2" />
							ダウンロード
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => document.getElementById('file-upload')?.click()}
						>
							<Upload className="h-4 w-4 mr-2" />
							アップロード
						</Button>
						<Button
							onClick={handleSave}
							disabled={isSaving || !hasChanges}
							size="sm"
						>
							<Save className="h-4 w-4 mr-2" />
							{isSaving ? "保存中..." : "保存"}
						</Button>
						<input
							id="file-upload"
							type="file"
							accept=".txt,.newick,.nexus"
							onChange={handleFileUpload}
							className="hidden"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
					{/* 左側: エディター */}
					<div className="flex flex-col">
						<Card className="flex-1">
							<CardContent className="flex-1 p-0 h-full">
								<MonacoEditor
									height="100%"
									defaultLanguage="yaml"
									value={treeContent}
									onChange={(value) => {
										setTreeContent(value || "");
										// YAMLエラーをクリア
										setYamlError(null);
									}}
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
										readOnly: false,
										cursorStyle: 'line',
										contextmenu: true,
										mouseWheelZoom: true,
										quickSuggestions: false,
										wordBasedSuggestions: 'off',
										parameterHints: {
											enabled: false
										},
										tabCompletion: 'off',
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
								/>
							</CardContent>
						</Card>
					</div>

					{/* 右側: プレビュー */}
					<div className="flex flex-col space-y-4">
						{/* 系統樹プレビュー */}
						<Card className="flex-1">
							<CardContent className="flex-1 p-0 h-full">
								<div className="h-full min-h-[400px] relative">
									{/* 地質時代カードを右上に重ねて配置 */}
									<div className="absolute top-0 right-0 z-10">
										<GeologicalAgeCard enableMenu={true} />
									</div>
									{treeContent ? (
										<PhylogeneticTree 
											customTreeContent={treeContent} 
											onError={(error) => setYamlError(error)}
										/>
									) : (
										<div className="flex items-center justify-center h-full text-gray-500">
											<p>YAMLを入力して系統樹をプレビュー</p>
										</div>
									)}
									{yamlError && (
										<div className="absolute bottom-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm">
											⚠️ YAMLエラー: {yamlError}
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</GeologicalAgeProvider>
	);
} 