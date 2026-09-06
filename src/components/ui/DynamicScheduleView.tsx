'use client';

import React, { useEffect, useState } from 'react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';

interface ScheduleItem {
  day: string;
  hours: string;
  isOpen?: boolean;
}

interface DynamicScheduleViewProps {
  schedule: ScheduleItem[];
  businessName: string;
}

export default function DynamicScheduleView({ schedule }: DynamicScheduleViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const currentDayIndex = now?.getDay() ?? 0;
  const currentDayName = daysOfWeek[currentDayIndex];
  const currentHour = now?.getHours() ?? -1;
  const hasSchedule = schedule.length > 0;

  const todaySchedule = schedule.find((s) => {
    const d = s.day.toLowerCase();
    if (d.includes('lunes a viernes') && currentDayIndex >= 1 && currentDayIndex <= 5) return true;
    if (d.includes('sábado') && currentDayIndex === 6) return true;
    if ((d.includes('domingo') || d.includes('festivo')) && currentDayIndex === 0) return true;
    if (d.includes(currentDayName.toLowerCase())) return true;
    return false;
  }) || schedule[0];

  const is24Hours = todaySchedule?.hours?.includes('24') || false;
  const isCurrentlyOpen = hasSchedule && (is24Hours || (currentHour >= 8 && currentHour < 19));

  return (
    <div
      className="neu-level-2"
      style={{
        padding: '16px 20px',
        borderRadius: TOKENS.radii.lg,
        backgroundColor: TOKENS.colors.surfaceElevated,
        border: `1px solid ${TOKENS.colors.borderLight}`,
      }}
    >
      {/* ── FILA ÚNICA MINIMALISTA: ESTADO + HORARIO HOY + BOTÓN DESPLEGABLE ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: hasSchedule ? (isCurrentlyOpen ? '#22C55E' : '#EF4444') : TOKENS.colors.textMuted,
              boxShadow: isCurrentlyOpen ? '0 0 8px #22C55E' : 'none',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: '0.88rem',
              fontWeight: 800,
              color: hasSchedule ? (isCurrentlyOpen ? '#15803D' : '#991B1B') : TOKENS.colors.textMuted,
            }}
          >
            {hasSchedule ? (isCurrentlyOpen ? 'Abierto Hoy' : 'Cerrado Ahora') : 'Horario no publicado'}:
          </span>
          <span style={{ fontSize: '0.86rem', color: TOKENS.colors.textMain, fontWeight: 700 }}>
            {todaySchedule?.hours || 'Sin datos todavía'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(10);
            }
            setIsExpanded(!isExpanded);
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.78rem',
            fontWeight: 800,
            color: TOKENS.colors.emeraldDark,
            padding: '4px 8px',
            borderRadius: TOKENS.radii.pill,
          }}
        >
          <span>{isExpanded ? 'Ocultar' : 'Ver semana'}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* ── DESPLIEGUE ELEGANTE DE LA SEMANA ── */}
      {isExpanded && (
        <div
          className="page-fade-in"
          style={{
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: `1px solid ${TOKENS.colors.borderLight}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {schedule.map((item, idx) => {
            const isToday =
              (item.day.toLowerCase().includes('lunes a viernes') && currentDayIndex >= 1 && currentDayIndex <= 5) ||
              (item.day.toLowerCase().includes('sábado') && currentDayIndex === 6) ||
              ((item.day.toLowerCase().includes('domingo') || item.day.toLowerCase().includes('festivo')) && currentDayIndex === 0) ||
              item.day.toLowerCase().includes(currentDayName.toLowerCase());

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: TOKENS.radii.sm,
                  backgroundColor: isToday ? 'rgba(23, 56, 45, 0.06)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: isToday ? 800 : 500, color: TOKENS.colors.textMain }}>
                    {item.day}
                  </span>
                  {isToday && (
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        backgroundColor: '#17382D',
                        color: '#FFFFFF',
                        padding: '1px 5px',
                        borderRadius: TOKENS.radii.pill,
                      }}
                    >
                      HOY
                    </span>
                  )}
                </div>

                <span style={{ fontSize: '0.82rem', fontWeight: isToday ? 800 : 500, color: TOKENS.colors.textSecondary }}>
                  {item.hours}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
