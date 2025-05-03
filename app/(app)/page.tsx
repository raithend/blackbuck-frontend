"use client";

import { TreeOfLife } from "@/components/chart";
import { GeologicalAgeCard } from '@/components/geological-age-card';

export default function Page() {
	return (
		<div>
			<div className="fixed top-20 right-4 z-50">
				<GeologicalAgeCard />
			</div>
			<TreeOfLife />
		</div>
	);
}
