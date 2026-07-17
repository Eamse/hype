type ProductWithDirectors = {
  section?: string;
  directors: { director: { number: string } }[];
};

/** ProductDirector 관계에서 첫 번째 작가의 번호("#1-1")와 section을 "JEJU 01" 형태로 변환 */
export function getProductNumber(product: ProductWithDirectors): string | null {
  const number = product.directors[0]?.director.number;
  if (!number) return null;

  const region = product.section?.includes('Jeju')
    ? 'JEJU'
    : product.section?.includes('Seoul')
      ? 'SEOUL'
      : null;
  const padded = number.split('-')[0].replace('#', '').padStart(2, '0');

  return region ? `${region} ${padded}.` : `${padded}.`;
}
