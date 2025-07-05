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



describe('生息地データの時代構造', () => {
  describe('時代グループ構造', () => {
    it('時代グループ構造が正しく作成される', () => {
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
            },
            {
              id: 'point2',
              lat: 6.6,
              lng: -14.22,
              color: '#ff0000',
              size: 20,
              shape: 'circle'
            }
          ]
        }
      ];

      expect(eraGroups).toHaveLength(1);
      expect(eraGroups[0].era).toBe('中生代');
      expect(eraGroups[0].elements).toHaveLength(2);
      expect(eraGroups[0].elements[0].id).toBe('point1');
      expect(eraGroups[0].elements[1].id).toBe('point2');
    });

    it('異なる時代のグループが正しく作成される', () => {
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
        },
        {
          era: '新生代',
          elements: [
            {
              id: 'point2',
              lat: 6.6,
              lng: -14.22,
              color: '#ff0000',
              size: 20,
              shape: 'circle'
            }
          ]
        }
      ];

      expect(eraGroups).toHaveLength(2);
      expect(eraGroups[0].era).toBe('中生代');
      expect(eraGroups[0].elements).toHaveLength(1);
      expect(eraGroups[1].era).toBe('新生代');
      expect(eraGroups[1].elements).toHaveLength(1);
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