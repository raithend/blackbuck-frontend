"use client";

import { Button } from "@/app/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/app/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/app/components/ui/popover";
import { cn } from "@/app/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { famousEvents } from "./events.ts.d/famous-events";

const events = famousEvents;

interface EventComboboxProps {
	value?: string;
	onChange?: (value: string) => void;
}

export function EventCombobox({ value, onChange }: EventComboboxProps) {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between"
				>
					{value || "イベントを選択"}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0">
				<Command>
					<CommandInput placeholder="イベントを検索" />
					<CommandList>
						<CommandEmpty>イベントが見つかりません</CommandEmpty>
						<CommandGroup>
							{events.map((event) => (
								<CommandItem
									key={event}
									value={event}
									onSelect={(currentValue) => {
										onChange?.(currentValue === value ? "" : currentValue);
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === event ? "opacity-100" : "opacity-0",
										)}
									/>
									{event}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
} 