// Contenido SEO isomórfico: las preguntas frecuentes del sitio se comparten
// entre el render visible (GuakiFAQSection, cliente) y el JSON-LD FAQPage que
// emite el servidor en /nosotros. Una sola fuente evita divergencias entre lo
// que ve el usuario y lo que leen los buscadores.

export interface GuakiFaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const GUAKI_FAQS: GuakiFaqItem[] = [
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

export function buildGuakiFaqStructuredData() {
  return {
    '@type': 'FAQPage',
    mainEntity: GUAKI_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
