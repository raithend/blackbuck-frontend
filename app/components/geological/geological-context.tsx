"use client";

import type React from "react";
import {
	createContext,
	memo,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";

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

// プロバイダーコンポーネントをメモ化
const GeologicalAgeProviderComponent = memo(
	({ children }: { children: React.ReactNode }) => {
		const [selectedMap, setSelectedMap] = useState<string>("");
		const [selectedAgeIds, setSelectedAgeIds] = useState<number[]>([]);

		// 状態の安定化のためのref
		const stateRef = useRef({
			selectedMap,
			selectedAgeIds,
		});

		// 現在の状態をrefに同期
		stateRef.current = {
			selectedMap,
			selectedAgeIds,
		};

		// 関数をメモ化して安定化
		const setSelectedMapWithLog = useCallback((map: string) => {
			if (process.env.NODE_ENV === "development") {
				console.log("GeologicalAgeContext - setSelectedMap呼び出し:", map);
			}
			setSelectedMap(map);
		}, []);

		const setSelectedAgeIdsWithLog = useCallback((ageIds: number[]) => {
			if (process.env.NODE_ENV === "development") {
				console.log(
					"GeologicalAgeContext - setSelectedAgeIds呼び出し:",
					ageIds,
				);
			}
			setSelectedAgeIds(ageIds);
		}, []);

		// コンテキスト値をメモ化（依存関係を最小限に）
		const contextValue = useMemo(
			() => ({
				selectedMap,
				selectedAgeIds,
				setSelectedMap: setSelectedMapWithLog,
				setSelectedAgeIds: setSelectedAgeIdsWithLog,
			}),
			[
				selectedMap,
				selectedAgeIds,
				setSelectedMapWithLog,
				setSelectedAgeIdsWithLog,
			],
		);

		return (
			<GeologicalAgeContext.Provider value={contextValue}>
				{children}
			</GeologicalAgeContext.Provider>
		);
	},
);

// 表示名を設定
GeologicalAgeProviderComponent.displayName = "GeologicalAgeProviderComponent";

// エクスポート用のラッパー
export function GeologicalAgeProvider({
	children,
}: { children: React.ReactNode }) {
	return (
		<GeologicalAgeProviderComponent>{children}</GeologicalAgeProviderComponent>
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
