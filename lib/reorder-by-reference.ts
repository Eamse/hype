// 리스트를 기준 순서(referenceOrder)에 맞춰 재정렬
// (App.jsx 원본 순서에 맞춰 addon 순서를 재배치할 때 쓴 로직 — 기준에 없는 항목은 결과에서 제외됨)
export function reorderByReference<T>(items: T[], getKey: (item: T) => string, referenceOrder: string[]): T[] {
  return referenceOrder
    .map((key) => items.find((item) => getKey(item) === key))
    .filter((item): item is T => item !== undefined);
}
