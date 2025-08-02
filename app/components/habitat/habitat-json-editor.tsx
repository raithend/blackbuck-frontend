"use client";

import { GeologicalAgeCard } from "@/app/components/geological/geological-age-card";
import { Button } from "@/app/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";
import dynamic from "next/dynamic";
import React, {
	useState,
	useEffect,
	forwardRef,
	useImperativeHandle,
} from "react";
import { toast } from "sonner";
import type { EraGroup, HabitatElement } from "./types";

// Monaco Editorを動的インポート
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
	ssr: false,
});

interface HabitatJsonEditorProps {
	habitatData: EraGroup[];
	onSave: (data: EraGroup[]) => void;
	onDataChange: (data: EraGroup[]) => void;
	showMapSelector?: boolean;
	onMapChange?: (mapFile: string) => void;
	width?: number;
	height?: number;
}

export interface HabitatJsonEditorRef {
	getHabitatPoints: () => HabitatElement[];
}

const HabitatJsonEditor = forwardRef<
	HabitatJsonEditorRef,
	HabitatJsonEditorProps
>(
	(
		{
			habitatData,
			onSave,
			onDataChange,
			showMapSelector = true,
			onMapChange,
			width = 960,
			height = 480,
		},
		ref,
	) => {
		const [jsonValue, setJsonValue] = useState<string>("");
		const [isValid, setIsValid] = useState(true);
		const [isSaving, setIsSaving] = useState(false);

		// 初期データをJSON文字列に変換
		useEffect(() => {
			try {
				const jsonString = JSON.stringify(habitatData, null, 2);
				setJsonValue(jsonString);
				setIsValid(true);
			} catch (error) {
				console.error("JSON変換エラー:", error);
				setIsValid(false);
			}
		}, [habitatData]);

		// JSONの妥当性をチェック
		const validateJson = (value: string): EraGroup[] | null => {
			try {
				const parsed = JSON.parse(value);
				if (Array.isArray(parsed) && parsed.length > 0 && "era" in parsed[0]) {
					return parsed as EraGroup[];
				}
				return null;
			} catch (error) {
				return null;
			}
		};

		// エディターの値が変更されたときの処理
		const handleEditorChange = (value: string | undefined) => {
			if (!value) return;

			setJsonValue(value);
			const parsedData = validateJson(value);
			setIsValid(parsedData !== null);

			if (parsedData) {
				onDataChange(parsedData);
			}
		};

		// 保存処理
		const handleSave = async () => {
			const parsedData = validateJson(jsonValue);
			if (!parsedData) {
				toast.error("JSONの形式が正しくありません");
				return;
			}

			setIsSaving(true);
			try {
				await onSave(parsedData);
				toast.success("保存しました");
			} catch (error) {
				console.error("保存エラー:", error);
				toast.error("保存に失敗しました");
			} finally {
				setIsSaving(false);
			}
		};

		// refの実装
		useImperativeHandle(ref, () => ({
			getHabitatPoints: () => {
				const parsedData = validateJson(jsonValue);
				if (parsedData) {
					const points: HabitatElement[] = [];
					for (const group of parsedData) {
						for (const element of group.elements) {
							points.push({
								id: element.id,
								lat: element.lat,
								lng: element.lng,
								color: element.color,
								size: element.size,
								shape: element.shape,
								label: element.label,
								text: element.text,
								fontSize: element.fontSize,
								scaleX: element.scaleX,
								scaleY: element.scaleY,
								angle: element.angle,
								flipX: element.flipX,
								flipY: element.flipY,
							});
						}
					}
					return points;
				}
				return [];
			},
		}));

		return (
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
				{/* メインエディターエリア */}
				<div className="lg:col-span-3">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span>JSONエディター</span>
								<div className="flex gap-2">
									<Button onClick={handleSave} disabled={!isValid || isSaving}>
										{isSaving ? "保存中..." : "保存"}
									</Button>
								</div>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="relative border overflow-hidden">
								<MonacoEditor
									height={height}
									width={width}
									language="json"
									theme="vs-dark"
									value={jsonValue}
									onChange={handleEditorChange}
									options={{
										minimap: { enabled: false },
										fontSize: 14,
										lineNumbers: "on",
										roundedSelection: false,
										scrollBeyondLastLine: false,
										automaticLayout: true,
									}}
								/>
								{!isValid && (
									<div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
										JSON形式エラー
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* 地図選択パネル */}
				<div className="lg:col-span-1">
					<Card>
						<CardHeader>
							<CardTitle>地図選択</CardTitle>
						</CardHeader>
						<CardContent>
							<GeologicalAgeCard enableMenu={false} />
						</CardContent>
					</Card>
				</div>
			</div>
		);
	},
);

HabitatJsonEditor.displayName = "HabitatJsonEditor";

export default HabitatJsonEditor;
