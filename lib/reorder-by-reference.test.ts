import { describe, it, expect } from 'vitest';
import { reorderByReference } from './reorder-by-reference';

describe('reorderByReference', () => {
  it('기준 순서대로 재정렬', () => {
    // Jeju #4-2 Package D의 order가 다른 패키지랑 겹쳐서(0, 0) A,D,B,C로
    // 잘못 나오던 걸 App.jsx 원본 순서(A,B,C,D)에 맞춰 고친 것과 같은 케이스
    const items = [{ name: 'D' }, { name: 'A' }, { name: 'C' }, { name: 'B' }];
    const result = reorderByReference(items, (i) => i.name, ['A', 'B', 'C', 'D']);
    expect(result.map((i) => i.name)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('기준 순서에 없는 항목은 결과에서 제외', () => {
    const items = [{ name: 'A' }, { name: 'X' }, { name: 'B' }];
    const result = reorderByReference(items, (i) => i.name, ['A', 'B']);
    expect(result.map((i) => i.name)).toEqual(['A', 'B']);
  });

  it('items에 없는 키가 기준 순서에 있으면 조용히 건너뜀', () => {
    const items = [{ name: 'A' }];
    const result = reorderByReference(items, (i) => i.name, ['A', 'B']);
    expect(result.map((i) => i.name)).toEqual(['A']);
  });
});
