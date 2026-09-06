'use client';

import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';

interface Props {
  businessId: string;
  businessName: string;
}

export function ProviderReviewForm({ businessId, businessName }: Props) {
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [statusText, setStatusText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) {
      setStatus('error');
      setStatusText('Por favor escribe tu nombre o alias y tu comentario.');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review',
          authorName: authorName.trim(),
          rating,
          comment: comment.trim(),
        }),
      });

      if (res.ok) {
        setStatus('success');
        setStatusText('¡Gracias! Recibimos tu opinión y la revisaremos antes de publicarla.');
        setAuthorName('');
        setComment('');
      } else {
        setStatus('error');
        setStatusText('No pudimos registrar tu opinión. Intenta de nuevo.');
      }
    } catch {
      setStatus('error');
      setStatusText('No pudimos conectar con Guaki. Revisa tu conexión e intenta de nuevo.');
    }
  };

  return (
    <div
      style={{
        padding: '22px 20px',
        backgroundColor: '#FFFFFF',
        borderRadius: TOKENS.radii.lg,
        border: `1px solid ${TOKENS.colors.borderLight}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
        <MessageSquarePlus size={18} color={TOKENS.colors.emeraldDark} />
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: TOKENS.colors.textMain, margin: 0, lineHeight: 1.25 }}>
          Deja tu opinión
          <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: TOKENS.colors.textSecondary, marginTop: '3px' }}>
            {businessName}
          </span>
        </h3>
      </div>
      <p style={{ color: TOKENS.colors.textSecondary, fontSize: '0.82rem', margin: '0 0 16px', lineHeight: 1.45 }}>
        Cuéntanos cómo fue tu experiencia. Tu opinión ayuda a otros vecinos a decidir mejor.
      </p>

      {status === 'success' ? (
        <div
          style={{
            padding: '14px',
            borderRadius: TOKENS.radii.md,
            backgroundColor: 'rgba(21, 128, 61, 0.1)',
            border: '1px solid rgba(21, 128, 61, 0.2)',
            color: '#15803D',
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={18} />
          {statusText}
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Calificación por Estrellas */}
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ display: 'block', fontSize: '0.82rem', color: TOKENS.colors.textMain, fontWeight: 700, marginBottom: '6px' }}>
              Calificación general <span aria-hidden="true">*</span>
            </legend>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`${star} estrellas`}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    transition: 'transform 0.12s ease',
                  }}
                >
                  <Star
                    size={24}
                    fill={star <= rating ? '#D97706' : 'transparent'}
                    color={star <= rating ? '#D97706' : '#CBD5E1'}
                  />
                </button>
              ))}
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.emeraldDark, marginLeft: '6px' }}>
                {rating === 5 ? '⭐ Excelente' : rating === 4 ? 'Muy Bueno' : rating === 3 ? 'Bueno' : 'Regular'}
              </span>
            </div>
          </fieldset>

          {/* Nombre / Alias */}
          <div>
            <label htmlFor="review-author" style={{ display: 'block', fontSize: '0.82rem', color: TOKENS.colors.textMain, fontWeight: 700, marginBottom: '6px' }}>
              Tu nombre o alias *
            </label>
            <input
              id="review-author"
              type="text"
              required
              maxLength={80}
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Ej. Carolina M."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 14px',
                borderRadius: TOKENS.radii.sm,
                backgroundColor: '#FAFAFA',
                border: `1px solid ${TOKENS.colors.borderLight}`,
                color: TOKENS.colors.textMain,
                fontSize: '16px', // Previene rebote y zoom en iOS/Android
                outline: 'none',
                lineHeight: '1.4',
              }}
            />
          </div>

          {/* Comentario */}
          <div>
            <label htmlFor="review-comment" style={{ display: 'block', fontSize: '0.82rem', color: TOKENS.colors.textMain, fontWeight: 700, marginBottom: '6px' }}>
              Tu comentario o reseña *
            </label>
            <textarea
              id="review-comment"
              required
              maxLength={1000}
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿Cómo fue la atención, puntualidad e instalaciones?"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 14px',
                borderRadius: TOKENS.radii.sm,
                backgroundColor: '#FAFAFA',
                border: `1px solid ${TOKENS.colors.borderLight}`,
                color: TOKENS.colors.textMain,
                fontSize: '16px', // Previene rebote y zoom en iOS/Android
                outline: 'none',
                resize: 'vertical',
                minHeight: '80px',
                lineHeight: '1.4',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', fontSize: '0.70rem', color: TOKENS.colors.textMuted }}>
              {comment.length}/1000
            </div>
          </div>

          {status === 'error' && (
            <div role="alert" style={{ color: TOKENS.colors.danger, fontSize: '0.82rem', fontWeight: 600 }}>
              {statusText}
            </div>
          )}

          {/* 📜 Habeas Data Ley 1581 de 2012 */}
          <p style={{ fontSize: '0.72rem', color: TOKENS.colors.textMuted, margin: '0 0 2px', lineHeight: 1.35 }}>
            🔒 Usaremos tu nombre o alias y comentario únicamente para revisar y publicar tu opinión, según la <strong>Ley 1581 de 2012</strong>.
          </p>

          {/* Botón de envío */}
          <div>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="neu-btn-primary"
              style={{
                padding: '12px 24px',
                fontSize: '0.88rem',
                fontWeight: 800,
                borderRadius: TOKENS.radii.pill,
                width: '100%',
                maxWidth: '240px',
              cursor: status === 'submitting' ? 'wait' : 'pointer',
            }}
          >
              {status === 'submitting' ? 'Publicando...' : 'Publicar mi experiencia'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
