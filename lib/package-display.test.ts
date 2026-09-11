import { describe, it, expect } from 'vitest';
import { parseShootDetailValue, splitAddonDescIntoLines } from './package-display';

describe('parseShootDetailValue', () => {
  it('일반 숫자 + 단위 분리', () => {
    expect(parseShootDetailValue('4 hours')).toEqual({ num: '4', unit: 'hours' });
    expect(parseShootDetailValue('800+')).toEqual({ num: '800+', unit: '' });
    expect(parseShootDetailValue('3 sites')).toEqual({ num: '3', unit: 'sites' });
  });

  it('하이픈으로 된 숫자 범위는 통째로 숫자로 인식', () => {
    // "4.5 - 5 hours"에서 "4.5"만 큰 글씨로 나오고 "- 5 hours"가
    // 작은 글씨로 잘못 표시되던 프로덕션 버그였음
    expect(parseShootDetailValue('4.5 - 5 hours')).toEqual({ num: '4.5 - 5', unit: 'hours' });
    expect(parseShootDetailValue('3-4 sites')).toEqual({ num: '3-4', unit: 'sites' });
    expect(parseShootDetailValue('2-3 sites')).toEqual({ num: '2-3', unit: 'sites' });
  });

  it('숫자로 시작하지 않으면 원본 값을 그대로 num으로 둠', () => {
    expect(parseShootDetailValue('All Original')).toEqual({ num: 'All Original', unit: '' });
  });
});

describe('splitAddonDescIntoLines', () => {
  it('문장을 마침표+공백 기준으로 줄바꿈', () => {
    const input = 'Weather permitting. 2 min video. Delivered within 6 weeks.';
    expect(splitAddonDescIntoLines(input)).toBe(
      'Weather permitting.\n2 min video.\nDelivered within 6 weeks.',
    );
  });

  it('숫자 소수점은 문장 끝으로 착각하지 않음', () => {
    // "1.5 hours"가 "1." / "5 hours"로 잘못 쪼개지던 버그
    const input = 'Additional shooting time approx. 1.5 hours.';
    expect(splitAddonDescIntoLines(input)).not.toContain('1.\n5');
  });

  it('"Approx." 같은 줄임말 뒤에서는 줄바꿈하지 않음', () => {
    // "Approx." 혼자 한 줄로 떨어지던 프로덕션 버그
    const input = 'Approx. 3 min music video format (with BGM). Natural direction.';
    const result = splitAddonDescIntoLines(input);
    expect(result).not.toMatch(/^Approx\.\n/);
    expect(result).toBe('Approx. 3 min music video format (with BGM).\nNatural direction.');
  });

  it('문장이 하나뿐이면 원본을 그대로 반환', () => {
    expect(splitAddonDescIntoLines('Weather permitting')).toBe('Weather permitting');
  });
});
