"use client";

import type React from "react";
import { createContext, useContext, useState, useMemo, useCallback } from "react";

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

	// 関数をメモ化
	const memoizedSetSelectedMap = useCallback((map: string) => {
		console.log('GeologicalAgeContext - setSelectedMap呼び出し:', map);
		setSelectedMap(map);
	}, []);

	const memoizedSetSelectedAgeIds = useCallback((ids: number[]) => {
		console.log('GeologicalAgeContext - setSelectedAgeIds呼び出し:', ids);
		setSelectedAgeIds(ids);
	}, []);

	// コンテキスト値をメモ化
	const contextValue = useMemo(() => ({
		selectedMap,
		selectedAgeIds,
		setSelectedMap: memoizedSetSelectedMap,
		setSelectedAgeIds: memoizedSetSelectedAgeIds,
	}), [selectedMap, selectedAgeIds, memoizedSetSelectedMap, memoizedSetSelectedAgeIds]);

	return (
		<GeologicalAgeContext.Provider value={contextValue}>
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
