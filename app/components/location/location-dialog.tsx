"use client";

import { Button } from "@/app/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { cn } from "@/app/lib/utils";
import { Check, ChevronsUpDown, MapPin, Plus, X } from "lucide-react";
import * as React from "react";

import { aquariums } from "./locations.ts.d/aquariums";
import { famousLocations } from "./locations.ts.d/famous-locations";
import { prefectures } from "./locations.ts.d/prefectures";
import { scienceMuseums } from "./locations.ts.d/science-museums";
import { zoos } from "./locations.ts.d/zoos";

const locations = [
	...famousLocations,
	...scienceMuseums,
	...zoos,
	...aquariums,
	...prefectures,
].filter((location, index, array) => array.indexOf(location) === index);

interface LocationDialogProps {
	value?: string;
	onChange?: (value: string) => void;
	triggerClassName?: string;
}

export function LocationDialog({
	value,
	onChange,
	triggerClassName,
}: LocationDialogProps) {
	const [open, setOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [customLocation, setCustomLocation] = React.useState("");
    const [recentLocations, setRecentLocations] = React.useState<string[]>([]);

    React.useEffect(() => {
        try {
            const raw = localStorage.getItem("recent_locations_v1");
            if (raw) {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr)) {
                    setRecentLocations(arr.filter((x) => typeof x === "string").slice(0, 5));
                }
            }
        } catch {}
    }, []);

	const filteredLocations = locations.filter((location) =>
		location.toLowerCase().includes(searchQuery.toLowerCase()),
	);

    const pushRecent = (loc: string) => {
        const next = [loc, ...recentLocations.filter((x) => x !== loc)].slice(0, 5);
        setRecentLocations(next);
        try {
            localStorage.setItem("recent_locations_v1", JSON.stringify(next));
        } catch {}
    };

    const handleLocationSelect = (location: string) => {
		onChange?.(location);
		setOpen(false);
		setSearchQuery("");
        pushRecent(location);
	};

	const handleCustomLocationSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (customLocation.trim()) {
			handleLocationSelect(customLocation.trim());
			setCustomLocation("");
		}
	};

	const triggerLabel = value || "撮影地を選択";

	return (
		<div className="flex">
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						variant="outline"
						className={cn("flex-1 justify-between", triggerClassName)}
					>
						{triggerLabel}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</DialogTrigger>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>撮影地を選択</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
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
							<form
								onSubmit={handleCustomLocationSubmit}
								className="flex gap-2"
							>
								<Input
									placeholder="撮影地名を入力..."
									value={customLocation}
									onChange={(e) => setCustomLocation(e.target.value)}
								/>
								<Button
									type="submit"
									size="sm"
									disabled={!customLocation.trim()}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</form>
						</div>

                        {/* 最近使った撮影地（最大5件） */}
                        {recentLocations.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">最近使った撮影地</label>
                                <div className="flex flex-wrap gap-2">
                                    {recentLocations.map((loc) => (
                                        <button
                                            key={loc}
                                            type="button"
                                            onClick={() => handleLocationSelect(loc)}
                                            className={cn(
                                                "px-3 py-1 rounded-full border text-sm hover:bg-gray-100",
                                                value === loc && "bg-blue-50 border-blue-200",
                                            )}
                                        >
                                            {loc}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

						{/* 事前定義された撮影地リスト */}
						<div className="space-y-2">
							<label className="text-sm font-medium">よく使われる撮影地</label>
							<ScrollArea className="h-64">
								<div className="space-y-1">
									{filteredLocations.length > 0 ? (
										filteredLocations.map((loc) => (
											<button
												key={loc}
												onClick={() => handleLocationSelect(loc)}
												className={cn(
													"w-full flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors text-left",
													value === loc && "bg-blue-50 border border-blue-200",
												)}
												type="button"
											>
												<MapPin className="h-4 w-4 text-gray-500" />
												<span className="flex-1">{loc}</span>
												{value === loc && (
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
					</div>
				</DialogContent>
			</Dialog>
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
