"use client";

import { Button } from "@/app/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Input } from "@/app/components/ui/input";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { cn } from "@/app/lib/utils";
import { Check, ChevronsUpDown, MapPin, Plus, X } from "lucide-react";
import * as React from "react";

import { famousLocations } from "./locations.ts.d/famous-locations";
import { scienceMuseums } from "./locations.ts.d/science-museums";
import { prefectures } from "./locations.ts.d/prefectures";
import { zoos } from "./locations.ts.d/zoos";
import { aquariums } from "./locations.ts.d/aquariums";

const locations = [
	...famousLocations,
	...scienceMuseums,
	...zoos,
	...aquariums,
	...prefectures,
];

interface LocationDropdownMenuProps {
	value?: string;
	onChange?: (value: string) => void;
}

export function LocationDropdownMenu({
	value,
	onChange,
}: LocationDropdownMenuProps) {
	const [open, setOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [customLocation, setCustomLocation] = React.useState("");

	// 検索フィルタリング
	const filteredLocations = locations.filter((location) =>
		location.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleLocationSelect = (location: string) => {
		onChange?.(location);
		setOpen(false);
		setSearchQuery("");
	};

	const handleCustomLocationSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (customLocation.trim()) {
			handleLocationSelect(customLocation.trim());
			setCustomLocation("");
		}
	};

	return (
		<div className="flex">
			<DropdownMenu open={open} onOpenChange={setOpen}>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="flex-1 justify-between">
						{value || "撮影地を選択"}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-4 space-y-4">
					{/* 検索ボックス */}
					<div className="space-y-2">
						<label className="text-sm font-medium">撮影地を検索</label>
						<Input
							placeholder="撮影地を検索..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					{/* カスタム撮影地追加 */}
					<div className="space-y-2">
						<label className="text-sm font-medium">新しい撮影地を追加</label>
						<form onSubmit={handleCustomLocationSubmit} className="flex gap-2">
							<Input
								placeholder="撮影地名を入力..."
								value={customLocation}
								onChange={(e) => setCustomLocation(e.target.value)}
							/>
							<Button type="submit" size="sm" disabled={!customLocation.trim()}>
								<Plus className="h-4 w-4" />
							</Button>
						</form>
					</div>

					{/* 事前定義された撮影地リスト */}
					<div className="space-y-2">
						<label className="text-sm font-medium">よく使われる撮影地</label>
						<ScrollArea className="h-48">
							<div className="space-y-1">
								{filteredLocations.length > 0 ? (
									filteredLocations.map((location) => (
										<button
											key={location}
											onClick={() => handleLocationSelect(location)}
											className={cn(
												"w-full flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors text-left",
												value === location &&
													"bg-blue-50 border border-blue-200",
											)}
											type="button"
										>
											<MapPin className="h-4 w-4 text-gray-500" />
											<span className="flex-1">{location}</span>
											{value === location && (
												<Check className="h-4 w-4 text-blue-600" />
											)}
										</button>
									))
								) : (
									<div className="text-sm text-gray-500 p-2 text-center">
										検索結果が見つかりません
									</div>
								)}
							</div>
						</ScrollArea>
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => onChange?.("")}
				className="shrink-0"
				disabled={!value}
			>
				<X className="h-4 w-4" />
			</Button>
		</div>
	);
}
