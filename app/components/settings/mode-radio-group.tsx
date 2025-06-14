"use client";

import { useTheme } from "next-themes";
import * as React from "react";

import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";

export function ModeRadioGroup() {
	const { setTheme } = useTheme();

	return (
		<RadioGroup defaultValue="option-three" className="flex gap-16">
			<div className="flex items-center space-x-2">
				<RadioGroupItem
					value="option-one"
					id="option-one"
					onClick={() => setTheme("light")}
				/>
				<Label htmlFor="option-one">ライト</Label>
			</div>
			<div className="flex items-center space-x-2">
				<RadioGroupItem
					value="option-two"
					id="option-two"
					onClick={() => setTheme("dark")}
				/>
				<Label htmlFor="option-two">ダーク</Label>
			</div>
			<div className="flex items-center space-x-2">
				<RadioGroupItem
					value="option-three"
					id="option-three"
					onClick={() => setTheme("system")}
				/>
				<Label htmlFor="option-three">システム</Label>
			</div>
		</RadioGroup>
	);
}
