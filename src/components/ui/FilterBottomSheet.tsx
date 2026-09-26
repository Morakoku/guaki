'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TOKENS } from '@/lib/design-tokens';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  selectedCity: string;
  setSelectedCity: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedCountry: 'todos' | 'co' | 've';
  setSelectedCountry: React.Dispatch<React.SetStateAction<'todos' | 'co' | 've'>>;
  onlyOpenNow: boolean;
  setOnlyOpenNow: React.Dispatch<React.SetStateAction<boolean>>;
  activeFiltersCount: number;
  cities: { id: string; label: string }[];
  categories: { id: string; label: string; icon: string }[];
}

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';
const ANIM_DURATION = 250;

export default function FilterBottomSheet({
  isOpen,
  onClose,
  onToggle,
  selectedCity,
  setSelectedCity,
  selectedCategory,
  setQuery,
  setSelectedCategory,
  selectedCountry,
  setSelectedCountry,
  onlyOpenNow,
  setOnlyOpenNow,
  activeFiltersCount,
  cities,
  categories,
}: FilterBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [swipeStartY, setSwipeStartY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    if (!isOpen && sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(100%)';
    }
  }, [isOpen]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setSwipeStartY(e.clientY);
    setIsSwiping(true);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const diff = e.clientY - swipeStartY;
    // Swipe down >= 80px para cerrar
    if (diff > 80 && sheetRef.current && isSwiping) {
      onClose();
    }
    setIsSwiping(false);
  };

  useEffect(() => {
    // Focus management al abrir
    if (isOpen && sheetRef.current) {
      const firstFocusable = sheetRef.current.querySelector<HTMLElement>('button, [href]');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
    return () => {
      // Resto cleanup
    };
  }, [isOpen]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-sheet-title"
      style={{
        position: 'fixed',
        inset: '0 0 auto 0',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={sheetRef}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1001,
          width: '100%',
          maxWidth: '100%',
          backgroundColor: TOKENS.colors.surfaceElevated,
          borderTopLeftRadius: TOKENS.radii.xl,
          borderTopRightRadius: TOKENS.radii.xl,
          boxShadow: TOKENS.shadows.card,
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: `transform ${ANIM_DURATION}ms ${EASE}`,
          overflowY: 'auto',
          padding: '20px',
          // Ensure touch targets >= 44px height
          minHeight: 'calc(100vh - 48px)',
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {/* Close button (X) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar filtros"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: TOKENS.colors.surface,
            border: `1px solid ${TOKENS.colors.borderLight}`,
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            color: TOKENS.colors.textSecondary,
            transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
            willChange: 'transform',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <X size={18} />
        </button>

        {/* Título */}
        <h3
          id="filter-sheet-title"
          style={{
            margin: '0 0 16px',
            fontSize: '0.94rem',
            fontWeight: 700,
            color: TOKENS.colors.textMain,
            textAlign: 'center',
          }}
        >
          Filtros
        </h3>

        {/* Filtro de Ciudades */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: TOKENS.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Ciudades Auditadas
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setSelectedCity('')}
              style={{
                borderRadius: TOKENS.radii.pill,
                padding: '6px 14px',
                fontSize: '0.74rem',
                minHeight: '40px',
                minWidth: '44px',
                fontWeight: selectedCity === '' ? 700 : 600,
                cursor: 'pointer',
                backgroundColor: selectedCity === '' ? TOKENS.colors.emeraldDark : TOKENS.colors.surfaceElevated,
                color: selectedCity === '' ? TOKENS.colors.white : TOKENS.colors.textSecondary,
                border: `1px solid ${selectedCity === '' ? TOKENS.colors.emeraldDark : TOKENS.colors.borderLight}`,
              }}
            >
              Todas las Ciudades
            </button>
            {cities.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => setSelectedCity(city.id)}
                style={{
                  borderRadius: TOKENS.radii.pill,
                  padding: '6px 14px',
                  fontSize: '0.74rem',
                  minHeight: '40px',
                  minWidth: '44px',
                  cursor: 'pointer',
                  backgroundColor: selectedCity === city.id ? TOKENS.colors.emeraldDark : TOKENS.colors.surfaceElevated,
                  color: selectedCity === city.id ? TOKENS.colors.white : TOKENS.colors.textSecondary,
                  border: `1px solid ${selectedCity === city.id ? TOKENS.colors.emeraldDark : TOKENS.colors.borderLight}`,
                }}
              >
                {city.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro de Categorías */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: TOKENS.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Categorías de Servicio
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  borderRadius: TOKENS.radii.pill,
                  padding: '7px 15px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: selectedCategory === cat.id ? TOKENS.colors.emeraldDark : TOKENS.colors.surfaceElevated,
                  color: selectedCategory === cat.id ? TOKENS.colors.white : TOKENS.colors.textSecondary,
                  border: `1px solid ${selectedCategory === cat.id ? TOKENS.colors.emeraldDark : TOKENS.colors.borderLight}`,
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Switch 'Abierto Ahora' */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <button
            type="button"
            onClick={() => {
              setOnlyOpenNow(!onlyOpenNow);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '0.78rem',
              fontWeight: onlyOpenNow ? 700 : 600,
              borderRadius: TOKENS.radii.pill,
              backgroundColor: onlyOpenNow ? 'rgba(34, 197, 94, 0.14)' : TOKENS.colors.surfaceElevated,
              color: onlyOpenNow ? '#15803D' : TOKENS.colors.textSecondary,
              border: `1px solid ${onlyOpenNow ? '#22C55E' : TOKENS.colors.borderLight}`,
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: onlyOpenNow ? '#22C55E' : 'none',
              }}
            />
            <span>Abierto Ahora</span>
          </button>
        </div>

        {/* Botón Limpiar Filtros si hay alguno activo */}
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setSelectedCity('');
              setSelectedCategory('todos');
              setQuery('');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#DC2626',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              marginTop: '4px',
              textAlign: 'center',
            }}
          >
            Limpiar todos los filtros
          </button>
        )}

        {/* Contador de filtros activos */}
        {activeFiltersCount > 0 && (
          <span
            style={{
              marginTop: '8px',
              fontSize: '0.72rem',
              color: TOKENS.colors.textMuted,
              textAlign: 'center',
            }}
          >
            {activeFiltersCount} filtro(s) activo(s)
          </span>
        )}
      </div>
    </div>
  );
}