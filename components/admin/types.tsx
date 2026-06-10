import React from 'react';

export type Product = {
  id: number;
  section: string;
  title: string;
  brand: string;
  price: number;
  imageUrl: string | null;
  order: number;
};

export type Section =
  | 'hero'
  | 'Meet our Photographers in Jeju'
  | 'Meet our Photographer in Seoul'
  | 'Casual Photoshoot in Jeju'
  | 'Casual Photoshoot in Seoul'
  | 'Magazine';

export type Magazine = {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  images: Magazine[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export function btnStyle(
  bg: string,
  color: string,
  border?: string,
): React.CSSProperties {
  return {
    padding: '7px 14px',
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 600,
    background: bg,
    color,
    cursor: 'pointer',
    fontFamily: 'inherit',
    border: border ? `1px solid ${border}` : 'none',
    whiteSpace: 'nowrap' as const,
  };
}

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: '#888',
  marginBottom: 4,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 7,
  border: '1px solid #e0e0e0',
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
  color: '#191919',
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
