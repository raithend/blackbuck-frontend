import React, { memo } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Trash2 } from 'lucide-react';
import type { HabitatPoint } from "./types";

interface HabitatPointListProps {
	habitatPoints: HabitatPoint[];
	selectedObjectId: string | undefined;
	onPointSelect: (pointId: string) => void;
	onPointDelete: (pointId: string) => void;
}

export const HabitatPointList = memo(function HabitatPointList({
	habitatPoints,
	selectedObjectId,
	onPointSelect,
	onPointDelete,
}: HabitatPointListProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">生息地ポイント</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				{habitatPoints.length === 0 ? (
					<div className="text-center text-gray-500 py-4">
						<p>ポイントがありません</p>
						<p className="text-sm mt-1">地図をクリックしてポイントを追加してください</p>
					</div>
				) : (
					habitatPoints.map((point) => (
						<div
							key={point.id}
							className={`p-3 border rounded-lg cursor-pointer transition-colors ${
								selectedObjectId === point.id
									? 'border-blue-500 bg-blue-50'
									: 'border-gray-200 hover:border-gray-300'
							}`}
							onClick={() => onPointSelect(point.id)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									onPointSelect(point.id);
								}
							}}
							tabIndex={0}
							role="button"
							aria-label={`ポイント${point.label || point.id}を選択`}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div
										className="w-4 h-4 rounded"
										style={{ backgroundColor: point.color }}
									/>
									<span className="font-medium">
										{point.label || `ポイント${point.id}`}
									</span>
									{point.shape === 'text' && point.text && (
										<span className="text-sm text-gray-500">
											({point.text})
										</span>
									)}
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										onPointDelete(point.id);
									}}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
							<div className="text-sm text-gray-600 mt-1">
								{point.lat.toFixed(3)}, {point.lng.toFixed(3)}
							</div>
							{point.geologicalAge && (
								<div className="text-xs text-blue-600 mt-1">
									{point.geologicalAge.era} → {point.geologicalAge.period} → {point.geologicalAge.epoch} → {point.geologicalAge.age}
								</div>
							)}
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}); 