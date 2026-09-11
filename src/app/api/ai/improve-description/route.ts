import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = [
  'Eres un editor experto en textos comerciales para una guía de negocios locales en Colombia y Venezuela.',
  'Reescribe la presentación del negocio para que suene humana, cálida y concreta: corrige ortografía y puntuación,',
  'elimina relleno y clichés, y usa máximo 3 frases (~450 caracteres).',
  'Reglas: NO inventes datos, precios, años, premios ni certificaciones que no aparezcan en el texto original.',
  'Mantén el idioma español. Devuelve únicamente el texto final, sin comillas ni explicaciones.',
].join(' ');

const ACCENT_FIXES: Record<string, string> = {
  atencion: 'atención',
  rapida: 'rápida',
  rapido: 'rápido',
  economicos: 'económicos',
  economicas: 'económicas',
  economico: 'económico',
  economica: 'económica',
  barberia: 'barbería',
  odontologia: 'odontología',
  peluqueria: 'peluquería',
  clinica: 'clínica',
  medico: 'médico',
  medica: 'médica',
  envio: 'envío',
  envios: 'envíos',
  unico: 'único',
  unica: 'única',
  facil: 'fácil',
  tambien: 'también',
  informacion: 'información',
  direccion: 'dirección',
  garantia: 'garantía',
  numero: 'número',
  telefono: 'teléfono',
  visitanos: 'visítanos',
  llamanos: 'llámanos',
  contactanos: 'contáctanos',
  agendate: 'agéndate',
  pidelo: 'pídelo',
  solicitalo: 'solicítalo',
  exito: 'éxito',
  anos: 'años',
  servicio: 'servicio',
  servicios: 'servicios',
  experiencia: 'experiencia',
  profesional: 'profesional',
  profesion: 'profesión',
};

function fixAccents(output: string): string {
  return output.replace(/\b([a-záéíóúñ]+)\b/gi, (word) => {
    const replacement = ACCENT_FIXES[word.toLowerCase()];
    if (!replacement) return word;
    return word[0] === word[0].toUpperCase()
      ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
      : replacement;
  });
}

function restoreProperNames(output: string, values: string[]): string {
  return values.filter(Boolean).reduce((acc, value) => {
    const stripped = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!stripped || stripped.toLowerCase() === value.toLowerCase()) return acc;
    const escaped = stripped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return acc.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), value);
  }, output);
}

function heuristicImprove(text: string, businessName?: string, category?: string, city?: string): string {
  let output = text
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,.;:!?])(?=[^\s\d])/g, '$1 ')
    .replace(/\.{2,}/g, '.')
    .replace(/!{2,}/g, '!');

  output = fixAccents(output);
  output = restoreProperNames(output, [businessName || '', city || '', category || '']);

  output = output.replace(
    /\s+(?:y\s+)?(?:ven\s+y\s+)?(visítanos\b|llámanos\b|contáctanos\b|escríbenos\b|agéndate\b|solicita\b|pide\b)/gi,
    (_match, cta: string) => `. ${cta.charAt(0).toUpperCase()}${cta.slice(1)}`,
  );

  output = output.replace(
    /((?:Visítanos|Llámanos|Contáctanos|Escríbenos|Agéndate))\s+(?!(?:en|por|de|a|hoy|ya|tu|nuestr[oa]s?)\b)(?=[a-záéíóúñ])/g,
    '$1, ',
  );

  output = output.replace(/([.!?]\s+)([a-záéíóúñ])/g, (_match, prefix: string, letter: string) => prefix + letter.toUpperCase());
  output = output.charAt(0).toUpperCase() + output.slice(1);
  if (!/[.!?…]$/.test(output)) output += '.';

  if (output.length < 90) {
    const servicio = category ? category.toLowerCase() : 'servicios';
    output = [
      businessName ? `${businessName} ofrece ${servicio} en ${city || 'tu ciudad'}.` : '',
      output,
      'Escríbenos por WhatsApp y con gusto te atendemos.',
    ]
      .filter(Boolean)
      .join(' ');
  }

  return output.slice(0, 600);
}

async function geminiImprove(apiKey: string, prompt: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
        }),
      },
    );
    if (!response.ok) return null;
    const data = await response.json().catch(() => null);
    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || '')
      .join('')
      .trim();
    return text || null;
  } catch {
    return null;
  }
}

async function openAiImprove(apiKey: string, prompt: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 400,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      }),
    });
    if (!response.ok) return null;
    const data = await response.json().catch(() => null);
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'AI_NOT_CONFIGURED' }, { status: 503 });
    }

    const session = request.cookies.get('guaki_session')?.value;
    if (!session || session.startsWith('dev-') || session.startsWith('usr_local_')) {
      return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    }
    const { data: actor, error: actorError } = await getSupabaseClient().auth.getUser(session);
    if (actorError || !actor.user) {
      return NextResponse.json({ error: 'SESSION_INVALID' }, { status: 401 });
    }
    if (actor.user.app_metadata?.role === 'client') {
      return NextResponse.json({ error: 'PROVIDER_WRITE_REQUIRED' }, { status: 403 });
    }

    const payload = await request.json().catch(() => null);
    const text = typeof payload?.text === 'string' ? payload.text.trim() : '';
    if (!text) {
      return NextResponse.json({ error: 'TEXT_REQUIRED' }, { status: 400 });
    }
    if (text.length > 2000) {
      return NextResponse.json({ error: 'TEXT_TOO_LONG' }, { status: 413 });
    }

    const businessName = typeof payload?.businessName === 'string' ? payload.businessName.trim() : '';
    const category = typeof payload?.category === 'string' ? payload.category.trim() : '';
    const city = typeof payload?.city === 'string' ? payload.city.trim() : '';

    const prompt = [
      businessName ? `Nombre del negocio: ${businessName}.` : '',
      category ? `Categoría: ${category}.` : '',
      city ? `Ciudad: ${city}.` : '',
      `Texto actual del comerciante: ${text}`,
    ]
      .filter(Boolean)
      .join(' ');

    const geminiKey = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_AI_API_KEY?.trim() || '';
    const openAiKey = process.env.OPENAI_API_KEY?.trim() || '';

    let improved: string | null = null;
    let engine = 'heuristic';

    if (geminiKey) {
      improved = await geminiImprove(geminiKey, prompt);
      if (improved) engine = 'gemini';
    }
    if (!improved && openAiKey) {
      improved = await openAiImprove(openAiKey, prompt);
      if (improved) engine = 'openai';
    }
    if (!improved) {
      improved = heuristicImprove(text, businessName, category, city);
      engine = 'heuristic';
    }

    return NextResponse.json({ text: improved.slice(0, 700), engine });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error mejorando el texto.' },
      { status: 500 },
    );
  }
}
