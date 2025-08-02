import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
	Circle as LucideCircle,
	MousePointer,
	Redo,
	Save,
	Type,
	Undo,
} from "lucide-react";
import React from "react";

interface HabitatToolbarProps {
	selectedTool: "select" | "circle" | "text";
	onToolChange: (tool: "select" | "circle" | "text") => void;
	pointColor: string;
	onColorChange: (color: string) => void;
	pointSize: number;
	onSizeChange: (size: number) => void;
	textContent: string;
	onTextContentChange: (text: string) => void;
	fontSize: number;
	onFontSizeChange: (size: number) => void;
	onUndo: () => void;
	onRedo: () => void;
	onSave: () => void;
}

export function HabitatToolbar({
	selectedTool,
	onToolChange,
	pointColor,
	onColorChange,
	pointSize,
	onSizeChange,
	textContent,
	onTextContentChange,
	fontSize,
	onFontSizeChange,
	onUndo,
	onRedo,
	onSave,
}: HabitatToolbarProps) {
	return (
		<div className="flex items-center gap-2 mb-4 p-4 bg-gray-100 rounded-lg">
			<div className="flex items-center gap-1">
				<Button
					variant={selectedTool === "select" ? "default" : "outline"}
					size="sm"
					onClick={() => onToolChange("select")}
				>
					<MousePointer className="h-4 w-4" />
				</Button>
				<Button
					variant={selectedTool === "circle" ? "default" : "outline"}
					size="sm"
					onClick={() => onToolChange("circle")}
				>
					<LucideCircle className="h-4 w-4" />
				</Button>
				<Button
					variant={selectedTool === "text" ? "default" : "outline"}
					size="sm"
					onClick={() => onToolChange("text")}
				>
					<Type className="h-4 w-4" />
				</Button>
			</div>

			<div className="flex items-center gap-2 ml-4">
				{selectedTool !== "select" && (
					<>
						<Label htmlFor="point-color">色:</Label>
						<Input
							id="point-color"
							type="color"
							value={pointColor}
							onChange={(e) => onColorChange(e.target.value)}
							className="w-16 h-8"
						/>
					</>
				)}
				{selectedTool === "circle" && (
					<>
						<Label htmlFor="point-size">サイズ:</Label>
						<Input
							id="point-size"
							type="number"
							value={pointSize}
							onChange={(e) => onSizeChange(Number(e.target.value))}
							className="w-20"
							min="5"
							max="100"
						/>
					</>
				)}
				{selectedTool === "text" && (
					<>
						<Label htmlFor="text-content">テキスト:</Label>
						<Input
							id="text-content"
							type="text"
							value={textContent}
							onChange={(e) => onTextContentChange(e.target.value)}
							className="w-32"
						/>
						<Label htmlFor="font-size">フォントサイズ:</Label>
						<Input
							id="font-size"
							type="number"
							value={fontSize}
							onChange={(e) => onFontSizeChange(Number(e.target.value))}
							className="w-20"
							min="8"
							max="72"
						/>
					</>
				)}
			</div>

			<div className="flex items-center gap-1 ml-4">
				<Button variant="outline" size="sm" onClick={onUndo}>
					<Undo className="h-4 w-4" />
				</Button>
				<Button variant="outline" size="sm" onClick={onRedo}>
					<Redo className="h-4 w-4" />
				</Button>
				<Button
					size="sm"
					onClick={() => {
						console.log("保存ボタンがクリックされました（toolbar）");
						onSave();
					}}
				>
					<Save className="h-4 w-4 mr-2" />
					保存
				</Button>
			</div>
		</div>
	);
}
