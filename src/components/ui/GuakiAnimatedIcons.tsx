'use client';

import React from 'react';

interface AnimatedIconProps {
  size?: number;
  color?: string;
  className?: string;
  active?: boolean;
}

/**
 * 🎙️ AnimatedVoiceMic: Orbe acústico con barras armónicas de sonido y pulso orgánico
 */
export function AnimatedVoiceMic({ size = 24, color = '#FFFFFF', active = false }: AnimatedIconProps) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2.5px',
        position: 'relative',
      }}
    >
      <span
        style={{
          width: '3px',
          height: active ? '18px' : '10px',
          backgroundColor: color,
          borderRadius: '999px',
          animation: 'guaki-voice-wave-1 1.2s ease-in-out infinite',
        }}
      />
      <span
        style={{
          width: '3px',
          height: active ? '24px' : '16px',
          backgroundColor: color,
          borderRadius: '999px',
          animation: 'guaki-voice-wave-2 1.2s ease-in-out infinite',
        }}
      />
      <span
        style={{
          width: '3px',
          height: active ? '28px' : '20px',
          backgroundColor: color,
          borderRadius: '999px',
          animation: 'guaki-voice-wave-3 1.2s ease-in-out infinite',
        }}
      />
      <span
        style={{
          width: '3px',
          height: active ? '24px' : '16px',
          backgroundColor: color,
          borderRadius: '999px',
          animation: 'guaki-voice-wave-2 1.2s ease-in-out 0.2s infinite',
        }}
      />
      <span
        style={{
          width: '3px',
          height: active ? '18px' : '10px',
          backgroundColor: color,
          borderRadius: '999px',
          animation: 'guaki-voice-wave-1 1.2s ease-in-out 0.4s infinite',
        }}
      />
    </div>
  );
}

/**
 * 🏠 AnimatedHomeIcon: Casa minimalista con tejado y chimenea con micro-bounce
 */
export function AnimatedHomeIcon({ size = 18, color = 'currentColor', active = false }: AnimatedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={active ? 2.4 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1)',
        transform: active ? 'translateY(-1px) scale(1.05)' : 'scale(1)',
      }}
    >
      <path d="M3 10.5L12 3l9 7.5v9.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

/**
 * 🧭 AnimatedCompassIcon: Brújula orgánica con aguja giratoria suave
 */
export function AnimatedCompassIcon({ size = 18, color = 'currentColor', active = false }: AnimatedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={active ? 2.4 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: 'transform 240ms cubic-bezier(0.23, 1, 0.32, 1)',
        transform: active ? 'rotate(45deg) scale(1.06)' : 'rotate(0deg)',
      }}
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

/**
 * 🏪 AnimatedStoreIcon: Tienda / Negocio con toldo dinámico
 */
export function AnimatedStoreIcon({ size = 18, color = 'currentColor', active = false }: AnimatedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={active ? 2.4 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1)',
        transform: active ? 'translateY(-1px) scale(1.05)' : 'scale(1)',
      }}
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
    </svg>
  );
}

/**
 * ℹ️ AnimatedInfoIcon: Información con pulso
 */
export function AnimatedInfoIcon({ size = 18, color = 'currentColor', active = false }: AnimatedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={active ? 2.4 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1)',
        transform: active ? 'scale(1.08)' : 'scale(1)',
      }}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
