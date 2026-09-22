import React from 'react';
import { TOKENS } from '@/lib/design-tokens';

/**
 * Shell del área administrativa.
 * Fondo base del sistema Guaki; cada página lleva su propia cabecera y navegación.
 * (Antes: sidebar "ADMIN OS" oscura con variables CSS inexistentes y link muerto
 * a /admin/finance — eliminada por romper el fondo y duplicar la navegación.)
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: TOKENS.colors.bgMain }}>
      {children}
    </div>
  );
}
