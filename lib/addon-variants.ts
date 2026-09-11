// 같은 addon 이름인데 패키지마다 가격/설명이 다른 경우를 variant로 묶는 로직
// (프로덕션 마이그레이션 때 "같은 이름 = 같은 addon"이라고 잘못 가정했던 버그를 고친 로직)
export type AddonLinkRow = {
  packageId: number;
  addonId: number;
  order: number;
  price: number;
  desc: string | null;
};

export type AddonVariantGroup = {
  comboKey: string;
  price: number;
  desc: string | null;
  rows: AddonLinkRow[];
};

export function groupIntoVariants(rows: AddonLinkRow[]): AddonVariantGroup[] {
  const map = new Map<string, AddonLinkRow[]>();
  for (const row of rows) {
    const key = `${row.price}|||${row.desc ?? ''}`;
    (map.get(key) ?? map.set(key, []).get(key)!).push(row);
  }
  return [...map.entries()].map(([comboKey, groupRows]) => ({
    comboKey,
    price: groupRows[0].price,
    desc: groupRows[0].desc,
    rows: groupRows,
  }));
}
