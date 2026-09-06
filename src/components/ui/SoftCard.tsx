import React from 'react';
import { TOKENS } from '../../lib/design-tokens';

interface SoftCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevated?: boolean;
  className?: string;
  style?: React.CSSProperties;
  padding?: string | number;
}

export default function SoftCard({
  children,
  elevated = false,
  className = '',
  style = {},
  padding = '24px',
  ...props
}: SoftCardProps) {
  return (
    <div
      className={`${elevated ? 'soft-card-elevated' : 'soft-card'} ${className}`}
      style={{
        borderRadius: elevated ? TOKENS.radii.lg : TOKENS.radii.xl,
        padding,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
