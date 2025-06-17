"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";

interface GeologicalAgeContextType {
	selectedMap: string;
	selectedAgeIds: number[];
	setSelectedMap: (map: string) => void;
	setSelectedAgeIds: (ids: number[]) => void;
}

const GeologicalAgeContext = createContext<GeologicalAgeContextType>({
	selectedMap: "",
	selectedAgeIds: [],
	setSelectedMap: () => {},
	setSelectedAgeIds: () => {},
});

export function GeologicalAgeProvider({
	children,
}: { children: React.ReactNode }) {
	const [selectedMap, setSelectedMap] = useState<string>("");
	const [selectedAgeIds, setSelectedAgeIds] = useState<number[]>([]);

	return (
		<GeologicalAgeContext.Provider
			value={{ selectedMap, selectedAgeIds, setSelectedMap, setSelectedAgeIds }}
		>
			{children}
		</GeologicalAgeContext.Provider>
	);
}

export function useGeologicalAge() {
	const context = useContext(GeologicalAgeContext);
	if (!context) {
		throw new Error(
			"useGeologicalAge must be used within a GeologicalAgeProvider",
		);
	}
	return context;
}
