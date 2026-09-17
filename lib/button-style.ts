import type { CSSProperties } from 'react';

const BASE: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 6,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    textDecoration: 'none',
};

export const primaryButtonStyle: CSSProperties = {
    ...BASE,
    background: '#000',
    color: '#fff',
    border: '1px solid #000',
};

export const secondaryButtonStyle: CSSProperties = {
    ...BASE,
    background: '#fff',
    color: '#000',
    border: '1px solid #000',
};

export const dangerButtonStyle: CSSProperties = {
    ...BASE,
    background: '#fff',
    color: '#c0392b',
    border: '1px solid #c0392b',
};
