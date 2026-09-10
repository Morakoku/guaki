// Contenido SEO isomórfico: FAQs y horarios compartidos entre el servidor (JSON-LD)
// y los componentes cliente (render de la ficha).

export interface ProviderFaq {
  question: string;
  answer: string;
}

export function buildProviderFaqs({
  businessName,
  city,
  phone,
}: {
  businessName: string;
  city: string;
  phone: string;
}): ProviderFaq[] {
  return [
    {
      question: `¿Cómo puedo agendar o cotizar una cita con ${businessName}?`,
      answer: `Puedes agendar o consultar disponibilidad directamente a través del botón oficial de WhatsApp en Guaki o llamando a su línea directa (${phone}). La confirmación es inmediata y sin intermediarios.`,
    },
    {
      question: `¿Qué métodos de pago son aceptados?`,
      answer: `La mayoría de servicios aceptan transferencias directas (Bancolombia, Nequi, Daviplata), tarjetas débito/crédito y efectivo en sede.`,
    },
    {
      question: `¿${businessName} cuenta con verificación y auditoría en Guaki?`,
      answer: `Sí, ${businessName} cuenta con verificación oficial en Guaki. Su identidad comercial, ubicación física en ${city} y canales de contacto directo fueron auditados.`,
    },
    {
      question: `¿Atienden urgencias o servicios el mismo día?`,
      answer: `Para atenciones prioritarias o urgencias diurnas, te sugerimos contactar inmediatamente por WhatsApp indicando el motivo de la consulta para recibir respuesta prioritaria en menos de 5 minutos.`,
    },
  ];
}

const DAY_KEYWORD_TO_SCHEMA: Array<[string, string]> = [
  ['lunes a viernes', 'https://schema.org/Monday https://schema.org/Tuesday https://schema.org/Wednesday https://schema.org/Thursday https://schema.org/Friday'],
  ['lunes a sabado', 'https://schema.org/Monday https://schema.org/Tuesday https://schema.org/Wednesday https://schema.org/Thursday https://schema.org/Friday https://schema.org/Saturday'],
  ['todos los dias', 'https://schema.org/Monday https://schema.org/Tuesday https://schema.org/Wednesday https://schema.org/Thursday https://schema.org/Friday https://schema.org/Saturday https://schema.org/Sunday'],
  ['domingo', 'https://schema.org/Sunday'],
  ['festivo', 'https://schema.org/Sunday'],
  ['lunes', 'https://schema.org/Monday'],
  ['martes', 'https://schema.org/Tuesday'],
  ['miercoles', 'https://schema.org/Wednesday'],
  ['jueves', 'https://schema.org/Thursday'],
  ['viernes', 'https://schema.org/Friday'],
  ['sabado', 'https://schema.org/Saturday'],
];

const TIME_RE = /(\d{1,2})(?::(\d{2}))?\s*(?:-|a|al|hasta|–)\s*(\d{1,2}):?(\d{2})?/i;

export function buildOpeningHoursSpecification(
  schedule: Array<{ day?: string; hours?: string }> | undefined
) {
  if (!Array.isArray(schedule)) return [];
  const specs: Array<Record<string, unknown>> = [];

  for (const item of schedule) {
    const day = (item?.day ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const hours = item?.hours ?? '';
    if (!day || !hours) continue;
    if (day.includes('24') && hours.includes('24')) {
      for (const rank of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) {
        specs.push({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: `https://schema.org/${rank}`,
          opens: '00:00',
          closes: '23:59',
        });
      }
      continue;
    }
    const match = TIME_RE.exec(hours);
    if (!match) continue;
    const opens = `${String(match[1]).padStart(2, '0')}:${match[2] ?? '00'}`;
    const closes = `${String(match[3]).padStart(2, '0')}:${match[4] ?? '00'}`;
    const entry = DAY_KEYWORD_TO_SCHEMA.find(([keyword]) => day.includes(keyword));
    if (!entry) continue;
    specs.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: entry[1],
      opens,
      closes,
    });
  }

  return specs;
}
