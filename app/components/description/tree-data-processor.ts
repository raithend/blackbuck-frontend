import { load } from 'js-yaml';
import treeDataYaml from '@/app/data/tree-data.yml';
import geologicalAgesData from '@/app/data/geological-ages.json';

interface TreeNode {
  name: string;
  from?: string;
  to?: string;
  children?: TreeNode[];
}

// 地質時代の名前からIDを取得する関数
const getAgeIdsByName = (ageName: string): number[] => {
  const ids: number[] = [];
  
  // すべてのera, period, epochを走査
  for (const era of geologicalAgesData.eras) {
    for (const period of era.periods) {
      // periodの名前と一致する場合、そのperiodに属するすべてのageのIDを取得
      if (period.name === ageName) {
        for (const epoch of period.epochs) {
          if (epoch.ages) {
            for (const age of epoch.ages) {
              ids.push(parseInt(age.id));
            }
          }
        }
      }
      for (const epoch of period.epochs) {
        // epochの名前と一致する場合、そのepochに属するageのIDをすべて取得
        if (epoch.name === ageName) {
          if (epoch.ages) {
            for (const age of epoch.ages) {
              ids.push(parseInt(age.id));
            }
          }
        }
        // ageの名前と一致する場合、そのageのIDを取得
        if (epoch.ages) {
          for (const age of epoch.ages) {
            if (age.name === ageName) {
              ids.push(parseInt(age.id));
            }
          }
        }
      }
    }
  }
  
  return ids;
};

// 地質時代の範囲内のIDを取得する関数
const getAgeIdsInRange = (fromAge: string, toAge: string): number[] => {
  const fromIds = getAgeIdsByName(fromAge);
  const toIds = getAgeIdsByName(toAge);
  
  if (fromIds.length === 0 || toIds.length === 0) {
    return [];
  }
  
  // 範囲内の最小IDと最大IDを取得
  const minId = Math.min(...fromIds, ...toIds);
  const maxId = Math.max(...fromIds, ...toIds);
  
  // すべてのageのIDを取得
  const allAgeIds: number[] = [];
  for (const era of geologicalAgesData.eras) {
    for (const period of era.periods) {
      for (const epoch of period.epochs) {
        if (epoch.ages) {
          for (const age of epoch.ages) {
            if (age.id) {
              allAgeIds.push(parseInt(age.id));
            }
          }
        }
      }
    }
  }
  
  // 範囲内のIDを取得
  return allAgeIds.filter(id => id >= minId && id <= maxId);
};

// 配列に重複要素があるかチェックする関数
const hasOverlap = (arr1: number[], arr2: number[]): boolean => {
  const set2 = new Set(arr2);
  return arr1.some(id => set2.has(id));
};

// ノードをフィルタリングする関数
const filterNodeByAge = (node: TreeNode, selectedAgeIds: number[]): TreeNode | null => {
  // ノード自体の表示判定
  let shouldDisplayNode = false;
  
  if (!node.from && !node.to) {
    // from, toのどちらも存在しない場合は常に表示
    shouldDisplayNode = true;
  } else if (node.from && !node.to) {
    // fromのみ存在する場合、その時代より先の時代で表示
    const fromIds = getAgeIdsByName(node.from);
    if (fromIds.length > 0) {
      shouldDisplayNode = selectedAgeIds.some(id => id <= Math.min(...fromIds));
    }
  } else if (!node.from && node.to) {
    // toのみ存在する場合、その時代より前の時代で表示
    const toIds = getAgeIdsByName(node.to);
    if (toIds.length > 0) {
      shouldDisplayNode = selectedAgeIds.some(id => id >= Math.max(...toIds));
    }
  } else if (node.from && node.to) {
    // from, toのどちらも存在する場合、指定する時代で表示
    const ageRangeIds = getAgeIdsInRange(node.from, node.to);
    shouldDisplayNode = hasOverlap(ageRangeIds, selectedAgeIds);
  }

  // 親ノードが非表示の場合、子ノードもすべて非表示
  if (!shouldDisplayNode) {
    return null;
  }

  // 子ノードを再帰的にフィルタリング
  const filteredChildren = node.children
    ?.map(child => filterNodeByAge(child, selectedAgeIds))
    .filter((child): child is TreeNode => child !== null) || [];

  // ノードの表示判定
  if (shouldDisplayNode || filteredChildren.length > 0) {
    // ノード自体が表示されるか、表示される子ノードがある場合は、フィルタリングされた子ノードを含めて返す
    return {
      ...node,
      children: filteredChildren
    };
  }

  return null;
};

// メインの処理関数
export const processTreeData = (selectedAgeIds: number[]): TreeNode | null => {
  // YAMLデータをパース
  const parsedData = load(treeDataYaml) as TreeNode;

  // データをフィルタリング
  return filterNodeByAge(parsedData, selectedAgeIds);
}; 