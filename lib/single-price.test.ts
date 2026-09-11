import { describe, it, expect } from 'vitest';
import { applySinglePriceToggle } from './single-price';

describe('applySinglePriceToggle', () => {
  it('켜면 SNS 가격을 비SNS 가격에 그대로 미러링', () => {
    expect(applySinglePriceToggle(true, '2570')).toEqual({ priceSNS: '2570', priceNoSNS: '2570' });
  });

  it('꺼면 두 가격 모두 비움', () => {
    // 체크 해제 시 이전 값이 남아있으면 헷갈릴 수 있어서 비우기로 한 부분
    // (실수로 값이 0으로 저장됐던 프로덕션 사고 이후 추가된 동작)
    expect(applySinglePriceToggle(false, '2570')).toEqual({ priceSNS: '', priceNoSNS: '' });
  });

  it('켜져 있을 때 SNS 가격이 빈 값이면 둘 다 빈 값', () => {
    expect(applySinglePriceToggle(true, '')).toEqual({ priceSNS: '', priceNoSNS: '' });
  });
});
