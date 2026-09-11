import type {
  BusinessRecord,
  BusinessStatus,
  BusinessSchedule,
  BusinessInquiry,
  BusinessReview,
} from './validation';

export type {
  BusinessRecord,
  BusinessStatus,
  BusinessSchedule,
  BusinessInquiry,
  BusinessReview,
};

export const DEFAULT_SCHEDULE: BusinessSchedule[] = [
  { day: 'Lunes', isOpen: true, hours: '8:00 a.m. - 6:00 p.m.' },
  { day: 'Martes', isOpen: true, hours: '8:00 a.m. - 6:00 p.m.' },
  { day: 'Miércoles', isOpen: true, hours: '8:00 a.m. - 6:00 p.m.' },
  { day: 'Jueves', isOpen: true, hours: '8:00 a.m. - 6:00 p.m.' },
  { day: 'Viernes', isOpen: true, hours: '8:00 a.m. - 6:00 p.m.' },
  { day: 'Sábado', isOpen: true, hours: '8:00 a.m. - 2:00 p.m.' },
  { day: 'Domingo', isOpen: false, hours: 'Cerrado' },
];

export function calculateProfileProgress(b: Partial<BusinessRecord>): number {
  if (!b) return 0;
  let score = 0;
  if (b.name && b.name.trim().length >= 2) score += 15;
  if (b.category && b.category.trim().length > 0) score += 10;
  if (b.description && b.description.trim().length >= 20) score += 15;
  if (b.city && b.city.trim().length > 0) score += 10;
  if (b.address && b.address.trim().length > 0) score += 10;
  if (b.phone || b.whatsapp) score += 15;
  if (b.services && b.services.length >= 2) score += 15;
  if ((b.images && b.images.length > 0) || b.website) score += 10;
  if (b.schedule && b.schedule.length > 0) score += 5;
  return Math.min(score, 100);
}

// 🏢 3 DEMOS OFICIALES POR CADA SERVICIO PRINCIPAL (Auditados y con datos reales de atención)
let businesses: BusinessRecord[] = [
  // ── 1. VETERINARIAS & MASCOTAS (3 Demos) ──
  {
    id: 'GKI-0001290',
    slug: 'veterinaria-pets-care-poblado',
    name: 'Veterinaria Pets & Care Poblado',
    category: 'Veterinarias',
    description: 'Centro médico veterinario integral 24 horas en El Poblado, Medellín. Especialistas en urgencias médicas, cirugía de tejidos blandos, laboratorio clínico y spa canino.',
    shortDescription: 'Urgencias 24h, cirugía especializada y spa veterinario en El Poblado.',
    city: 'Medellín',
    address: 'Carrera 43A # 14-27, El Poblado, Medellín, Colombia',
    lat: 6.2112,
    lng: -75.571,
    phone: '+57 304 333 8899',
    whatsapp: '+57 304 333 8899',
    website: 'https://petscarepoblado.co',
    plan: 'pro',
    logoUrl: '/images/veterinaria/hero.jpg',
    heroImage: '/images/veterinaria/hero.jpg',
    images: ['/images/veterinaria/hero.jpg', '/images/veterinaria/foto1.jpg', '/images/veterinaria/foto2.jpg'],
    services: ['Urgencias 24 Horas', 'Cirugía General', 'Hospitalización', 'Vacunación', 'Spa Canino'],
    features: ['Atención 24/7', 'Laboratorio Propio', 'Respuesta WhatsApp < 1 min'],
    schedule: DEFAULT_SCHEDULE,
    inquiries: [],
    reviews: [{ id: 'r1', businessId: 'GKI-VET-001', authorName: 'Camila Restrepo', rating: 5, comment: 'Excelente atención de urgencias un domingo en la noche.', createdAt: '2026-08-10T12:00:00Z' }],
    status: 'published',
    rating: 4.95,
    reviewCount: 38,
    isVerified: true,
  },
  {
    id: 'GKI-VET-002',
    slug: 'clinica-veterinaria-san-francisco-laureles',
    name: 'Clínica Veterinaria San Francisco Laureles',
    category: 'Veterinarias',
    description: 'Atención médica veterinaria preventiva, ecografía diagnóstica, ortopedia y cardiología para perros y gatos en el corazón de Laureles.',
    shortDescription: 'Especialistas en medicina interna, ecografía y cardiología veterinaria.',
    city: 'Medellín',
    address: 'Circular 4 # 73-18, Laureles, Medellín',
    lat: 6.2442,
    lng: -75.5912,
    phone: '+57 311 445 7788',
    whatsapp: '+57 311 445 7788',
    website: '',
    plan: 'pro',
    logoUrl: '/images/veterinaria/foto1.jpg',
    heroImage: '/images/veterinaria/foto1.jpg',
    images: ['/images/veterinaria/foto1.jpg', '/images/veterinaria/foto2.jpg'],
    services: ['Medicina Interna', 'Ecografía & Rayos X', 'Cardiología Veterinaria', 'Consulta General'],
    features: ['Especialistas certificados', 'Equipos digitales de alta precisión'],
    schedule: DEFAULT_SCHEDULE,
    inquiries: [],
    reviews: [{ id: 'r2', businessId: 'GKI-VET-002', authorName: 'Mateo Gómez', rating: 5, comment: 'Salvaron a mi gato con su diagnóstico rápido.', createdAt: '2026-08-12T10:00:00Z' }],
    status: 'published',
    rating: 4.9,
    reviewCount: 29,
    isVerified: true,
  },
  {
    id: 'GKI-VET-003',
    slug: 'centro-medico-animal-doggy-envigado',
    name: 'Centro Médico Animal & Spa Doggy',
    category: 'Veterinarias',
    description: 'Clínica veterinaria y centro de bienestar integral en Envigado. Guardería campestre, estética profesional y medicina biológica.',
    shortDescription: 'Estética canina sin estrés, medicina biológica y guardería campestre.',
    city: 'Medellín',
    address: 'Calle 38 Sur # 41-15, Envigado',
    lat: 6.1759,
    lng: -75.5917,
    phone: '+57 302 556 9911',
    whatsapp: '+57 302 556 9911',
    website: '',
    plan: 'pro',
    logoUrl: '/images/veterinaria/foto2.jpg',
    heroImage: '/images/veterinaria/foto2.jpg',
    images: ['/images/veterinaria/foto2.jpg', '/images/veterinaria/foto3.jpg'],
    services: ['Grooming & Spa Canino', 'Medicina Preventiva', 'Odontología Preventiva', 'Guardería'],
    features: ['Sin jaulas', 'Sedación cero para baños', 'Ambiente tranquilo'],
    schedule: DEFAULT_SCHEDULE,
    inquiries: [],
    reviews: [{ id: 'r3', businessId: 'GKI-VET-003', authorName: 'Lucía Echeverri', rating: 4.8, comment: 'El mejor spa de Envigado, dejan a mi perrita impecable.', createdAt: '2026-08-14T15:00:00Z' }],
    status: 'published',
    rating: 4.85,
    reviewCount: 22,
    isVerified: true,
  },

  // ── 2. ODONTOLOGÍA & SALUD DENTAL (3 Demos) ──
  {
    id: 'GKI-ODO-001',
    slug: 'dentisalud-estetica-dental-poblado',
    name: 'DentiSalud Estética Dental Poblado',
    category: 'Odontología',
    description: 'Centro odontológico de alta estética en El Poblado. Diseño de sonrisa digital, ortodoncia invisible Invisalign y rehabilitación sobre implantes.',
    shortDescription: 'Diseño de sonrisa digital, Invisalign e implantes dentales en El Poblado.',
    city: 'Medellín',
    address: 'Carrera 42 # 5 Sur-45, El Poblado, Medellín',
    lat: 6.201,
    lng: -75.575,
    phone: '+57 300 789 1234',
    whatsapp: '+57 300 789 1234',
    website: '',
    plan: 'pro',
    logoUrl: '/images/dental/hero.jpg',
    heroImage: '/images/dental/hero.jpg',
    images: ['/images/dental/hero.jpg', '/images/dental/foto1.jpg', '/images/dental/foto2.jpg'],
    services: ['Diseño de Sonrisa 3D', 'Ortodoncia Invisible', 'Implantes Dentales', 'Aclaramiento Láser'],
    features: ['Escaner intraoral 3D', 'Financiación directa', 'Atención personalizada'],
    schedule: DEFAULT_SCHEDULE,
    inquiries: [],
    reviews: [{ id: 'ro1', businessId: 'GKI-ODO-001', authorName: 'Esteban Calle', rating: 5, comment: 'Quedé encantado con mi diseño de sonrisa, súper natural.', createdAt: '2026-08-05T14:00:00Z' }],
    status: 'published',
    rating: 4.98,
    reviewCount: 45,
    isVerified: true,
  },
  {
    id: 'GKI-ODO-002',
    slug: 'oral-art-studio-dental-laureles',
    name: 'Oral Art Studio Dental & Ortodoncia',
    category: 'Odontología',
    description: 'Especialistas en ortodoncia de autoligado, endodoncia microscópica y odontopediatría sin dolor en Laureles.',
    shortDescription: 'Ortodoncia avanzada, endodoncia y odontología familiar sin dolor.',
    city: 'Medellín',
    address: 'Avenida Nutibara # 72-10, Laureles, Medellín',
    lat: 6.242,
    lng: -75.589,
    phone: '+57 310 654 3210',
    whatsapp: '+57 310 654 3210',
    website: '',
    plan: 'pro',
    logoUrl: '/images/dental/foto1.jpg',
    heroImage: '/images/dental/foto1.jpg',
    images: ['/images/dental/foto1.jpg', '/images/dental/foto2.jpg', '/images/dental/foto3.jpg'],
    services: ['Ortodoncia Autoligado', 'Endodoncia Microscópica', 'Odontopediatría', 'Limpieza Profunda'],
    features: ['Tecnología sin dolor', 'Especialistas de la UdeA y CES'],
    schedule: DEFAULT_SCHEDULE,
    inquiries: [],
    reviews: [{ id: 'ro2', businessId: 'GKI-ODO-002', authorName: 'Natalia Pérez', rating: 4.9, comment: 'Excelente para niños y adultos con miedo al dentista.', createdAt: '2026-08-08T11:00:00Z' }],
    status: 'published',
    rating: 4.92,
    reviewCount: 31,
    isVerified: true,
  },
  {
    id: 'GKI-ODO-003',
    slug: 'centro-odontologico-san-lucas-envigado',
    name: 'Centro Odontológico San Lucas',
    category: 'Odontología',
    description: 'Clínica dental con urgencias diurnas, periodoncia y prótesis fija en Envigado. Calidez y tecnología al servicio de tu sonrisa.',
    shortDescription: 'Urgencias dentales diurnas, prótesis y periodoncia especializada.',
    city: 'Medellín',
    address: 'Calle 36 Sur # 43A-28, Envigado',
    lat: 6.172,
    lng: -75.588,
    phone: '+57 315 987 6543',
    whatsapp: '+57 315 987 6543',
    website: '',
    plan: 'pro',
    logoUrl: '/images/dental/foto2.jpg',
    heroImage: '/images/dental/foto2.jpg',
    images: ['/images/dental/foto2.jpg', '/images/dental/foto3.jpg'],
    services: ['Urgencias Odontológicas', 'Periodoncia', 'Prótesis Fija y Removible', 'Cirugía de Cordales'],
    features: ['Atención el mismo día', 'Precios justos y transparentes'],
    schedule: DEFAULT_SCHEDULE,
    inquiries: [],
    reviews: [{ id: 'ro3', businessId: 'GKI-ODO-003', authorName: 'Andrés Villa', rating: 4.8, comment: 'Me atendieron de urgencia por un dolor fuerte y fueron muy amables.', createdAt: '2026-08-11T16:00:00Z' }],
    status: 'published',
    rating: 4.86,
    reviewCount: 19,
    isVerified: true,
  },

  // ── 3. BELLEZA, PELUQUERÍA & SPA (3 Demos) ──
  {
    id: 'GKI-BEL-001',
    slug: 'peluqueria-barber-studio-laura-poblado',
    name: 'Peluquería & Barber Studio Laura',
    category: 'Peluquería',
    description: 'Salón de belleza y barbería premium en El Poblado. Balayage, alisados orgánicos, corte de dama, corte de caballero y diseño de barba.',
    shortDescription: 'Balayage experto, alisados orgánicos y barbería ejecutiva en El Poblado.',
    city: 'Medellín',
    address: 'Calle 10 # 36-22, El Poblado, Medellín',
    lat: 6.208,
    lng: -75.568,
    phone: '+57 301 234 5678',
    whatsapp: '+57 301 234 5678',
    website: '',
    plan: 'pro',
    logoUrl: '/images/belleza/hero.jpg',
    heroImage: '/images/belleza/hero.jpg',
    images: ['/images/belleza/hero.jpg', '/images/belleza/foto1.jpg', '/images/belleza/foto2.jpg'],
    services: ['Balayage & Colorimetría', 'Corte Dama & Caballero', 'Alisado Orgánico de Keratina', 'Diseño de Barba'],
    features: ['Productos libres de formol', 'Bebida de cortesía', 'Citas puntuales'],
    schedule: DEFAULT_SCHEDULE,
    inquiries: [],
    reviews: [{ id: 'rb1', businessId: 'GKI-BEL-001', authorName: 'Valentina Osorio', rating: 5, comment: 'Mi balayage quedó perfecto y el cabello súper sano.', createdAt: '2026-08-09T18:00:00Z' }],
    status: 'published',
    rating: 4.96,
    reviewCount: 52,
    isVerified: true,
  },
  {
    id: 'GKI-BEL-002',
    slug: 'diva-spa-cuidado-facial-organico-laureles',
    name: 'Diva Spa & Cuidado Facial Orgánico',
    category: 'Belleza & Spa',
    description: 'Spa de relajación y estética facial en Laureles. Masajes descontracturantes con piedras volcánicas, hidrafacial y depilación láser indolora.',
    shortDescription: 'Masajes relajantes, hidrafacial y depilación láser en Laureles.',
    city: 'Medellín',
    address: 'Transversal 39B # 74B-12, Laureles, Medellín',
    lat: 6.246,
    lng: -75.594,
    phone: '+57 312 876 5432',
    whatsapp: '+57 312 876 5432',
    website: '',
    plan: 'pro',
    logoUrl: '/images/salud/hero.jpg',
    heroImage: '/images/salud/hero.jpg',
    images: ['/images/salud/hero.jpg', '/images/salud/foto1.jpg', '/images/salud/foto2.jpg'],
    services: ['Masaje Relajante & Piedras Volcánicas', 'Limpieza Hidrafacial Profunda', 'Depilación Láser Diodo', 'Uñas Semipermanentes'],
    features: ['Cabinas privadas aromáticas', 'Terapeutas profesionales'],
    schedule: DEFAULT_SCHEDULE,
    inquiries: [],
    reviews: [{ id: 'rb2', businessId: 'GKI-BEL-002', authorName: 'Juliana Henao', rating: 4.9, comment: 'El mejor masaje relajante que he tenido en Medellín.', createdAt: '2026-08-13T17:00:00Z' }],
    status: 'published',
    rating: 4.93,
    reviewCount: 41,
    isVerified: true,
  },
  {
    id: 'GKI-BEL-003',
    slug: 'barberia-clasica-salon-don-pedro-envigado',
    name: 'Barbería Clásica & Salón Don Pedro',
    category: 'Peluquería',
    description: 'Barbería tradicional con toalla caliente, perfilado de barba a navaja y cortes modernos en Envigado.',
    shortDescription: 'Afeitado tradicional con toalla caliente y cortes clásicos en Envigado.',
    city: 'Medellín',
    address: 'Carrera 41 # 37 Sur-20, Envigado',
    lat: 6.174,
    lng: -75.589,
    phone: '+57 305 432 1098',
    whatsapp: '+57 305 432 1098',
    website: '',
    plan: 'pro',
    logoUrl: '/images/belleza/foto1.jpg',
    heroImage: '/images/belleza/foto1.jpg',
    images: ['/images/belleza/foto1.jpg', '/images/belleza/foto2.jpg'],
    services: ['Corte de Cabello Clásico y Fade', 'Perfilado de Barba con Toalla Caliente', 'Tratamiento Capilar Anticaída', 'Limpieza Facial Express'],
    features: ['Ambiente vintage con música jazz', 'Cerveza artesanal de cortesía'],
    schedule: DEFAULT_SCHEDULE,
    inquiries: [],
    reviews: [{ id: 'rb3', businessId: 'GKI-BEL-003', authorName: 'Carlos M.', rating: 4.85, comment: 'El ritual de afeitado con toalla caliente es inigualable.', createdAt: '2026-08-15T14:00:00Z' }],
    status: 'published',
    rating: 4.88,
    reviewCount: 34,
    isVerified: true,
  },

  // ── 4. RESTAURANTES & GASTRONOMÍA (3 Demos) ──
  {
    id: 'GKI-RES-001',
    slug: 'cafe-bistro-jardin-botanico-poblado',
    name: 'Café Bistro Jardín Botánico Gourmet',
    category: 'Restaurantes',
    description: 'Cocina de autor y café de especialidad de origen colombiano en una terraza jardín rodeada de naturaleza en El Poblado.',
    shortDescription: 'Café de origen, brunch artesanal y cocina de autor en El Poblado.',
    city: 'Medellín',
    address: 'Carrera 35 # 8A-40, Vía Provenza, El Poblado',
    lat: 6.209,
    lng: -75.567,
    phone: '+57 300 111 2233',
    whatsapp: '+57 300 111 2233',
    website: '',
    plan: 'pro',
    logoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80'],
    services: ['Brunch de Especialidad', 'Café Filtrado V60 y Chemex', 'Almuerzos Gourmet', 'Cócteles Botánicos'],
    features: ['Pet Friendly', 'Wi-Fi de alta velocidad para trabajo', 'Opciones veganas y sin gluten'],
    schedule: DEFAULT_SCHEDULE,
    inquiries: [],
    reviews: [{ id: 'rr1', businessId: 'GKI-RES-001', authorName: 'Mariana Duque', rating: 5, comment: 'El café y los huevos benedictinos son de otro mundo.', createdAt: '2026-08-07T10:30:00Z' }],
    status: 'published',
    rating: 4.97,
    reviewCount: 68,
    isVerified: true,
  },
  {
    id: 'GKI-RES-002',
    slug: 'trattoria-la-piccola-italia-laureles',
    name: 'Trattoria La Piccola Italia',
    category: 'Restaurantes',
    description: 'Pastas frescas artesanales hechas a mano diariamente, pizzas al horno de leña y vinos italianos seleccionados en Laureles.',
    shortDescription: 'Pastas frescas artesanales y pizzas al horno de leña en Laureles.',
    city: 'Medellín',
    address: 'Circular 2 # 70-08, Laureles, Medellín',
    lat: 6.243,
    lng: -75.592,
    phone: '+57 314 555 6677',
    whatsapp: '+57 314 555 6677',
    website: '',
    plan: 'pro',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'],
    services: ['Pastas Caseras', 'Pizza Margherita DOC', 'Lasaña Tradicional', 'Tiramisú Clásico'],
    features: ['Chef italiano nativo', 'Horno de leña auténtico', 'Cava de vinos'],
    schedule: DEFAULT_SCHEDULE,
    inquiries: [],
    reviews: [{ id: 'rr2', businessId: 'GKI-RES-002', authorName: 'Sebastián Vélez', rating: 4.9, comment: 'Auténtico sabor italiano en Medellín, la pasta carbonara 10/10.', createdAt: '2026-08-11T20:00:00Z' }],
    status: 'published',
    rating: 4.91,
    reviewCount: 54,
    isVerified: true,
  },
  {
    id: 'GKI-RES-003',
    slug: 'restaurante-fogon-paisa-tipico-envigado',
    name: 'Restaurante Fogón Paisa Típico',
    category: 'Restaurantes',
    description: 'Tradición gastronómica antioqueña: bandeja paisa con chicharrón crocante de 100 patas, sancocho trifásico y cazuela de frijoles en Envigado.',
    shortDescription: 'La auténtica bandeja paisa, cazuela de frijoles y sancocho en Envigado.',
    city: 'Medellín',
    address: 'Calle 39 Sur # 40-18, Parque de Envigado',
    lat: 6.173,
    lng: -75.587,
    phone: '+57 318 999 8877',
    whatsapp: '+57 318 999 8877',
    website: '',
    plan: 'pro',
    logoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'],
    services: ['Bandeja Paisa Completa', 'Sancocho Trifásico en Leña', 'Cazuela de Frijoles con Garra', 'Postres Tradicionales'],
    features: ['Porciones generosas', 'Ingredientes frescos de campesinos locales'],
    schedule: DEFAULT_SCHEDULE,
    inquiries: [],
    reviews: [{ id: 'rr3', businessId: 'GKI-RES-003', authorName: 'Diana Posada', rating: 4.88, comment: 'El mejor chicharrón de Envigado sin lugar a dudas.', createdAt: '2026-08-16T13:00:00Z' }],
    status: 'published',
    rating: 4.89,
    reviewCount: 47,
    isVerified: true,
  },

  // ── 5. SALUD & CONSULTAS MÉDICAS (3 Demos) ──
  {
    id: 'GKI-MED-001',
    slug: 'centro-medico-integral-fisioterapia-poblado',
    name: 'Centro Médico Integral & Fisioterapia Poblado',
    category: 'Salud',
    description: 'Medicina general particular, fisioterapia deportiva, rehabilitación postural y nutrición clínica en El Poblado.',
    shortDescription: 'Fisioterapia deportiva, medicina general y nutrición clínica en El Poblado.',
    city: 'Medellín',
    address: 'Calle 7 # 39-107, Torre Médica El Poblado',
    lat: 6.205,
    lng: -75.572,
    phone: '+57 302 333 4455',
    whatsapp: '+57 302 333 4455',
    website: '',
    plan: 'pro',
    logoUrl: '/images/salud/foto1.jpg',
    heroImage: '/images/salud/foto1.jpg',
    images: ['/images/salud/foto1.jpg', '/images/salud/foto2.jpg'],
    services: ['Consulta Médica Particular', 'Fisioterapia y Kinesiología', 'Nutrición Clínica', 'Terapia de Ondas de Choque'],
    features: ['Citas sin filas ni demoras', 'Instalaciones médicas modernas'],
    schedule: DEFAULT_SCHEDULE,
    inquiries: [],
    reviews: [{ id: 'rm1', businessId: 'GKI-MED-001', authorName: 'Felipe Cardona', rating: 5, comment: 'Me recuperé de mi lesión de rodilla gracias a sus fisioterapeutas.', createdAt: '2026-08-06T09:00:00Z' }],
    status: 'published',
    rating: 4.94,
    reviewCount: 36,
    isVerified: true,
  },
  {
    id: 'GKI-MED-002',
    slug: 'consultorio-pediatrico-familiar-vida-laureles',
    name: 'Consultorio Pediátrico & Familiar Vida',
    category: 'Salud',
    description: 'Atención médica pediátrica humanizada, control de crecimiento y desarrollo, vacunación y asesoría en lactancia materna en Laureles.',
    shortDescription: 'Pediatría con enfoque respetuoso, vacunación y control de desarrollo.',
    city: 'Medellín',
    address: 'Circular 73B # 39B-45, Laureles, Medellín',
    lat: 6.241,
    lng: -75.593,
    phone: '+57 313 777 8899',
    whatsapp: '+57 313 777 8899',
    website: '',
    plan: 'pro',
    logoUrl: '/images/salud/foto2.jpg',
    heroImage: '/images/salud/foto2.jpg',
    images: ['/images/salud/foto2.jpg', '/images/salud/hero.jpg'],
    services: ['Consulta Pediátrica', 'Control de Crecimiento', 'Asesoría en Lactancia', 'Vacunación Infantil'],
    features: ['Sala de espera con juegos sensoriales', 'Atención amorosa y empática'],
    schedule: DEFAULT_SCHEDULE,
    inquiries: [],
    reviews: [{ id: 'rm2', businessId: 'GKI-MED-002', authorName: 'Carolina Ruiz', rating: 5, comment: 'La doctora tiene una paciencia infinita con los bebés.', createdAt: '2026-08-10T14:30:00Z' }],
    status: 'published',
    rating: 4.96,
    reviewCount: 42,
    isVerified: true,
  },
  {
    id: 'GKI-MED-003',
    slug: 'optica-salud-visual-claridad-envigado',
    name: 'Óptica & Salud Visual Claridad',
    category: 'Salud',
    description: 'Optometría computarizada, examen de agudeza visual, lentes de contacto formulados y monturas exclusivas en Envigado.',
    shortDescription: 'Examen visual computarizado, lentes formulados y monturas de diseño.',
    city: 'Medellín',
    address: 'Carrera 43 # 38 Sur-12, Envigado',
    lat: 6.175,
    lng: -75.59,
    phone: '+57 301 666 5544',
    whatsapp: '+57 301 666 5544',
    website: '',
    plan: 'pro',
    logoUrl: '/images/salud/hero.jpg',
    heroImage: '/images/salud/hero.jpg',
    images: ['/images/salud/hero.jpg'],
    services: ['Examen Optométrico Completo', 'Lentes Progresivos Digitales', 'Adaptación Lentes de Contacto', 'Filtro Luz Azul'],
    features: ['Garantía de adaptación', 'Entrega rápida de lentes'],
    schedule: DEFAULT_SCHEDULE,
    inquiries: [],
    reviews: [{ id: 'rm3', businessId: 'GKI-MED-003', authorName: 'Gloria Marín', rating: 4.87, comment: 'Muy buena asesoría para escoger mis lentes progresivos.', createdAt: '2026-08-14T11:00:00Z' }],
    status: 'published',
    rating: 4.88,
    reviewCount: 25,
    isVerified: true,
  },

  // ── 6. SERVICIOS TÉCNICOS, HOGAR & LEGAL (3 Demos) ──
  {
    id: 'GKI-SER-001',
    slug: 'soluciones-tecnicas-plomeria-pro-24h',
    name: 'Soluciones Técnicas & Plomería Pro 24h',
    category: 'Servicios',
    description: 'Servicio técnico de urgencias domiciliarias en Medellín: plomería con geófono detector de fugas, destapes sin romper y electricidad.',
    shortDescription: 'Plomería con geófono, detección de fugas y electricidad domiciliaria 24h.',
    city: 'Medellín',
    address: 'Cobertura en todo Medellín, Envigado y Sabaneta',
    lat: 6.244,
    lng: -75.581,
    phone: '+57 319 888 7766',
    whatsapp: '+57 319 888 7766',
    website: '',
    plan: 'pro',
    logoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'],
    services: ['Detección de Fugas con Geófono', 'Destape de Cañerías con Sonda Eléctrica', 'Reparación de Calentadores', 'Instalaciones Eléctricas'],
    features: ['Llegada en menos de 45 minutos', 'Factura legal y garantía por escrito'],
    schedule: DEFAULT_SCHEDULE,
    inquiries: [],
    reviews: [{ id: 'rs1', businessId: 'GKI-SER-001', authorName: 'Guillermo Arango', rating: 5, comment: 'Llegaron rapidísimo y encontraron una fuga oculta sin romper el piso.', createdAt: '2026-08-13T21:00:00Z' }],
    status: 'published',
    rating: 4.95,
    reviewCount: 39,
    isVerified: true,
  },
  {
    id: 'GKI-SER-002',
    slug: 'estudio-juridico-abogados-asociados-poblado',
    name: 'Estudio Jurídico & Abogados Asociados',
    category: 'Abogados & Legal',
    description: 'Asesoría jurídica corporativa, derecho laboral, sucesiones, divorcios y tutelas en El Poblado, Medellín.',
    shortDescription: 'Derecho laboral, tutelas, contratos y sucesiones con abogados expertos.',
    city: 'Medellín',
    address: 'Carrera 43A # 1 Sur-180, Edificio San Fernando Plaza, El Poblado',
    lat: 6.202,
    lng: -75.574,
    phone: '+57 300 999 0011',
    whatsapp: '+57 300 999 0011',
    website: '',
    plan: 'pro',
    logoUrl: '/images/providers/legal-1.jpg',
    heroImage: '/images/providers/legal-1.jpg',
    images: ['/images/providers/legal-1.jpg', '/images/providers/legal-2.jpg'],
    services: ['Asesoría Laboral y Contratos', 'Acciones de Tutela y Derechos de Petición', 'Sucesiones y Herencias', 'Derecho Comercial'],
    features: ['Abogados especialistas titulados', 'Primera consulta de orientación clara'],
    schedule: DEFAULT_SCHEDULE,
    inquiries: [],
    reviews: [{ id: 'rs2', businessId: 'GKI-SER-002', authorName: 'Manuela Castaño', rating: 4.9, comment: 'Excelente asesoría jurídica para mi empresa.', createdAt: '2026-08-12T16:00:00Z' }],
    status: 'published',
    rating: 4.92,
    reviewCount: 28,
    isVerified: true,
  },
  {
    id: 'GKI-SER-003',
    slug: 'multiservicios-electricidad-mantenimiento-express',
    name: 'Multiservicios & Electricidad Express',
    category: 'Servicios',
    description: 'Mantenimiento preventivo y correctivo, cableado estructurado, iluminación LED y pintura para hogares y oficinas en Medellín.',
    shortDescription: 'Electricistas certificados, mantenimiento locativo y pintura express.',
    city: 'Medellín',
    address: 'Calle 44 # 65-30, San Joaquín, Medellín',
    lat: 6.248,
    lng: -75.586,
    phone: '+57 317 444 3322',
    whatsapp: '+57 317 444 3322',
    website: '',
    plan: 'pro',
    logoUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80'],
    services: ['Reparaciones Eléctricas de Urgencia', 'Iluminación y Lámparas LED', 'Pintura de Interiores', 'Instalación de Cerraduras Digitales'],
    features: ['Técnicos certificados por el SENA', 'Presupuestos transparentes sin sorpresas'],
    schedule: DEFAULT_SCHEDULE,
    inquiries: [],
    reviews: [{ id: 'rs3', businessId: 'GKI-SER-003', authorName: 'Jorge E. Restrepo', rating: 4.86, comment: 'Cambiaron todo el cableado de mi oficina en tiempo récord.', createdAt: '2026-08-15T18:00:00Z' }],
    status: 'published',
    rating: 4.87,
    reviewCount: 21,
    isVerified: true,
  },
];

export const BusinessStore = {
  getAll(): BusinessRecord[] {
    return businesses;
  },

  getPublished(): BusinessRecord[] {
    return businesses.filter((b) => b.status === 'published');
  },

  getByStatus(status: BusinessStatus): BusinessRecord[] {
    return businesses.filter((b) => b.status === status);
  },

  getById(id: string): BusinessRecord | undefined {
    return businesses.find((b) => b.id === id);
  },

  getBySlug(slug: string): BusinessRecord | undefined {
    const normalized = slug.toLowerCase().replace(/-and-/g, '-');
    return businesses.find(
      (b) => b.slug === slug || b.slug === normalized
    );
  },

  getMetrics() {
    const published = this.getPublished();
    const uniqueCategories = new Set(businesses.map((p) => p.category));
    const uniqueCities = new Set(businesses.map((p) => p.city));
    return {
      totalProviders: businesses.length,
      publishedProviders: published.length,
      totalCategories: uniqueCategories.size,
      totalCities: uniqueCities.size,
    };
  },

  getAuditQueue() {
    return {
      pending: businesses.filter((b) => b.status === 'in_audit'),
      inReview: businesses.filter((b) => b.status === 'in_audit'),
      approved: businesses.filter((b) => b.status === 'published'),
      rejected: businesses.filter((b) => b.status === 'rejected'),
    };
  },

  create(record: Partial<BusinessRecord>): BusinessRecord {
    const generatedId = record.id || 'GKI-' + Math.floor(1000000 + Math.random() * 9000000);
    const generatedSlug = record.slug || (record.name || 'negocio').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const completeRecord: BusinessRecord = {
      id: generatedId,
      slug: generatedSlug,
      name: record.name || 'Nuevo Negocio',
      category: record.category || 'Servicios',
      description: record.description || '',
      shortDescription: record.shortDescription || record.description || '',
      city: record.city || 'Medellín',
      address: record.address || '',
      phone: record.phone || '',
      whatsapp: record.whatsapp || record.phone || '',
      website: record.website || '',
      plan: record.plan || 'gratis',
      services: record.services || [],
      features: record.features || [],
      schedule: record.schedule || DEFAULT_SCHEDULE,
      inquiries: record.inquiries || [],
      reviews: record.reviews || [],
      images: record.images || [],
      status: record.status || 'draft',
      ownerId: record.ownerId ?? null,
      ownerEmail: record.ownerEmail ?? null,
      claimStatus: record.claimStatus || 'unclaimed',
      rating: record.rating || 5.0,
      reviewCount: record.reviewCount || 0,
      isVerified: record.isVerified ?? false,
      createdAt: record.createdAt || new Date().toISOString(),
    };

    const exists = businesses.findIndex((b) => b.id === completeRecord.id || b.slug === completeRecord.slug);
    if (exists !== -1) {
      businesses[exists] = completeRecord;
    } else {
      businesses.push(completeRecord);
    }
    return completeRecord;
  },

  delete(idOrSlug: string): boolean {
    const idx = businesses.findIndex((b) => b.id === idOrSlug || b.slug === idOrSlug);
    if (idx === -1) return false;
    businesses.splice(idx, 1);
    return true;
  },

  update(idOrSlug: string, data: Partial<BusinessRecord>): BusinessRecord | null {
    const b = this.getById(idOrSlug) || this.getBySlug(idOrSlug);
    if (!b) return null;
    Object.assign(b, data);
    return b;
  },

  addInquiry(idOrSlug: string, data: any): BusinessInquiry | null {
    const b = this.getById(idOrSlug) || this.getBySlug(idOrSlug);
    if (!b) return null;
    const inquiry: BusinessInquiry = {
      id: 'inq-' + Date.now(),
      businessId: b.id,
      clientName: data.clientName,
      clientContact: data.clientContact,
      message: data.message,
      createdAt: new Date().toISOString(),
      status: 'new',
    };
    b.inquiries = b.inquiries || [];
    b.inquiries.unshift(inquiry);
    return inquiry;
  },

  updateInquiryStatus(businessId: string, inquiryId: string, status: 'new' | 'contacted' | 'closed'): boolean {
    const b = this.getById(businessId) || this.getBySlug(businessId);
    if (!b || !b.inquiries) return false;
    const item = b.inquiries.find((i) => i.id === inquiryId);
    if (!item) return false;
    item.status = status;
    return true;
  },

  addReview(idOrSlug: string, data: any): BusinessReview | null {
    const b = this.getById(idOrSlug) || this.getBySlug(idOrSlug);
    if (!b) return null;
    const review: BusinessReview = {
      id: 'rev-' + Date.now(),
      businessId: b.id,
      authorName: data.authorName,
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date().toISOString(),
    };
    b.reviews = b.reviews || [];
    b.reviews.unshift(review);
    const sum = b.reviews.reduce((acc, r) => acc + r.rating, 0);
    b.rating = Number((sum / b.reviews.length).toFixed(2));
    b.reviewCount = b.reviews.length;
    return review;
  },

  submitForAudit(idOrSlug: string): { success: boolean; business?: BusinessRecord; error?: string; progress?: number } {
    const b = this.getById(idOrSlug) || this.getBySlug(idOrSlug);
    if (!b) return { success: false, error: 'Negocio no encontrado.' };
    const progress = calculateProfileProgress(b);
    b.status = 'in_audit';
    b.submittedAt = new Date().toISOString();
    return { success: true, business: b, progress };
  },

  claim(idOrSlug: string, actor: { userId: string; email: string }): { success: boolean; business?: BusinessRecord; error?: string; code?: string } {
    const b = this.getById(idOrSlug) || this.getBySlug(idOrSlug);
    if (!b) return { success: false, error: 'Negocio no encontrado.' };
    if (b.ownerId && b.ownerId !== actor.userId) return { success: false, code: 'BUSINESS_ALREADY_CLAIMED', error: 'Esta ficha ya tiene un propietario.' };
    b.ownerId = actor.userId;
    b.ownerEmail = actor.email;
    b.claimStatus = b.claimStatus === 'verified' ? 'verified' : 'pending';
    if (b.claimStatus === 'pending') {
      b.status = 'in_audit';
      b.submittedAt = b.submittedAt || new Date().toISOString();
    }
    return { success: true, business: b };
  },

  processAuditDecision(id: string, decision: 'approved' | 'rejected' | 'changes_requested', notes?: string): BusinessRecord | null {
    const b = this.getById(id);
    if (!b) return null;
    if (decision === 'approved') {
      b.status = 'published';
      b.approvedAt = new Date().toISOString();
      b.isVerified = true;
    } else if (decision === 'changes_requested') {
      b.status = 'draft';
      b.rejectionReason = notes || 'Changes requested';
    } else {
      b.status = 'rejected';
      b.rejectionReason = notes || 'Audit rejected';
    }
    return b;
  },
};
