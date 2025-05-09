import PhylogeneticTreeArea from './phylogenetic-tree-area';
import { GeologicalAgeCard } from './geological-age-card';
import { MapProvider } from './geological-context';
import GlobeArea from './globe-area';


export default function DescriptionArea() {
  return (
    <MapProvider>
      <div className="fixed top-20 right-4 z-50">
        <GeologicalAgeCard />
      </div>
      <PhylogeneticTreeArea />
      <GlobeArea />
    </MapProvider>
  );
}
