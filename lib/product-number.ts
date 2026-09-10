type ProductWithDirectors = {
    section?: string;
    directors: {
        director: {
            number: string;
        };
    }[];
};
export function getProductNumber(product: ProductWithDirectors): string | null {
    const number = product.directors[0]?.director.number;
    if (!number)
        return null;
    const region = product.section?.includes('Jeju')
        ? 'JEJU'
        : product.section?.includes('Seoul')
            ? 'SEOUL'
            : null;
    const padded = number.split('-')[0].replace('#', '').padStart(2, '0');
    return region ? `${region} ${padded}` : padded;
}
export function withProductNumbers<T extends ProductWithDirectors>(products: T[]): (T & {
    number: string | null;
})[] {
    return products.map((p) => ({ ...p, number: getProductNumber(p) }));
}
