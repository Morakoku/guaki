import React from 'react';
import { TOKENS } from '../../lib/design-tokens';

interface SoftInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
  containerStyle?: React.CSSProperties;
}

export default function SoftInput({
  label,
  icon,
  error,
  className = '',
  containerStyle = {},
  style = {},
  ...props
}: SoftInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', ...containerStyle }}>
      {label && (
        <label
          style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: TOKENS.colors.textSecondary,
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: '16px',
              color: TOKENS.colors.textMuted,
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </span>
        )}
        <input
          className={`soft-input ${className}`}
          style={{
            paddingLeft: icon ? '46px' : '18px',
            ...style,
          }}
          {...props}
        />
      </div>
      {error && (
        <span style={{ fontSize: '0.78rem', color: TOKENS.colors.danger, fontWeight: 600 }}>
          {error}
        </span>
      )}
    </div>
  );
}
