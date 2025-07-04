import { describe, it, expect } from 'vitest';

// 新しい時代グループ構造の型定義
interface EraGroupElement {
  id: string;
  lat: number;
  lng: number;
  color: string;
  size: number;
  shape: string;
  text?: string;
  fontSize?: number;
}

interface EraGroup {
  era: string;
  elements: EraGroupElement[];
}

// 生息地ポイントの型定義
interface HabitatPoint {
  id: string;
  lat: number;
  lng: number;
  color: string;
  size: number;
  shape: 'circle' | 'text';
  text?: string;
  fontSize?: number;
  geologicalAge?: {
    era?: string;
    period?: string;
    epoch?: string;
    age?: string;
    ageIds?: number[];
    map?: string;
  };
}

describe('生息地データの時代構造', () => {
  describe('時代グループ構造への変換', () => {
    it('複数のポイントを同じ時代でグループ化できる', () => {
      const habitatPoints: HabitatPoint[] = [
        {
          id: 'point1',
          lat: 25.8,
          lng: -30.06,
          color: '#ff0000',
          size: 20,
          shape: 'circle',
          geologicalAge: {
            era: '中生代',
            ageIds: [2],
            map: 'Map35a_LtJ_Oxfordian_160'
          }
        },
        {
          id: 'point2',
          lat: 6.6,
          lng: -14.22,
          color: '#ff0000',
          size: 20,
          shape: 'circle',
          geologicalAge: {
            era: '中生代',
            ageIds: [2],
            map: 'Map35a_LtJ_Oxfordian_160'
          }
        }
      ];

      // 時代グループ構造に変換
      const eraGroups: EraGroup[] = [];
      
      for (const point of habitatPoints) {
        const era = point.geologicalAge?.era || "顕生代";
        const existingGroup = eraGroups.find(group => group.era === era);
        
        const element: EraGroupElement = {
          id: point.id,
          lat: point.lat,
          lng: point.lng,
          color: point.color,
          size: point.size,
          shape: point.shape,
          text: point.text,
          fontSize: point.fontSize
        };
        
        if (existingGroup) {
          existingGroup.elements.push(element);
        } else {
          eraGroups.push({
            era: era,
            elements: [element]
          });
        }
      }

      expect(eraGroups).toHaveLength(1);
      expect(eraGroups[0].era).toBe('中生代');
      expect(eraGroups[0].elements).toHaveLength(2);
      expect(eraGroups[0].elements[0].id).toBe('point1');
      expect(eraGroups[0].elements[1].id).toBe('point2');
    });

    it('異なる時代のポイントを別々のグループに分ける', () => {
      const habitatPoints: HabitatPoint[] = [
        {
          id: 'point1',
          lat: 25.8,
          lng: -30.06,
          color: '#ff0000',
          size: 20,
          shape: 'circle',
          geologicalAge: {
            era: '中生代',
            ageIds: [2],
            map: 'Map35a_LtJ_Oxfordian_160'
          }
        },
        {
          id: 'point2',
          lat: 6.6,
          lng: -14.22,
          color: '#ff0000',
          size: 20,
          shape: 'circle',
          geologicalAge: {
            era: '新生代',
            ageIds: [1],
            map: 'Map1a_PALEOMAP_PaleoAtlas_000'
          }
        }
      ];

      // 時代グループ構造に変換
      const eraGroups: EraGroup[] = [];
      
      for (const point of habitatPoints) {
        const era = point.geologicalAge?.era || "顕生代";
        const existingGroup = eraGroups.find(group => group.era === era);
        
        const element: EraGroupElement = {
          id: point.id,
          lat: point.lat,
          lng: point.lng,
          color: point.color,
          size: point.size,
          shape: point.shape,
          text: point.text,
          fontSize: point.fontSize
        };
        
        if (existingGroup) {
          existingGroup.elements.push(element);
        } else {
          eraGroups.push({
            era: era,
            elements: [element]
          });
        }
      }

      expect(eraGroups).toHaveLength(2);
      expect(eraGroups[0].era).toBe('中生代');
      expect(eraGroups[0].elements).toHaveLength(1);
      expect(eraGroups[1].era).toBe('新生代');
      expect(eraGroups[1].elements).toHaveLength(1);
    });

    it('時代情報がないポイントはデフォルト時代に分類される', () => {
      const habitatPoints: HabitatPoint[] = [
        {
          id: 'point1',
          lat: 25.8,
          lng: -30.06,
          color: '#ff0000',
          size: 20,
          shape: 'circle'
          // geologicalAgeなし
        }
      ];

      // 時代グループ構造に変換
      const eraGroups: EraGroup[] = [];
      
      for (const point of habitatPoints) {
        const era = point.geologicalAge?.era || "顕生代";
        const existingGroup = eraGroups.find(group => group.era === era);
        
        const element: EraGroupElement = {
          id: point.id,
          lat: point.lat,
          lng: point.lng,
          color: point.color,
          size: point.size,
          shape: point.shape,
          text: point.text,
          fontSize: point.fontSize
        };
        
        if (existingGroup) {
          existingGroup.elements.push(element);
        } else {
          eraGroups.push({
            era: era,
            elements: [element]
          });
        }
      }

      expect(eraGroups).toHaveLength(1);
      expect(eraGroups[0].era).toBe('顕生代');
      expect(eraGroups[0].elements).toHaveLength(1);
    });
  });

  describe('JSON変換', () => {
    it('時代グループ構造をJSON文字列に変換できる', () => {
      const eraGroups: EraGroup[] = [
        {
          era: '中生代',
          elements: [
            {
              id: 'point1',
              lat: 25.8,
              lng: -30.06,
              color: '#ff0000',
              size: 20,
              shape: 'circle'
            }
          ]
        }
      ];

      const jsonString = JSON.stringify(eraGroups);
      const parsed = JSON.parse(jsonString);

      expect(parsed).toEqual(eraGroups);
      expect(parsed[0].era).toBe('中生代');
      expect(parsed[0].elements[0].id).toBe('point1');
    });
  });
}); 