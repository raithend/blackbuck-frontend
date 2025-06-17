import { GeologicalAgeCard } from "./geological-age-card";
import { GeologicalAgeProvider } from "./geological-context";
import GlobeArea from "./globe-area";
import PhylogeneticTreeArea from "./phylogenetic-tree-area";

export default function DescriptionArea() {
	return (
		<GeologicalAgeProvider>
			<div className="fixed top-20 right-4 z-50">
				<GeologicalAgeCard />
			</div>
			<PhylogeneticTreeArea />
			<GlobeArea />
		</GeologicalAgeProvider>
	);
}
