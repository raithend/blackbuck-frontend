import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import React, { memo } from "react";
import type { HabitatElement } from "./types";

interface HabitatPropertiesPanelProps {
	selectedPoint: HabitatElement | null;
	onPropertyChange: (
		field: keyof HabitatElement,
		value: string | number | undefined,
	) => void;
}

export const HabitatPropertiesPanel = memo(function HabitatPropertiesPanel({
	selectedPoint,
	onPropertyChange,
}: HabitatPropertiesPanelProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">プロパティ編集</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{selectedPoint ? (
					<>
						<div>
							<Label htmlFor="point-label">ラベル</Label>
							<Input
								id="point-label"
								value={selectedPoint.label || ""}
								onChange={(e) => onPropertyChange("label", e.target.value)}
								placeholder="ポイント名"
							/>
						</div>
						<div>
							<Label htmlFor="point-color-edit">色</Label>
							<Input
								id="point-color-edit"
								type="color"
								value={selectedPoint.color || "#ff0000"}
								onChange={(e) => onPropertyChange("color", e.target.value)}
							/>
						</div>
						<div>
							<Label htmlFor="point-size-edit">サイズ</Label>
							<Input
								id="point-size-edit"
								type="number"
								value={selectedPoint.size || 20}
								onChange={(e) =>
									onPropertyChange("size", Number(e.target.value))
								}
								min="5"
								max="100"
							/>
						</div>
						{selectedPoint.shape === "text" && (
							<>
								<div>
									<Label htmlFor="point-text-edit">テキスト</Label>
									<Input
										id="point-text-edit"
										value={selectedPoint.text || ""}
										onChange={(e) => onPropertyChange("text", e.target.value)}
										placeholder="テキスト内容"
									/>
								</div>
								<div>
									<Label htmlFor="point-font-size-edit">フォントサイズ</Label>
									<Input
										id="point-font-size-edit"
										type="number"
										value={selectedPoint.fontSize || 16}
										onChange={(e) =>
											onPropertyChange("fontSize", Number(e.target.value))
										}
										min="8"
										max="72"
									/>
								</div>
							</>
						)}
						<div>
							<Label htmlFor="point-range">範囲半径（km）</Label>
							<Input
								id="point-range"
								type="number"
								value={selectedPoint.maxR || ""}
								onChange={(e) =>
									onPropertyChange(
										"maxR",
										e.target.value ? Number(e.target.value) : undefined,
									)
								}
								placeholder="500"
							/>
						</div>
					</>
				) : (
					<div className="text-center text-gray-500 py-4">
						<p>ポイントを選択してください</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
});
