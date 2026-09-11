import { describe, it, expect } from 'vitest';
import { groupIntoVariants } from './addon-variants';

describe('groupIntoVariants', () => {
  it('가격/설명이 모두 같으면 한 그룹으로 묶음', () => {
    const rows = [
      { packageId: 1, addonId: 10, order: 0, price: 100, desc: 'A' },
      { packageId: 2, addonId: 10, order: 0, price: 100, desc: 'A' },
    ];
    const groups = groupIntoVariants(rows);
    expect(groups).toHaveLength(1);
    expect(groups[0].rows).toHaveLength(2);
  });

  it('가격이 다르면 별개 그룹(variant)으로 분리', () => {
    // 같은 이름의 addon("4K Cinematic Drone Shooting")이 패키지마다
    // 가격이 달라서 실제로 발생했던 collision 버그 케이스
    const rows = [
      { packageId: 1, addonId: 10, order: 0, price: 87, desc: 'Weather permitting' },
      { packageId: 2, addonId: 10, order: 0, price: 128, desc: 'Weather permitting' },
    ];
    const groups = groupIntoVariants(rows);
    expect(groups).toHaveLength(2);
  });

  it('가격은 같아도 설명이 다르면 별개 그룹으로 분리', () => {
    const rows = [
      { packageId: 1, addonId: 10, order: 0, price: 87, desc: 'Desc A' },
      { packageId: 2, addonId: 10, order: 0, price: 87, desc: 'Desc B' },
    ];
    const groups = groupIntoVariants(rows);
    expect(groups).toHaveLength(2);
  });

  it('desc가 null인 행들도 하나의 그룹으로 묶음', () => {
    const rows = [
      { packageId: 1, addonId: 10, order: 0, price: 50, desc: null },
      { packageId: 2, addonId: 10, order: 0, price: 50, desc: null },
    ];
    const groups = groupIntoVariants(rows);
    expect(groups).toHaveLength(1);
  });
});
