"use client";

import { TreeOfLife } from "@/components/chart";
import { GeologicalTimeCard } from '@/components/geological-time-card';

export default function Page() {
	return (
		<div>
			<div className="fixed top-20 right-4 z-50">
				<GeologicalTimeCard />
			</div>
			<TreeOfLife />
		</div>
	);
}
