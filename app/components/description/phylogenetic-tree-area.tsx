import { PhylogeneticTree } from "./phylogenetic-tree";

interface PhylogeneticTreeAreaProps {
	customTreeFile?: string;
	customTreeContent?: string;
}

export default function PhylogeneticTreeArea({ customTreeFile, customTreeContent }: PhylogeneticTreeAreaProps) {
	// デバッグ出力
	console.log('PhylogeneticTreeArea - customTreeFile:', customTreeFile);
	console.log('PhylogeneticTreeArea - customTreeContent:', customTreeContent);
	
	return (
		<div className="h-[calc(100vh-4rem)]">
			<PhylogeneticTree customTreeFile={customTreeFile} customTreeContent={customTreeContent} />
		</div>
	);
}
