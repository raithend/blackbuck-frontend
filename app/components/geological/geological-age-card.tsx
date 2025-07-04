"use client";

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/app/components/ui/select";
import { Slider } from "@/app/components/ui/slider";
import { Button } from "@/app/components/ui/button";
import geologicalAgesData from "@/app/data/geological-ages.json";
import { useCallback, useEffect, useState } from "react";
import { useGeologicalAge } from "./geological-context";
import { Menu } from "lucide-react";

interface GeologicalAge {
	id: string;
	name: string;
	nameEn: string;
	startAge: number;
	endAge: number;
	description?: string;
	descriptionEn?: string;
	map?: string;
}

interface Epoch {
	id: string;
	name: string;
	nameEn: string;
	startAge: number;
	endAge: number;
	description?: string;
	descriptionEn?: string;
	ages?: GeologicalAge[];
	map?: string;
}

interface Period {
	id: string;
	name: string;
	nameEn: string;
	startAge: number;
	endAge: number;
	epochs: Epoch[];
	map?: string;
}

interface Era {
	id: string;
	name: string;
	nameEn: string;
	startAge: number;
	endAge: number;
	periods: Period[];
	map?: string;
}

export function GeologicalAgeCard({ enableMenu = true }: { enableMenu?: boolean }) {
	const { selectedMap, selectedAgeIds, setSelectedMap, setSelectedAgeIds } =
		useGeologicalAge();
	const [selectedEra, setSelectedEra] = useState<Era | undefined>(undefined);
	const [selectedPeriod, setSelectedPeriod] = useState<Period | undefined>(
		undefined,
	);
	const [selectedEpoch, setSelectedEpoch] = useState<Epoch | undefined>(
		undefined,
	);
	const [selectedAge, setSelectedAge] = useState<GeologicalAge | null>(null);
	const [isExpanded, setIsExpanded] = useState(!enableMenu);

	console.log('GeologicalAgeCard - selectedAgeIds:', selectedAgeIds);

	const handleEraChange = (eraId: string) => {
		console.log('handleEraChange呼び出し - eraId:', eraId);
		if (eraId === "none") {
			setSelectedEra(undefined);
			setSelectedPeriod(undefined);
			setSelectedEpoch(undefined);
			setSelectedAge(null);
			setSelectedAgeIds([]);
			setSelectedMap("");
			return;
		}
		const era = geologicalAgesData.eras.find((e) => e.id === eraId);
		if (era) {
			console.log('選択されたera:', era.name, 'ID:', era.id);
			setSelectedEra(era);
			setSelectedPeriod(undefined);
			setSelectedEpoch(undefined);
			setSelectedAge(null);
			const ageIds = getAgeIds(era);
			console.log('getAgeIds結果:', ageIds);
			setSelectedAgeIds(ageIds);
			if (era.map) {
				setSelectedMap(era.map);
			}
		}
	};

	const handlePeriodChange = (periodId: string) => {
		if (periodId === "none") {
			setSelectedPeriod(undefined);
			setSelectedEpoch(undefined);
			setSelectedAge(null);
			setSelectedAgeIds([]);
			setSelectedMap("");
			return;
		}
		const period = selectedEra?.periods.find((p) => p.id === periodId);
		if (period) {
			setSelectedPeriod(period);
			setSelectedEpoch(period.epochs[0]);
			setSelectedAge(period.epochs[0].ages?.[0] || null);
			const ageIds = getAgeIds(period);
			setSelectedAgeIds(ageIds);
			if (period.map) {
				setSelectedMap(period.map);
			}
		}
	};

	const handleEpochChange = (epochId: string) => {
		if (epochId === "none") {
			setSelectedEpoch(undefined);
			setSelectedAge(null);
			setSelectedAgeIds([]);
			setSelectedMap("");
			return;
		}
		if (selectedPeriod) {
			const epoch = selectedPeriod.epochs.find((e) => e.id === epochId);
			if (epoch) {
				setSelectedEpoch(epoch);
				setSelectedAge(epoch.ages?.[0] || null);
				const ageIds = getAgeIds(epoch);
				setSelectedAgeIds(ageIds);
				if (epoch.map) {
					setSelectedMap(epoch.map);
				}
			}
		}
	};

	const handleAgeChange = (ageId: string) => {
		if (ageId === "none") {
			setSelectedAge(null);
			setSelectedAgeIds([]);
			setSelectedMap("");
			return;
		}
		if (selectedEpoch?.ages) {
			const age = selectedEpoch.ages.find((a) => a.id === ageId);
			if (age) {
				setSelectedAge(age);
				const ageIds = getAgeIds(age);
				setSelectedAgeIds(ageIds);
				if (age.map) {
					setSelectedMap(age.map);
				}
			}
		}
	};

	// スライダーの値から時代を探す関数
	const findAgeBySliderValue = useCallback(
		(value: number) => {
			const reversedValue = 103 - value;
			const ageId = reversedValue.toString();

			// すべての時代から対応するageを探す
			for (const era of geologicalAgesData.eras) {
				for (const period of era.periods) {
					for (const epoch of period.epochs) {
						const age = epoch.ages?.find((a) => a.id === ageId);
						if (age) {
							setSelectedEra(era);
							setSelectedPeriod(period);
							setSelectedEpoch(epoch);
							setSelectedAge(age);
							if (age.map) {
								setSelectedMap(age.map);
							}
							return age;
						}
					}
				}
			}
			return null;
		},
		[setSelectedMap],
	);

	// 時代のID配列を取得する関数（修正版）
	const getAgeIds = useCallback((age: GeologicalAge | Epoch | Period | Era | null): number[] => {
		if (!age) return [];

		// 最下位の時代（age）の場合
		if (age.id) {
			return [Number.parseInt(age.id)];
		}

		// 上位の時代（era, period, epoch）の場合
		// 最も上位の階層のIDのみを含める
		if (age.id) {
			return [Number.parseInt(age.id)];
		}

		// 階層を判定して適切なIDを返す
		if ('ages' in age && age.ages) {
			// epochの場合、epochのIDのみを返す
			return age.id ? [Number.parseInt(age.id)] : [];
		}
		if ('epochs' in age) {
			// periodの場合、periodのIDのみを返す
			return age.id ? [Number.parseInt(age.id)] : [];
		}
		if ('periods' in age) {
			// eraの場合、eraのIDのみを返す
			return age.id ? [Number.parseInt(age.id)] : [];
		}

		return [];
	}, []);

	const handleSliderChange = useCallback(
		(value: number[]) => {
			const age = findAgeBySliderValue(value[0]);
			if (age) {
				// 選択された時代のID配列を更新
				const ageIds = getAgeIds(age);
				setSelectedAgeIds(ageIds);
			}
		},
		[findAgeBySliderValue, setSelectedAgeIds, getAgeIds],
	);

	// 初期状態で最新の時代を選択
	useEffect(() => {
		const age = findAgeBySliderValue(102);
		if (age) {
			const ageIds = getAgeIds(age);
			setSelectedAgeIds(ageIds);
		}
	}, [findAgeBySliderValue, getAgeIds, setSelectedAgeIds]); // 依存配列を修正

	function formatAgeRange(startMa: number, endMa: number): string {
		const startYear = Math.round(startMa * 1_000_000);
		const endYear = Math.round(endMa * 1_000_000);

		const formatYear = (year: number): string => {
			if (year === 0) return "現代";
			if (year <= 2000) return `${year}年前`;
			if (year < 10_000) return `${year}年前`;
			if (year < 1_000_000) return `${Math.round(year / 10_000)}万年前`;
			return `${(year / 1_000_000).toFixed(2).replace(/\.00$/, "")}億年前`;
		};

		// どちらかが1万年前より新しい場合は年単位で表示
		if (startYear <= 10_000 || endYear <= 10_000) {
			return `${formatYear(startYear)}〜${formatYear(endYear)}`;
		}

		// 1万年前より古い場合は「○○万年前」表記
		const startMan = Math.round(startYear / 10_000);
		const endMan = Math.round(endYear / 10_000);
		return `${startMan}万年前〜${endMan}万年前`;
	}

	return (
		<Card className={`transition-all duration-300 ${isExpanded ? 'w-72' : 'w-12'}`}>
			<CardHeader className={isExpanded ? '' : 'p-2'}>
				<div className="flex items-center justify-between">
					{isExpanded && <CardTitle>地質時代</CardTitle>}
					{enableMenu && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsExpanded(!isExpanded)}
							className="p-1"
						>
							<Menu className="w-4 h-4" />
						</Button>
					)}
				</div>
			</CardHeader>
			{isExpanded && (
				<>
					<CardContent>
						<div className="space-y-4">
							<div className="flex flex-col space-y-4">
								<Select
									value={selectedEra?.id || "none"}
									onValueChange={handleEraChange}
								>
									<SelectTrigger>
										<SelectValue placeholder="代を選択" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">---</SelectItem>
										{geologicalAgesData.eras.map((era) => (
											<SelectItem key={era.id} value={era.id}>
												{era.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<Select
									value={selectedPeriod?.id || "none"}
									onValueChange={handlePeriodChange}
									disabled={!selectedEra}
								>
									<SelectTrigger>
										<SelectValue placeholder="紀を選択" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">---</SelectItem>
										{selectedEra?.periods.map((period) => (
											<SelectItem key={period.id} value={period.id}>
												{period.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<Select
									value={selectedEpoch?.id || "none"}
									onValueChange={handleEpochChange}
									disabled={!selectedPeriod}
								>
									<SelectTrigger>
										<SelectValue placeholder="世を選択" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">---</SelectItem>
										{selectedPeriod?.epochs.map((epoch) => (
											<SelectItem key={epoch.id} value={epoch.id}>
												{epoch.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<Select
									value={selectedAge?.id || "none"}
									onValueChange={handleAgeChange}
									disabled={!selectedEpoch || !selectedEpoch.ages}
								>
									<SelectTrigger>
										<SelectValue placeholder="期を選択" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">---</SelectItem>
										{selectedEpoch?.ages?.map((age) => (
											<SelectItem key={age.id} value={age.id}>
												{age.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">年代:</span>
								<span className="text-sm font-medium">
									{(() => {
										const start =
											selectedAge?.startAge ??
											selectedEpoch?.startAge ??
											selectedPeriod?.startAge ??
											selectedEra?.startAge;
										const end =
											selectedAge?.endAge ??
											selectedEpoch?.endAge ??
											selectedPeriod?.endAge ??
											selectedEra?.endAge;
										if (start !== undefined && end !== undefined) {
											return formatAgeRange(start, end);
										}
										return "-";
									})()}
								</span>
							</div>
						</div>
					</CardContent>
					<CardFooter className="flex flex-col space-y-4">
						<div className="w-full">
							<Slider
								defaultValue={[102]}
								max={102}
								min={1}
								onValueChange={handleSliderChange}
							/>
						</div>
					</CardFooter>
				</>
			)}
		</Card>
	);
}