export type Product = {
  id: number;
  title: string;
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
        typeof (item as Record<string, unknown>).title === 'string',
    )
  );
}
