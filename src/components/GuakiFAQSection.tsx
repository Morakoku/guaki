'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { TOKENS } from '../lib/design-tokens';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export function GuakiFAQSection() {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'General',
      question: '¿Qué es Guaki y por qué es más confiable que otros directorios?',
      answer:
        'Guaki es una plataforma pensada para conectarte con negocios reales y de confianza en tu ciudad. A diferencia de las guías tradicionales llenas de teléfonos desactualizados o negocios que ya cerraron, en Guaki comprobamos que cada proveedor exista de verdad, tenga atención activa y te responda al instante en 1 clic por WhatsApp o llamada directa.',
    },
    {
      id: 'faq-2',
      category: 'Usuarios',
      question: '¿Tiene algún costo para mí buscar y contactar a un profesional?',
      answer:
        '¡Ninguno! Buscar especialistas, usar el buscador y escribirle directamente a cualquier negocio por WhatsApp es y será 100% gratuito para ti.',
    },
    {
      id: 'faq-3',
      category: 'Seguridad',
      question: '¿Cómo funciona la Garantía 0% Cartón y la verificación de negocios?',
      answer:
        'Cero empresas fantasma y cero intermediarios. Cada negocio con sello verificado pasa por 3 revisiones: 1) Registro legal y RUT activo, 2) Ubicación física y sede real comprobada, y 3) Prueba de línea de WhatsApp activa con respuesta rápida. Así sabes con certeza a quién le estás confiando tu salud, belleza o servicios.',
    },
    {
      id: 'faq-4',
      category: 'Negocios',
      question: 'Tengo un negocio, ¿cómo me ayuda Guaki a conseguir más clientes?',
      answer:
        'Tu negocio obtiene una ficha profesional visible en Google y en nuestro directorio inteligente. Los clientes te encuentran por tus servicios y te escriben directo a tu WhatsApp, sin comisiones por venta.',
    },
    {
      id: 'faq-5',
      category: 'Negocios',
      question: '¿Cómo registro o reclamo la ficha de mi empresa?',
      answer:
        'Es muy fácil y toma menos de 2 minutos: haz clic en "+ Mi Negocio", ingresa tus datos de contacto y listo. Podrás personalizar tus servicios, fotos, horarios y solicitar tu insignia de verificación.',
    },
    {
      id: 'faq-6',
      category: 'Cobertura',
      question: '¿En qué ciudades puedo encontrar servicios con Guaki?',
      answer:
        'Estamos activos en Medellín, Bogotá, Cali, Barranquilla, Cartagena y Bucaramanga en Colombia, y en Caracas, Valencia, Maracaibo y Barquisimeto en Venezuela, sumando continuamente nuevos especialistas y comercios verificados en más ciudades de ambos países.',
    },
  ];

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      style={{
        marginTop: '40px',
        marginBottom: '60px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          Preguntas Frecuentes
        </h3>
        <p style={{ fontSize: '0.95rem', color: TOKENS.colors.textSecondary, maxWidth: '640px', margin: '0 auto' }}>
          Todo lo que necesitas saber sobre el funcionamiento de Guaki, nuestro estándar de verificación y soluciones para negocios.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '860px', width: '100%', margin: '0 auto' }}>
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              style={{
                backgroundColor: TOKENS.colors.surface,
                padding: '20px 24px',
                borderRadius: TOKENS.radii.lg,
                boxShadow: TOKENS.shadows.card,
                border: isOpen ? `1.5px solid ${TOKENS.colors.greenPrimary}` : `1px solid ${TOKENS.colors.borderLight}`,
                transition: `all ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
              }}
            >
              <button
                type="button"
                onClick={() => toggle(faq.id)}
                aria-expanded={isOpen}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                  padding: 0,
                  color: isOpen ? TOKENS.colors.emeraldDark : TOKENS.colors.textMain,
                  transition: `color ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
                }}
              >
                <span style={{ fontSize: '1.02rem', fontWeight: 800, lineHeight: 1.35, color: TOKENS.colors.textMain }}>
                  {faq.question}
                </span>
                <span
                  style={{
                    backgroundColor: TOKENS.colors.surfaceInset,
                    width: '32px',
                    height: '32px',
                    borderRadius: TOKENS.radii.pill,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    color: isOpen ? TOKENS.colors.emeraldDark : TOKENS.colors.textSecondary,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: `transform ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
                  }}
                >
                  <ChevronDown size={18} />
                </span>
              </button>

              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: isOpen ? '1fr' : '0fr',
                  transition: `grid-template-rows 200ms cubic-bezier(0.23, 1, 0.32, 1)`,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    minHeight: 0,
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateY(0)' : 'translateY(-4px)',
                    transition: `opacity 180ms cubic-bezier(0.23, 1, 0.32, 1), transform 180ms cubic-bezier(0.23, 1, 0.32, 1)`,
                    paddingTop: isOpen ? '14px' : '0px',
                    marginTop: isOpen ? '14px' : '0px',
                    borderTop: isOpen ? `1px solid ${TOKENS.colors.borderSubtle}` : '1px solid transparent',
                    color: TOKENS.colors.textSecondary,
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                  }}
                >
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
