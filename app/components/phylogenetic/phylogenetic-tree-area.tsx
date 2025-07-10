import { PhylogeneticTree } from "./phylogenetic-tree";
import { CreatorCard } from "../creator/creator-card";
import type { User } from "@/app/types/types";

interface PhylogeneticTreeAreaProps {
	customTreeFile?: string;
	customTreeContent?: string;
	creator?: User;
}

export default function PhylogeneticTreeArea({ 
	customTreeFile, 
	customTreeContent,
	creator 
}: PhylogeneticTreeAreaProps) {
	// デバッグ出力
	console.log('PhylogeneticTreeArea - customTreeFile:', customTreeFile);
	console.log('PhylogeneticTreeArea - customTreeContent:', customTreeContent);
	
	return (
		<div className="h-[calc(100vh-4rem)] relative">
			<PhylogeneticTree customTreeFile={customTreeFile} customTreeContent={customTreeContent} />
			{creator && (
				<div className="absolute bottom-4 right-4 z-10">
					<CreatorCard user={creator} />
				</div>
			)}
		</div>
	);
}
