import React from 'react';
import { TOKENS } from '../../lib/design-tokens';

interface SoftBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  tone?: 'emerald' | 'sage' | 'neutral' | 'highlight';
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function SoftBadge({
  children,
  tone = 'highlight',
  icon,
  className = '',
  style = {},
  ...props
}: SoftBadgeProps) {
  const getStyles = () => {
    switch (tone) {
      case 'emerald':
        return {
          backgroundColor: TOKENS.colors.emeraldDark,
          color: TOKENS.colors.white,
          border: 'none',
        };
      case 'sage':
        return {
          backgroundColor: TOKENS.colors.greenSoft,
          color: TOKENS.colors.emeraldDeep,
          border: '1px solid rgba(23, 56, 45, 0.1)',
        };
      case 'neutral':
        return {
          backgroundColor: TOKENS.colors.surfaceElevated,
          color: TOKENS.colors.textSecondary,
          border: '1px solid rgba(22, 35, 29, 0.08)',
        };
      default:
        return {
          backgroundColor: TOKENS.colors.highlight,
          color: TOKENS.colors.emeraldDark,
          border: '1px solid rgba(23, 56, 45, 0.08)',
        };
    }
  };

  return (
    <span
      className={`soft-badge ${className}`}
      style={{
        ...getStyles(),
        ...style,
      }}
      {...props}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
