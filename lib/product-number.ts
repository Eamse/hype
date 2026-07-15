type ProductWithDirectors = {
  directors: { director: { number: string } }[];
};

/** ProductDirector 관계에서 첫 번째 작가의 번호("#1-1")를 업체 번호("#1")로 변환 */
export function getProductNumber(product: ProductWithDirectors): string | null {
  const number = product.directors[0]?.director.number;
  return number ? number.split('-')[0] : null;
}
