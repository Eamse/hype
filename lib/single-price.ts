// 단일가격 체크박스 토글 로직
// (켜면 SNS 가격을 비SNS 가격에 미러링, 끄면 둘 다 비워서 이전 값이 헷갈리게 남지 않도록 함
//  — 프로덕션에서 가격이 0으로 저장됐던 사고 이후 추가한 로직)
export function applySinglePriceToggle(checked: boolean, currentPriceSNS: string): {
  priceSNS: string;
  priceNoSNS: string;
} {
  if (!checked)
    return { priceSNS: '', priceNoSNS: '' };
  return { priceSNS: currentPriceSNS, priceNoSNS: currentPriceSNS };
}
