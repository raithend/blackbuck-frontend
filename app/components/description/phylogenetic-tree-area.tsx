import { PhylogeneticTree } from "./phylogenetic-tree";

interface PhylogeneticTreeAreaProps {
	customTreeFile?: string;
	customTreeContent?: string;
}

export default function PhylogeneticTreeArea({ customTreeFile, customTreeContent }: PhylogeneticTreeAreaProps) {
	return (
		<div className="h-[calc(100vh-4rem)]">
			<PhylogeneticTree customTreeFile={customTreeFile} customTreeContent={customTreeContent} />
		</div>
	);
}
