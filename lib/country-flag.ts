// ISO 3166-1 alpha-2 코드 -> 국기 이모지 (유니코드 리저널 인디케이터 조합)
export function countryFlag(isoCode: string): string {
  const code = isoCode.trim().toUpperCase();
  if (code.length !== 2) return '';
  const points = [...code].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...points);
}
