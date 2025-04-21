'use client'

import type { LucideIcon } from "lucide-react";

interface NavbarItemProps {
	label: string;
	icon: LucideIcon;
	active?: boolean;
}

export function NavbarItem({
	label,
	icon: Icon,
	active = false,
}: NavbarItemProps) {
	return (
		<div className={`flex items-center p-2 md:p-6 hover:bg-accent hover:text-accent-foreground ${active ? 'bg-accent text-accent-foreground' : ''}`}>
			<Icon className="h-8 w-8" />
			<div className="hidden lg:block text-xl ml-4">{label}</div>
		</div>
	);
}
