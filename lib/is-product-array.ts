export type Product = {
  id: number;
  title: string;
  brand: string;
  price: number;
  imageUrl: string | null;
  section?: string;
};

export function isProductArray(data: unknown): data is Product[] {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>).id === 'number' &&
        typeof (item as Record<string, unknown>).title === 'string' &&
        typeof (item as Record<string, unknown>).brand === 'string' &&
        typeof (item as Record<string, unknown>).price === 'number',
    )
  );
}
