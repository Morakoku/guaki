'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SearchRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const city = searchParams.get('city') || '';
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (city) params.set('city', city);
    router.replace(`/directorio?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#16231D' }}>
      Cargando resultados...
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Cargando...</div>}>
      <SearchRedirect />
    </Suspense>
  );
}
