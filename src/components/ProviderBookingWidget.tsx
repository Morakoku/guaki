'use client';

import React, { useEffect, useState } from 'react';
import { NM_PEARL } from '@/lib/neumorphism-styles';

interface Props {
  businessId: string;
  businessName: string;
  services?: string[];
  schedule?: { day: string; hours: string; isOpen?: boolean }[];
}

export function ProviderBookingWidget({
  businessId,
  businessName,
  services = ['Consulta general', 'Servicio básico', 'Valoración'],
  schedule,
}: Props) {
  const [selectedService, setSelectedService] = useState(services[0] || '');
  const [selectedDate, setSelectedDate] = useState('');
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'booking' | 'confirmed' | 'error'>('idle');
  const [confirmationMsg, setConfirmationMsg] = useState('');

  const timeSlots = [
    '08:30 AM', '09:30 AM', '10:30 AM', '11:30 AM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientContact.trim()) {
      setStatus('error');
      return;
    }

    setStatus('booking');
    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'inquiry',
          clientName: clientName.trim(),
          clientContact: clientContact.trim(),
          message: `[CITA SOLICITADA] Servicio: ${selectedService} | Fecha: ${selectedDate} | Hora: ${selectedTime} | Notas: ${notes.trim() || 'Ninguna'}`,
        }),
      });

      const payload = await res.json().catch(() => null);
      if (res.ok && payload && payload.success === true) {
        setStatus('confirmed');
        setConfirmationMsg(`¡Cita solicitada para el ${selectedDate} a las ${selectedTime}! ${businessName} se comunicará contigo para confirmar.`);
      } else {
        setStatus('error');
        setConfirmationMsg(payload?.error || `No se pudo solicitar la cita (HTTP ${res.status}). Intenta nuevamente.`);
      }
    } catch {
      setStatus('error');
      setConfirmationMsg('No se pudo conectar con el servicio. Revisa tu conexión e intenta nuevamente.');
    }
  };

  return (
    <section style={{ ...NM_PEARL.card, padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ fontSize: '1.4rem' }}>📅</span>
        <h3 style={{ fontSize: '1.1rem', color: '#0F172A', fontWeight: 800, margin: 0 }}>
          Agendar Cita o Servicio
        </h3>
      </div>

      {status === 'confirmed' ? (
        <div style={{ padding: '20px', ...NM_PEARL.inset, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '6px' }}>🎉</div>
          <strong style={{ color: '#059669', fontSize: '1rem', display: 'block', marginBottom: '6px' }}>
            {confirmationMsg}
          </strong>
          <p style={{ color: '#475569', fontSize: '0.84rem', margin: '0 0 16px' }}>
            Tu solicitud para <strong style={{ color: '#0F172A' }}>{businessName}</strong> quedó registrada. La confirmación requiere un canal verificado del proveedor.
          </p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            style={{ ...NM_PEARL.buttonEmerald, padding: '12px 24px', fontSize: '0.88rem' }}
          >
            Agendar otra cita
          </button>
        </div>
      ) : (
        <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {status === 'error' && (
            <div role="alert" style={{ padding: '10px 14px', ...NM_PEARL.inset, color: '#DC2626', fontSize: '0.82rem' }}>
              {confirmationMsg}
            </div>
          )}
          {/* Service Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
              Servicio deseado
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              style={{ width: '100%', ...NM_PEARL.input, padding: '12px 16px', fontSize: '0.88rem' }}
            >
              {services.map((svc, i) => (
                <option key={i} value={svc} style={{ backgroundColor: '#12161F', color: '#0F172A' }}>
                  {svc}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
                Fecha
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ width: '100%', ...NM_PEARL.input, padding: '12px', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
                Hora estimada
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                style={{ width: '100%', ...NM_PEARL.input, padding: '12px', fontSize: '0.85rem' }}
              >
                {timeSlots.map((slot, i) => (
                  <option key={i} value={slot} style={{ backgroundColor: '#12161F', color: '#0F172A' }}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Client Details */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
              Tu nombre *
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ej. Laura Restrepo"
              required
              style={{ width: '100%', ...NM_PEARL.input, padding: '12px 16px', fontSize: '0.88rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
              Teléfono / WhatsApp *
            </label>
            <input
              type="text"
              value={clientContact}
              onChange={(e) => setClientContact(e.target.value)}
              placeholder="Ej. +57 300 123 4567"
              required
              style={{ width: '100%', ...NM_PEARL.input, padding: '12px 16px', fontSize: '0.88rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'booking'}
            style={{ ...NM_PEARL.buttonEmerald, padding: '14px 22px', fontSize: '0.92rem' }}
          >
            {status === 'booking' ? 'Enviando solicitud...' : '📅 Solicitar Cita'}
          </button>
        </form>
      )}
    </section>
  );
}
