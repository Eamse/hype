// "Kim Chul Su" → "Kim*****" (첫 단어만 노출, 나머지는 고정 길이 마스킹)
export function maskName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;

  const [first, ...rest] = trimmed.split(/\s+/);
  if (rest.length === 0) {
    return first.length <= 1 ? `${first}*****` : `${first[0]}*****`;
  }
  return `${first}*****`;
}
