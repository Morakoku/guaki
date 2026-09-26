'use client';

import React, { useState } from 'react';
import { TOKENS } from '@/lib/design-tokens';

interface ReportButtonProps {
  businessName: string;
  slug: string;
  onReportSubmitted?: (reason: string) => void;
}

const REASONS = [
  { label: 'Ya no existente', value: 'ya_no_existe' },
  { label: 'Número malo', value: 'numero_malo' },
  { label: 'Cerró', value: 'c_erró' },
  { label: 'Otro', value: 'otro' },
] as const;

type ReasonValue = typeof REASONS[number]['value'];

export function ReportButton({ businessName, slug, onReportSubmitted }: ReportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReasonValue | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sessionKey, setSessionKey] = useState<string | null>(null);

  // Check if already reported in this session
  React.useEffect(() => {
    const key = `report_${slug}`;
    const prev = sessionStorage.getItem(key);
    if (prev) {
      setSubmitted(true);
      setSessionKey(key);
    }
  }, [slug]);

  const handleSelect = async (reason: ReasonValue) => {
    if (submitted) return;
    setSelectedReason(reason);
    setShowMenu(false);

    try {
      const response = await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: 'report_submitted',
          metadata: {
            business: slug,
            reason,
          },
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setSessionKey(`report_${slug}`);
        // Store in sessionStorage to prevent repeat in same session
        sessionStorage.setItem(`report_${slug}`, '1');
        onReportSubmitted?.(reason);
      } else {
        // Neutral failure message - don't break the page
        // Could show a transient error, but keep it subtle
        setSelectedReason(null);
      }
    } catch {
      // Neutral failure - no break
      setSelectedReason(null);
    }
  };

  if (submitted) {
    return (
      <button
        type="button"
        style={{
          borderRadius: TOKENS.radii.pill,
          backgroundColor: 'rgba(226, 238, 221, 0.97)',
          border: '1px solid rgba(23, 56, 45, 0.18)',
          color: TOKENS.colors.emeraldDark,
          fontSize: '0.88rem',
          fontWeight: 800,
          padding: '7px 14px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'default',
        }}
      >
        <span>Gracias, lo revisamos ✓</span>
      </button>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginLeft: '8px',
      }}
    >
      <button
        type="button"
        onClick={() => setShowMenu(true)}
        style={{
          borderRadius: TOKENS.radii.pill,
          backgroundColor: 'rgba(23, 56, 45, 0.04)',
          border: `1px solid ${TOKENS.colors.borderLight}`,
          color: TOKENS.colors.textMain,
          fontSize: '0.82rem',
          fontWeight: 700,
          padding: '7px 12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
        }}
      >
        <span>Reportar</span>
      </button>

      {showMenu && selectedReason === null && (
        <div
          style={{
            position: 'absolute',
            marginTop: '8px',
            marginLeft: '-4px',
            backgroundColor: TOKENS.colors.surfaceElevated,
            border: `1px solid ${TOKENS.colors.borderLight}`,
            borderRadius: TOKENS.radii.pill,
            padding: '8px',
            minWidth: '140px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            zIndex: 1000,
            fontSize: '0.78rem',
            color: TOKENS.colors.textMain,
          }}
        >
          <div style={{ marginBottom: '4px', fontSize: '0.76rem', color: TOKENS.colors.textSecondary }}>
            ¿Por qué reportas este negocio?
          </div>
          {REASONS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleSelect(value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: TOKENS.radii.pill,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: selectedReason === value ? TOKENS.colors.emeraldDark : TOKENS.colors.surfaceInset,
                color: selectedReason === value ? TOKENS.colors.white : TOKENS.colors.textMain,
                margin: '2px 0',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {selectedReason !== null && submitted && (
        <button
          type="button"
          style={{
            borderRadius: TOKENS.radii.pill,
            backgroundColor: 'rgba(226, 238, 221, 0.97)',
            border: '1px solid rgba(23, 56, 45, 0.18)',
            color: TOKENS.colors.emeraldDark,
            fontSize: '0.88rem',
            fontWeight: 800,
            padding: '7px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'default',
          }}
        >
          <span>Gracias, lo revisamos ✓</span>
        </button>
      )}
    </div>
  );
}