"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const taxonomies = [
	{
		value: "哺乳綱",
		label: "哺乳綱",
	},
	{
		value: "爬虫綱",
		label: "爬虫綱",
	},
	{
		value: "鳥綱",
		label: "鳥綱",
	},
	{
		value: "両生綱",
		label: "両生綱",
	},
	{
		value: "硬骨魚綱",
		label: "硬骨魚綱",
	},
];

export function TaxonomyCombobox() {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState("");

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between"
				>
					{value
						? taxonomies.find((taxonomy) => taxonomy.value === value)?.label
						: "分類を選択"}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0">
				<Command>
					<CommandInput placeholder="分類を検索" />
					<CommandList>
						<CommandEmpty>分類が見つかりません</CommandEmpty>
						<CommandGroup>
							{taxonomies.map((taxonomy) => (
								<CommandItem
									key={taxonomy.value}
									value={taxonomy.value}
									onSelect={(currentValue) => {
										setValue(currentValue === value ? "" : currentValue);
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === taxonomy.value ? "opacity-100" : "opacity-0",
										)}
									/>
									{taxonomy.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
