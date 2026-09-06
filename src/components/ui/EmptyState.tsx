import React from 'react';
import { SearchX, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { TOKENS } from '../../lib/design-tokens';
import SoftCard from './SoftCard';
import SoftButton from './SoftButton';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title = 'No encontramos negocios con estos filtros',
  description = 'Intenta buscando con otros términos o seleccionando otra ciudad.',
  actionText = 'Ver todos los negocios',
  actionHref,
  onAction,
  icon,
  className = '',
}: EmptyStateProps) {
  return (
    <SoftCard
      className={className}
      style={{
        textAlign: 'center',
        padding: '48px 24px',
        maxWidth: '540px',
        margin: '32px auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: TOKENS.radii.lg,
          backgroundColor: TOKENS.colors.surfaceInset,
          display: 'grid',
          placeItems: 'center',
          color: TOKENS.colors.textSecondary,
        }}
      >
        {icon || <SearchX size={26} color={TOKENS.colors.greenPrimary} />}
      </div>

      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: TOKENS.colors.textMain, margin: '0 0 6px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.9rem', color: TOKENS.colors.textSecondary, margin: 0, lineHeight: 1.45 }}>
          {description}
        </p>
      </div>

      {actionHref ? (
        <Link
          href={actionHref}
          className="soft-btn-primary"
          style={{
            borderRadius: TOKENS.radii.pill,
            padding: '10px 22px',
            fontSize: '0.86rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ArrowLeft size={15} />
          <span>{actionText}</span>
        </Link>
      ) : onAction ? (
        <SoftButton variant="primary" onClick={onAction} style={{ borderRadius: TOKENS.radii.pill }}>
          {actionText}
        </SoftButton>
      ) : null}
    </SoftCard>
  );
}
