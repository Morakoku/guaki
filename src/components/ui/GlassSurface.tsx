import React from 'react';
import { TOKENS } from '../../lib/design-tokens';

interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevated?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function GlassSurface({
  children,
  elevated = false,
  className = '',
  style = {},
  ...props
}: GlassSurfaceProps) {
  return (
    <div
      className={`${elevated ? 'glass-surface-elevated' : 'glass-surface'} ${className}`}
      style={{
        borderRadius: TOKENS.radii.xl,
        padding: '24px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
