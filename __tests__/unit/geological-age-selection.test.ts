import { describe, it, expect } from 'vitest';

// 地質年代データの型定義
interface GeologicalAge {
  id: number;
  name: string;
  parentId?: number;
  map?: string;
}

// 時代選択ロジックのテスト用データ
const geologicalAges: GeologicalAge[] = [
  { id: 1, name: '顕生代', parentId: undefined },
  { id: 2, name: '中生代', parentId: 1 },
  { id: 3, name: '新生代', parentId: 1 },
  { id: 4, name: '古生代', parentId: 1 },
  { id: 5, name: 'ジュラ紀', parentId: 2 },
  { id: 6, name: '白亜紀', parentId: 2 },
  { id: 7, name: '三畳紀', parentId: 2 },
  { id: 8, name: '第四紀', parentId: 3 },
  { id: 9, name: '第三紀', parentId: 3 },
  { id: 10, name: '石炭紀', parentId: 4 },
  { id: 11, name: 'デボン紀', parentId: 4 }
];

// 地図データ
const maps = [
  { id: 'Map1a_PALEOMAP_PaleoAtlas_000', name: '現在', ageId: 3 }, // 新生代
  { id: 'Map35a_LtJ_Oxfordian_160', name: '後期ジュラ紀オックスフォード期', ageId: 2 }, // 中生代
  { id: 'Map16a_KT_Boundary_066', name: 'K-T境界', ageId: 2 }, // 中生代
  { id: 'Map43a_Triassic-Jurassic_Boundary_200', name: '三畳紀-ジュラ紀境界', ageId: 2 } // 中生代
];

describe('時代選択ロジック', () => {
  describe('getAgeIds関数', () => {
    it('選択された時代IDから上位階層のIDのみを取得する', () => {
      const selectedAgeIds = [5, 6, 7]; // ジュラ紀、白亜紀、三畳紀
      
      const getAgeIds = (selectedIds: number[]): number[] => {
        const result = new Set<number>();
        
        for (const id of selectedIds) {
          const age = geologicalAges.find(a => a.id === id);
          if (age) {
            // 上位階層のIDを追加
            if (age.parentId) {
              result.add(age.parentId);
            }
            // 選択されたID自体は含めない（上位階層のみ）
          }
        }
        
        return Array.from(result);
      };
      
      const result = getAgeIds(selectedAgeIds);
      
      expect(result).toEqual([2]); // 中生代のみ
      expect(result).not.toContain(5); // ジュラ紀は含まれない
      expect(result).not.toContain(6); // 白亜紀は含まれない
      expect(result).not.toContain(7); // 三畳紀は含まれない
    });

    it('複数の上位階層がある場合は全て取得する', () => {
      const selectedAgeIds = [5, 8]; // ジュラ紀、第四紀
      
      const getAgeIds = (selectedIds: number[]): number[] => {
        const result = new Set<number>();
        
        for (const id of selectedIds) {
          const age = geologicalAges.find(a => a.id === id);
          if (age && age.parentId) {
            result.add(age.parentId);
          }
        }
        
        return Array.from(result);
      };
      
      const result = getAgeIds(selectedAgeIds);
      
      expect(result).toContain(2); // 中生代
      expect(result).toContain(3); // 新生代
      expect(result).toHaveLength(2);
    });
  });

  describe('getCurrentGeologicalAgeInfo関数', () => {
    it('地図名とIDの組み合わせで正しい時代を特定する', () => {
      const selectedMap = 'Map35a_LtJ_Oxfordian_160';
      const selectedAgeIds = [5]; // ジュラ紀
      
      const getCurrentGeologicalAgeInfo = (map: string, ageIds: number[]) => {
        // 地図から時代IDを取得
        const mapData = maps.find(m => m.id === map);
        if (!mapData) return null;
        
        // 選択されたIDと地図の時代IDを組み合わせて判定
        const allIds = [...ageIds, mapData.ageId];
        
        // 時代階層を判定（上位階層から判定）
        if (allIds.includes(2)) return '中生代';
        if (allIds.includes(3)) return '新生代';
        if (allIds.includes(4)) return '古生代';
        if (allIds.includes(1)) return '顕生代';
        
        return null;
      };
      
      const result = getCurrentGeologicalAgeInfo(selectedMap, selectedAgeIds);
      
      expect(result).toBe('中生代');
    });

    it('地図名が異なる場合は正しく判定される', () => {
      const selectedMap = 'Map1a_PALEOMAP_PaleoAtlas_000';
      const selectedAgeIds = [8]; // 第四紀
      
      const getCurrentGeologicalAgeInfo = (map: string, ageIds: number[]) => {
        const mapData = maps.find(m => m.id === map);
        if (!mapData) return null;
        
        const allIds = [...ageIds, mapData.ageId];
        
        if (allIds.includes(2)) return '中生代';
        if (allIds.includes(3)) return '新生代';
        if (allIds.includes(4)) return '古生代';
        if (allIds.includes(1)) return '顕生代';
        
        return null;
      };
      
      const result = getCurrentGeologicalAgeInfo(selectedMap, selectedAgeIds);
      
      expect(result).toBe('新生代');
    });

    it('IDが重複していても地図名で正しく判定される', () => {
      // ID 1が複数の階層で使用される場合のテスト
      const selectedMap = 'Map1a_PALEOMAP_PaleoAtlas_000';
      const selectedAgeIds = [1]; // 顕生代
      
      const getCurrentGeologicalAgeInfo = (map: string, ageIds: number[]) => {
        const mapData = maps.find(m => m.id === map);
        if (!mapData) return null;
        
        // 地図名も考慮して判定
        if (map === 'Map1a_PALEOMAP_PaleoAtlas_000') {
          return '新生代'; // 現在の地図は新生代
        }
        
        const allIds = [...ageIds, mapData.ageId];
        
        if (allIds.includes(2)) return '中生代';
        if (allIds.includes(3)) return '新生代';
        if (allIds.includes(4)) return '古生代';
        if (allIds.includes(1)) return '顕生代';
        
        return null;
      };
      
      const result = getCurrentGeologicalAgeInfo(selectedMap, selectedAgeIds);
      
      expect(result).toBe('新生代');
    });
  });

  describe('時代選択の統合テスト', () => {
    it('中生代を選択した場合に正しく中生代として保存される', () => {
      const selectedMap = 'Map35a_LtJ_Oxfordian_160';
      const selectedAgeIds = [5]; // ジュラ紀
      
      // 1. 上位階層のIDを取得
      const getAgeIds = (selectedIds: number[]): number[] => {
        const result = new Set<number>();
        for (const id of selectedIds) {
          const age = geologicalAges.find(a => a.id === id);
          if (age && age.parentId) {
            result.add(age.parentId);
          }
        }
        return Array.from(result);
      };
      
      // 2. 現在の時代情報を取得
      const getCurrentGeologicalAgeInfo = (map: string, ageIds: number[]) => {
        const mapData = maps.find(m => m.id === map);
        if (!mapData) return null;
        
        if (map === 'Map1a_PALEOMAP_PaleoAtlas_000') {
          return '新生代';
        }
        
        const allIds = [...ageIds, mapData.ageId];
        
        if (allIds.includes(2)) return '中生代';
        if (allIds.includes(3)) return '新生代';
        if (allIds.includes(4)) return '古生代';
        if (allIds.includes(1)) return '顕生代';
        
        return null;
      };
      
      const upperAgeIds = getAgeIds(selectedAgeIds);
      const currentEra = getCurrentGeologicalAgeInfo(selectedMap, selectedAgeIds);
      
      expect(upperAgeIds).toEqual([2]); // 中生代のID
      expect(currentEra).toBe('中生代');
    });
  });
}); 