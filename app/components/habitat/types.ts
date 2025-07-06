import type { FabricObject } from "fabric";

export interface EraGroup {
	era: string;
	elements: HabitatElement[];
}

export interface HabitatElement {
	id: string;
	lat: number;
	lng: number;
	color: string;
	size: number;
	shape: 'circle' | 'text';
	label?: string;
	maxR?: number;
	text?: string;
	fontSize?: number;
}

export interface FabricHabitatEditorProps {
	habitatData?: EraGroup[] | HabitatElement[];
	onSave?: (data: EraGroup[]) => void;
	showMapSelector?: boolean;
	width?: number;
	height?: number;
	onMapChange?: (mapFile: string) => void;
}



export type FabricObjectWithHabitatId = FabricObject & { habitatPointId?: string }; 