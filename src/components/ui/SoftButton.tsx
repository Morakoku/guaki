import React from 'react';
import { TOKENS } from '../../lib/design-tokens';

interface SoftButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function SoftButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className = '',
  style = {},
  ...props
}: SoftButtonProps) {
  const getPadding = () => {
    switch (size) {
      case 'sm':
        return '8px 16px';
      case 'lg':
        return '14px 28px';
      default:
        return '11px 22px';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return '0.84rem';
      case 'lg':
        return '1.05rem';
      default:
        return '0.92rem';
    }
  };

  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';

  return (
    <button
      className={`${isPrimary ? 'soft-btn-primary' : 'soft-btn'} ${className}`}
      style={{
        padding: getPadding(),
        fontSize: getFontSize(),
        width: fullWidth ? '100%' : 'auto',
        borderRadius: TOKENS.radii.pill,
        ...(isSecondary && {
          backgroundColor: TOKENS.colors.surfaceElevated,
          color: TOKENS.colors.textMain,
          boxShadow: TOKENS.shadows.btnConvex,
        }),
        ...(isGhost && {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          border: '1px solid transparent',
          color: TOKENS.colors.textSecondary,
        }),
        ...(isDanger && {
          backgroundColor: TOKENS.colors.danger,
          color: TOKENS.colors.white,
          boxShadow: '0 8px 20px rgba(185, 28, 28, 0.25)',
        }),
        ...style,
      }}
      {...props}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
