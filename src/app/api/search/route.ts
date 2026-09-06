export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { eventBus } from '@/lib/event_bus';
import { parseSearchIntent } from '@/lib/search_intent.mjs';
import { getPublishedProviders } from '@/lib/published_providers';

function normalize(value: string) {
  return (value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

const STOP_WORDS = new Set([
  'un', 'una', 'unos', 'unas', 'el', 'la', 'los', 'las', 'de', 'del', 'en', 'para', 'por', 'con',
  'necesito', 'busco', 'quiero', 'donde', 'hay', 'cerca', 'disponible', 'hoy', 'ahora', 'abierto',
  'favor', 'hola', 'buenas', 'buenos', 'dias', 'tardes', 'noches', 'alrededor', 'aqui', 'que'
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() ?? '';
  const city = searchParams.get('city')?.trim() ?? '';
  const intent = parseSearchIntent(query, city);

  await eventBus.emit({
    eventType: 'search.query.executed',
    payload: { query, city, intent },
  });

  if (!query) {
    return NextResponse.json({
      query,
      city,
      intent,
      needsCity: intent.needsCity,
      results: [],
      total: 0,
      message: 'Escribe o habla lo que necesitas para empezar.',
    });
  }

  let providers;
  try {
    providers = await getPublishedProviders();
  } catch (cause) {
    const code = cause instanceof Error ? cause.message : 'GUAKI_DATA_UNAVAILABLE';
    if (code === 'GUAKI_SUPABASE_NOT_CONFIGURED') {
      return NextResponse.json(
        { query, city, intent, results: [], total: 0, message: 'Sin datos todavía' },
        { status: 503 },
      );
    }
    throw cause;
  }

  const normalizedCity = city ? normalize(city) : '';
  const normalizedQuery = normalize(query);
  const queryTokens = normalizedQuery.split(/\s+/).filter(t => t.length > 2 && !STOP_WORDS.has(t));

  const scoredResults = providers
    .map((provider) => {
      let score = 0;
      const pCity = normalize(provider.city || '');
      const pName = normalize(provider.name || '');
      const pCat = normalize(provider.category || '');
      const pDesc = normalize(provider.description || '');
      const pShort = normalize(provider.short_description || '');
      const pAddress = normalize(provider.address || '');

      // Coincidencia de ciudad
      if (normalizedCity && pCity !== normalizedCity && !pAddress.includes(normalizedCity)) {
        return null; // No coincide con la ciudad filtrada
      }

      // Si el intent tiene categoría detectada
      if (intent.categoryHint) {
        const catHint = normalize(intent.categoryHint);
        if (pCat.includes(catHint) || catHint.includes(pCat)) {
          score += 10;
        } else if (
          (catHint === 'peluqueria' && (pCat.includes('belleza') || pCat.includes('spa') || pCat.includes('peluqueria'))) ||
          (catHint === 'estetica' && (pCat.includes('belleza') || pCat.includes('spa') || pCat.includes('peluqueria'))) ||
          (catHint === 'construccion' && (pCat.includes('servicios') || pDesc.includes('plomer') || pDesc.includes('electric'))) ||
          (catHint === 'clinica' && (pCat.includes('salud') || pCat.includes('medicina') || pCat.includes('odontolog')))
        ) {
          score += 8;
        }
      }

      // Coincidencia exacta de query
      const fullText = `${pName} ${pCat} ${pDesc} ${pShort} ${pAddress}`;
      if (fullText.includes(normalizedQuery)) {
        score += 12;
      }

      // Coincidencias por tokens clave
      for (const token of queryTokens) {
        if (pName.includes(token)) score += 6;
        else if (pCat.includes(token)) score += 5;
        else if (pShort.includes(token) || pDesc.includes(token)) score += 3;
        else if (pAddress.includes(token)) score += 2;
      }

      if (score === 0) return null;

      // H-04 FIX: No fabricated rating fallback. Businesses without real reviews get zero bonus.
      const ratingBonus = (provider.rating ?? 0) * 0.5;
      score += ratingBonus;

      return { provider, score };
    })
    .filter((item): item is { provider: any; score: number } => item !== null)
    .sort((a, b) => b.score - a.score)
    .map(item => item.provider);

  return NextResponse.json(
    {
      query,
      city,
      intent,
      needsCity: intent.needsCity,
      results: scoredResults,
      total: scoredResults.length,
      message: scoredResults.length ? undefined : 'No encontramos resultados exactos.',
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300',
      },
    }
  );
}
