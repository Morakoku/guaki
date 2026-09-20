export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GuakiDataService, isSupabaseServiceConfigured } from '@/lib/supabase';
import { validateBusinessPayload, sanitizeString } from '@/lib/validation';
import { slugify } from '@/lib/site';

// Alta rápida pública de un negocio (proveedor) desde la landing /unete.
// NO requiere sesión ni login: el visitante deja su ficha en estado 'pending'
// (persistida como status 'draft', que es la cola "pending" de auditoría admin),
// y el equipo Guaki la audita antes de publicarla. Nunca publica por sí mismo.
export async function POST(request: NextRequest) {
  try {
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Cuerpo de solicitud inválido o JSON malformado.' },
        { status: 400 },
      );
    }

    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Datos de negocio inválidos.' }, { status: 400 });
    }

    // WhatsApp/contacto es el dato esencial de la ficha: lo exigimos aunque el
    // validador base lo trate como opcional.
    const whatsapp = sanitizeString(payload.whatsapp);
    if (!whatsapp || whatsapp.replace(/\D/g, '').length < 8) {
      return NextResponse.json(
        { error: 'Datos de negocio inválidos.', details: { whatsapp: 'Ingresa un número de WhatsApp válido.' } },
        { status: 400 },
      );
    }

    // Servicios: el formulario manda un texto breve; lo normalizamos a lista.
    const rawServices = sanitizeString(payload.services);
    const services = rawServices
      ? rawServices.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20)
      : [];
    const description = sanitizeString(payload.description) || rawServices;

    const validation = validateBusinessPayload(
      { ...payload, whatsapp, services, description },
      false,
    );
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: 'Datos de negocio inválidos.', details: validation.errors },
        { status: 400 },
      );
    }

    if (!isSupabaseServiceConfigured()) {
      return NextResponse.json(
        { error: 'PERSISTENCE_UNAVAILABLE', message: 'Durable Supabase persistence is required for business registration.' },
        { status: 503 },
      );
    }

    const baseName = validation.data.name || 'Negocio';
    const id = `GKI-${crypto.randomUUID()}`;
    // Sufijo corto aleatorio para evitar choques de slug entre fichas con el mismo nombre.
    const slug = `${slugify(baseName)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const created = await GuakiDataService.createPublicBusinessLead({
      id,
      slug,
      ...validation.data,
      whatsapp,
      services,
      description,
      plan: 'gratis',
      status: 'draft', // cola "pending" del panel de auditoría
      claimStatus: 'pending',
      source: 'public_register',
      ownerId: null,
      ownerEmail: null,
    });

    return NextResponse.json(
      {
        ok: true,
        id: created.id,
        slug: created.slug,
        name: created.name,
        status: 'pending',
        message: 'Tu ficha fue enviada a revisión. Te contactaremos para activarla.',
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno al registrar el negocio.' },
      { status: 500 },
    );
  }
}