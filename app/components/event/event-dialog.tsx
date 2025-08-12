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
import { Calendar, Check, ChevronsUpDown, Plus, X } from "lucide-react";
import * as React from "react";

import { exhibitionEvents } from "./events.ts.d/exhibition-events";
import { fukuiEvents } from "./events.ts.d/fukui-events";
import { museumEvents } from "./events.ts.d/museum-events";

const events = [...museumEvents, ...exhibitionEvents, ...fukuiEvents];

interface EventDialogProps {
	value?: string;
	onChange?: (value: string) => void;
	triggerClassName?: string;
}

export function EventDialog({
	value,
	onChange,
	triggerClassName,
}: EventDialogProps) {
	const [open, setOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [customEvent, setCustomEvent] = React.useState("");
    const [recentEvents, setRecentEvents] = React.useState<string[]>([]);

    React.useEffect(() => {
        try {
            const raw = localStorage.getItem("recent_events_v1");
            if (raw) {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr)) {
                    setRecentEvents(arr.filter((x) => typeof x === "string").slice(0, 5));
                }
            }
        } catch {}
    }, []);

	const filtered = events.filter((e) =>
		e.toLowerCase().includes(searchQuery.toLowerCase()),
	);

    const handleSelect = (e: string) => {
		onChange?.(e);
		setOpen(false);
		setSearchQuery("");
        const next = [e, ...recentEvents.filter((x) => x !== e)].slice(0, 5);
        setRecentEvents(next);
        try { localStorage.setItem("recent_events_v1", JSON.stringify(next)); } catch {}
	};

	const handleSubmit = (ev: React.FormEvent) => {
		ev.preventDefault();
		if (customEvent.trim()) {
			handleSelect(customEvent.trim());
			setCustomEvent("");
		}
	};

	const label = value || "イベントを選択";

	return (
		<div className="flex">
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						variant="outline"
						className={cn("flex-1 justify-between", triggerClassName)}
					>
						{label}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</DialogTrigger>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>イベントを選択</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">イベントを検索</label>
							<Input
								placeholder="イベントを検索..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">
								新しいイベントを追加
							</label>
							<form onSubmit={handleSubmit} className="flex gap-2">
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

                        {recentEvents.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">最近使ったイベント</label>
                                <div className="flex flex-wrap gap-2">
                                    {recentEvents.map((ev) => (
                                        <button
                                            key={ev}
                                            type="button"
                                            onClick={() => handleSelect(ev)}
                                            className={cn(
                                                "px-3 py-1 rounded-full border text-sm hover:bg-gray-100",
                                                value === ev && "bg-blue-50 border-blue-200",
                                            )}
                                        >
                                            {ev}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

						<div className="space-y-2">
							<label className="text-sm font-medium">
								よく使われるイベント
							</label>
							<ScrollArea className="h-64">
								<div className="space-y-1">
									{filtered.length > 0 ? (
										filtered.map((ev) => (
											<button
												key={ev}
												onClick={() => handleSelect(ev)}
												className={cn(
													"w-full flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors text-left",
													value === ev && "bg-blue-50 border border-blue-200",
												)}
												type="button"
											>
												<Calendar className="h-4 w-4 text-gray-500" />
												<span className="flex-1">{ev}</span>
												{value === ev && (
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
