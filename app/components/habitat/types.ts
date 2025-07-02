import type { Object as FabricObject } from "fabric";

export interface HabitatPoint {
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
	habitatData?: HabitatPoint[];
	onSave?: (data: HabitatPoint[]) => void;
	showMapSelector?: boolean;
	width?: number;
	height?: number;
	onMapChange?: (mapFile: string) => void;
}

export interface HabitatData {
	lat: number;
	lng: number;
	color: string;
	size: number;
	label?: string;
	maxR?: number;
	text?: string;
	fontSize?: number;
}

export type FabricObjectWithHabitatId = FabricObject & { habitatPointId?: string }; 