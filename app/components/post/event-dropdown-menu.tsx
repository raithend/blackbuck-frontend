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
import { Check, ChevronsUpDown, Calendar, Plus } from "lucide-react";
import * as React from "react";

import { famousEvents } from "./events.ts.d/famous-events";

const events = famousEvents;

interface EventDropdownMenuProps {
	value?: string;
	onChange?: (value: string) => void;
}

export function EventDropdownMenu({ value, onChange }: EventDropdownMenuProps) {
	const [open, setOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [customEvent, setCustomEvent] = React.useState("");

	// 検索フィルタリング
	const filteredEvents = events.filter(event =>
		event.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleEventSelect = (event: string) => {
		onChange?.(event);
		setOpen(false);
		setSearchQuery("");
	};

	const handleCustomEventSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (customEvent.trim()) {
			handleEventSelect(customEvent.trim());
			setCustomEvent("");
		}
	};

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className="w-full justify-between"
				>
					{value || "イベントを選択"}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-4 space-y-4">
				{/* 検索ボックス */}
				<div className="space-y-2">
					<label className="text-sm font-medium">イベントを検索</label>
					<Input
						placeholder="イベントを検索..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				{/* カスタムイベント追加 */}
				<div className="space-y-2">
					<label className="text-sm font-medium">新しいイベントを追加</label>
					<form onSubmit={handleCustomEventSubmit} className="flex gap-2">
						<Input
							placeholder="イベント名を入力..."
							value={customEvent}
							onChange={(e) => setCustomEvent(e.target.value)}
						/>
						<Button type="submit" size="sm" disabled={!customEvent.trim()}>
							<Plus className="h-4 w-4" />
						</Button>
					</form>
				</div>

				{/* 事前定義されたイベントリスト */}
				<div className="space-y-2">
					<label className="text-sm font-medium">よく使われるイベント</label>
					<ScrollArea className="h-48">
						<div className="space-y-1">
							{filteredEvents.length > 0 ? (
								filteredEvents.map((event) => (
									<button
										key={event}
										onClick={() => handleEventSelect(event)}
										className={cn(
											"w-full flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors text-left",
											value === event && "bg-blue-50 border border-blue-200"
										)}
										type="button"
									>
										<Calendar className="h-4 w-4 text-gray-500" />
										<span className="flex-1">{event}</span>
										{value === event && (
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
	);
} 