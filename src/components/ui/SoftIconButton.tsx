import React from 'react';
import { TOKENS } from '../../lib/design-tokens';

interface SoftIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'convex' | 'pressed' | 'primary' | 'ghost';
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function SoftIconButton({
  children,
  variant = 'convex',
  size = 44,
  className = '',
  style = {},
  ...props
}: SoftIconButtonProps) {
  const isPrimary = variant === 'primary';
  const isPressed = variant === 'pressed';
  const isGhost = variant === 'ghost';

  return (
    <button
      className={`soft-btn ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        padding: 0,
        borderRadius: TOKENS.radii.md,
        display: 'grid',
        placeItems: 'center',
        ...(isPrimary && {
          backgroundColor: TOKENS.colors.emeraldDark,
          color: TOKENS.colors.white,
          boxShadow: TOKENS.shadows.btnPrimary,
          border: 'none',
        }),
        ...(isPressed && {
          backgroundColor: TOKENS.colors.surfaceInset,
          boxShadow: TOKENS.shadows.inset,
          color: TOKENS.colors.emeraldDark,
        }),
        ...(isGhost && {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          border: 'none',
          color: TOKENS.colors.textSecondary,
        }),
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
