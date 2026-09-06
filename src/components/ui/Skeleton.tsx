import React from 'react';
import { TOKENS } from '../../lib/design-tokens';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = TOKENS.radii.md,
  className = '',
  style = {},
  ...props
}: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: TOKENS.colors.surfaceInset,
        opacity: 0.65,
        ...style,
      }}
      {...props}
    />
  );
}
