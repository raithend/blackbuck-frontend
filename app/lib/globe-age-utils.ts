import type { EraGroup } from "@/app/components/habitat/types";
import geologicalAgesData from "@/app/data/geological-ages.json";

// 地質時代の名前からIDを取得する関数
export const getAgeIdsByName = (ageName: string): number[] => {
	const ids: number[] = [];

	// すべてのera, period, epochを走査
	for (const era of geologicalAgesData.eras) {
		// eraの名前と一致する場合、そのeraに属するすべてのageのIDを取得
		if (era.name === ageName) {
			console.log(`era "${ageName}" に一致: すべてのageのIDを取得`);
			for (const period of era.periods) {
				for (const epoch of period.epochs) {
					if (epoch.ages) {
						for (const age of epoch.ages) {
							ids.push(Number.parseInt(age.id));
						}
					}
				}
			}
		}

		for (const period of era.periods) {
			// periodの名前と一致する場合、そのperiodに属するすべてのageのIDを取得
			if (period.name === ageName) {
				console.log(
					`period "${ageName}" に一致: そのperiodに属するすべてのageのIDを取得`,
				);
				for (const epoch of period.epochs) {
					if (epoch.ages) {
						for (const age of epoch.ages) {
							ids.push(Number.parseInt(age.id));
						}
					}
				}
			}
			for (const epoch of period.epochs) {
				// epochの名前と一致する場合、そのepochに属するageのIDをすべて取得
				if (epoch.name === ageName) {
					console.log(
						`epoch "${ageName}" に一致: そのepochに属するすべてのageのIDを取得`,
					);
					if (epoch.ages) {
						for (const age of epoch.ages) {
							ids.push(Number.parseInt(age.id));
						}
					}
				}
				// ageの名前と一致する場合、そのageのIDを取得
				if (epoch.ages) {
					for (const age of epoch.ages) {
						if (age.name === ageName) {
							console.log(`age "${ageName}" に一致: ID ${age.id} を取得`);
							ids.push(Number.parseInt(age.id));
						}
					}
				}
			}
		}
	}

	console.log(`getAgeIdsByName("${ageName}") の結果:`, ids);
	return ids;
};

// 生息地情報の時代からID配列を作成する関数
export const getHabitatEraIds = (eraGroups: EraGroup[]): number[] => {
	const allIds: number[] = [];

	if (!eraGroups || eraGroups.length === 0) {
		console.log("=== 生息地時代ID配列 ===");
		console.log("eraGroupsが空のため、空配列を返します");
		return allIds;
	}

	console.log("=== 生息地時代ID配列 ===");
	console.log(
		"eraGroups:",
		eraGroups.map((g) => g.era),
	);

	for (const eraGroup of eraGroups) {
		console.log(`\n--- ${eraGroup.era} の処理 ---`);
		const ids = getAgeIdsByName(eraGroup.era);
		allIds.push(...ids);
		console.log(`${eraGroup.era} のID配列:`, ids);
		console.log(`${eraGroup.era} のID配列の長さ:`, ids.length);
	}

	console.log("\n生息地時代ID配列（重複除去前）:", allIds);
	console.log("生息地時代ID配列（重複除去前）の長さ:", allIds.length);

	// 重複を除去
	const uniqueIds = [...new Set(allIds)];
	console.log("生息地時代ID配列（重複除去後）:", uniqueIds);
	console.log("生息地時代ID配列（重複除去後）の長さ:", uniqueIds.length);

	return uniqueIds;
};

// 配列に重複要素があるかチェックする関数
export const hasOverlap = (arr1: number[], arr2: number[]): boolean => {
	if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) {
		return false;
	}

	const set2 = new Set(arr2);
	const overlap = arr1.some((id) => set2.has(id));

	console.log("=== 重複チェック ===");
	console.log("arr1:", arr1);
	console.log("arr2:", arr2);
	console.log("重複あり:", overlap);

	return overlap;
};
