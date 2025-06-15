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

import { aquarium } from "./location.ts.d/aquarium";
import { famousLocations } from "./location.ts.d/famous-locations";
import { museum } from "./location.ts.d/museum";
import { prefecture } from "./location.ts.d/prefecture";
import { zoo } from "./location.ts.d/zoo";

const locations = famousLocations;

interface LocationComboboxProps {
	value?: string;
	onChange?: (value: string) => void;
}

export function LocationCombobox({ value, onChange }: LocationComboboxProps) {
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
					{value || "撮影地を選択"}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0">
				<Command>
					<CommandInput placeholder="撮影地を検索" />
					<CommandList>
						<CommandEmpty>撮影地が見つかりません</CommandEmpty>
						<CommandGroup>
							{locations.map((location) => (
								<CommandItem
									key={location}
									value={location}
									onSelect={(currentValue) => {
										onChange?.(currentValue === value ? "" : currentValue);
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === location ? "opacity-100" : "opacity-0",
										)}
									/>
									{location}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
