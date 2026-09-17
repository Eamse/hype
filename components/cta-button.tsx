'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';

type CtaButtonProps = {
    href?: string;
    onClick?: () => void;
    external?: boolean;
    variant?: 'filled' | 'outline';
    size?: 'sm' | 'lg';
    fullWidth?: boolean;
    className?: string;
    children: ReactNode;
    [dataAttr: `data-${string}`]: unknown;
};

export default function CtaButton({
    href,
    onClick,
    external,
    variant = 'filled',
    size = 'lg',
    fullWidth,
    className = '',
    children,
    ...rest
}: CtaButtonProps) {
    const classes = [
        'cta-btn',
        `cta-btn--${variant}`,
        `cta-btn--${size}`,
        fullWidth ? 'cta-btn--full' : '',
        className,
    ].filter(Boolean).join(' ');

    if (href) {
        if (external) {
            return (<a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...rest}>
        {children}
      </a>);
        }
        return (<Link href={href} className={classes} {...rest}>
        {children}
      </Link>);
    }
    return (<button type="button" onClick={onClick} className={classes} {...rest}>
      {children}
    </button>);
}
