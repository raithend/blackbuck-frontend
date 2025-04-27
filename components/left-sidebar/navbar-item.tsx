'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarItemProps {
	label: string;
	icon: React.ComponentType;
	url: string;
	isActive?: boolean;
}

export function NavbarItem({
	label,
	icon: Icon,
	url,
	isActive = true,
}: NavbarItemProps) {
	const pathname = usePathname();
	isActive = (pathname !== url) && isActive;

	if (!isActive) {
		return (
			<div className="flex items-center p-2 md:p-6 hover:bg-accent hover:text-accent-foreground2">
				<Icon className="w-8 h-8"/>
				<div className="hidden lg:block text-xl ml-4">{label}</div>
			</div>
		);
	}

	return (
		<Link href={url}>
			<div className="flex items-center p-2 md:p-6 hover:bg-accent hover:text-accent-foreground2">
				<Icon className="w-8 h-8"/>
				<div className="hidden lg:block text-xl ml-4">{label}</div>
			</div>		
		</Link>
	);
}
