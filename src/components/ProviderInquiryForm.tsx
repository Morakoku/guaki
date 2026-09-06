'use client';

import React, { useState } from 'react';
import { NM_PEARL } from '@/lib/neumorphism-styles';

interface Props {
  businessId: string;
  businessName: string;
}

export function ProviderInquiryForm({ businessId, businessName }: Props) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [statusText, setStatusText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !message.trim()) {
      setStatus('error');
      setStatusText('Por favor completa todos los campos requeridos.');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'inquiry',
          clientName: name.trim(),
          clientContact: contact.trim(),
          message: message.trim(),
        }),
      });

      const payload = await res.json().catch(() => null);
      if (res.ok && payload && payload.success === true) {
        setStatus('success');
        setStatusText(`¡Listo! Tu solicitud quedó registrada para ${businessName}. El contacto del proveedor se habilitará cuando exista un canal verificado.`);
        setName('');
        setContact('');
        setMessage('');
      } else {
        setStatus('error');
        setStatusText(payload?.error || `No se pudo enviar el mensaje (HTTP ${res.status}). Intenta nuevamente.`);
      }
    } catch {
      setStatus('error');
      setStatusText('No se pudo conectar con el servicio. Revisa tu conexión e intenta nuevamente.');
    }
  };

  return (
    <section style={{ ...NM_PEARL.card, padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '0.9rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, margin: 0 }}>
        Solicitar información o cotización
      </h2>
      <p style={{ color: '#475569', fontSize: '0.84rem', margin: 0 }}>
        Escribe directamente al equipo de <strong style={{ color: '#0F172A' }}>{businessName}</strong>. Te responderán con gusto por WhatsApp o llamada.
      </p>

      {status === 'success' ? (
        <div style={{ padding: '16px', ...NM_PEARL.inset, color: '#059669', fontSize: '0.88rem', fontWeight: 700 }}>
          {statusText}
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
              Tu nombre completo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Carlos Mendoza"
              required
              style={{ width: '100%', ...NM_PEARL.input, padding: '12px 16px', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
              Teléfono / WhatsApp / Correo *
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Ej. +57 310 987 6543"
              required
              style={{ width: '100%', ...NM_PEARL.input, padding: '12px 16px', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
              Mensaje o solicitud de cotización *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hola, me interesa conocer el precio y disponibilidad para..."
              rows={3}
              required
              style={{ width: '100%', ...NM_PEARL.input, padding: '12px 16px', fontSize: '0.88rem', resize: 'vertical' }}
            />
          </div>

          {status === 'error' && (
            <div style={{ padding: '10px 14px', ...NM_PEARL.inset, color: '#DC2626', fontSize: '0.82rem' }}>
              {statusText}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            style={{ ...NM_PEARL.buttonEmerald, padding: '14px 22px', fontSize: '0.92rem' }}
          >
            {status === 'sending' ? 'Enviando...' : '✉️ Enviar Mensaje Directo'}
          </button>
        </form>
      )}
    </section>
  );
}
