'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TOKENS } from '../../lib/design-tokens';
import SearchBar from '../../components/ui/SearchBar';
import BusinessListItem from '../../components/ui/BusinessListItem';
import EmptyState from '../../components/ui/EmptyState';
import { AficheBusinessData } from '../../lib/demo_afiche';
import { trackEvent } from '../../lib/analytics';

interface SearchClientProps {
  // Inventario server-rendered desde el server component (ISR). La búsqueda en
  // vivo filtra estos datos client-side.
  initialBusinesses: AficheBusinessData[];
  initialQuery: string;
  initialCity: string;
}

export default function SearchClient({
  initialBusinesses,
  initialQuery,
  initialCity,
}: SearchClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);

  const handleSearchSubmit = (q: string, c: string) => {
    setQuery(q);
    if (c) setCity(c);
    if (q.trim()) {
      trackEvent({
        event_name: 'search_executed',
        metadata: {
          query: q.trim(),
          city: c || city || '',
          category: null,
          source: 'search_page',
        },
      });
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (c.trim()) params.set('city', c.trim());
      router.replace(`/search?${params.toString()}`);
    }
  };

  // Búsqueda en vivo client-side sobre el inventario ya server-rendered.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialBusinesses.filter((b) => {
      const matchQuery =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        (b.shortDescription && b.shortDescription.toLowerCase().includes(q));

      const matchCity =
        !city ||
        b.city.toLowerCase().includes(city.toLowerCase()) ||
        (b.address && b.address.toLowerCase().includes(city.toLowerCase()));

      return matchQuery && matchCity;
    });
  }, [initialBusinesses, query, city]);

  return (
    <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 20px 20px' }}>
      {/* Buscador Central (el mismo de la página principal) */}
      <div style={{ marginBottom: '14px' }}>
        <SearchBar
          initialQuery={query}
          initialCity={city}
          onSearchSubmit={handleSearchSubmit}
        />
      </div>

      {/* Contador de Resultados Centrado */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '22px' }}>
        <span style={{ fontSize: '0.86rem', color: TOKENS.colors.textSecondary, fontWeight: 700, textAlign: 'center' }}>
          {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
          {query.trim() ? ` para "${query.trim()}"` : ''}
          {city ? ` en ${city}` : ''}
        </span>
      </div>

      {/* Lista de Resultados */}
      {results.length === 0 ? (
        <EmptyState
          title="No encontramos negocios con esos términos"
          description="Intenta con otras palabras clave o sin filtrar por ciudad."
          actionHref="/directorio"
          actionText="Ver todo el directorio"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '840px', margin: '0 auto' }}>
          {results.map((b) => (
            <BusinessListItem key={b.id} business={b} />
          ))}
        </div>
      )}
    </section>
  );
}