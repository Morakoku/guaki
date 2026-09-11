const CATEGORY_HINTS = [
  { slug: 'peluqueria', pattern: /\b(peluqueria|peluquerias|barberia|barberias|barbero|peluquero|corte|cabello|estilista|peinado|balayage|alisado|keratina|tintura)\b/ },
  { slug: 'odontologia', pattern: /\b(dentista|odontologia|odontologo|odontologos|clinica dental|dientes|muela|me duele una muela|dolor de muela|ortodoncia|ortodoncia invisible|diseno de sonrisa|limpieza dental|implantes|calza|caries|blanqueamiento)\b/ },
  { slug: 'restaurante', pattern: /\b(restaurante|comida|almuerzo|cena|gastronomia|cafeteria|cafe|hamburguesa|pizza|sushi|tacos|asado|brunch)\b/ },
  { slug: 'clinica', pattern: /\b(clinica|clinicas|hospital|medico|medicos|doctor|salud|consulta medica|pediatra|fisioterapia|optica|dolor de espalda|torcedura|me duele la cabeza|oftalmologia|dermatologia)\b/ },
  { slug: 'abogados', pattern: /\b(abogado|abogados|estudio juridico|bufete|asesoria legal|derecho|tutela|litigio|notaria|divorcio|demanda|herencia|laboral|penal)\b/ },
  { slug: 'inmobiliaria', pattern: /\b(inmobiliaria|inmobiliarias|arriendo|arriendos|alquiler|finca raiz|venta de casas|apartamentos|comprar casa|avaluo)\b/ },
  { slug: 'veterinaria', pattern: /\b(veterinaria|veterinarias|veterinario|mascota|mascotas|perro|perros|gato|gatos|clinica veterinaria|guarderia canina|mi perro|mi gato|vacunas perro|desparasitacion|cirugia canina)\b/ },
  { slug: 'estetica', pattern: /\b(estetica|spa|masaje|masajes|unas|pestanas|cejas|facial|cuidado personal|depilacion|limpieza facial|rejuvenecimiento|microblading)\b/ },
  { slug: 'construccion', pattern: /\b(construccion|constructora|remodelacion|remodelaciones|plomero|electricista|pintura|obra civil|cerrajero|gotera|tuberia)\b/ },
];

const CITY_HINTS = [
  { name: 'Medellín', pattern: /\b(medellin|poblado|laureles|envigado|sabaneta|bello|itagui)\b/ },
  { name: 'Bogotá', pattern: /\b(bogota|usaquen|chapinero|suba|cedritos|chico)\b/ },
  { name: 'Cali', pattern: /\b(cali|granada|san antonio|chipichape)\b/ },
  { name: 'Barranquilla', pattern: /\b(barranquilla|el prado|villa campestre)\b/ },
  { name: 'Caracas', pattern: /\b(caracas|chacao|altamira|las mercedes|palos grandes)\b/ },
  { name: 'Valencia', pattern: /\b(valencia|prebo|viñedo|viniedo)\b/ },
  { name: 'Maracaibo', pattern: /\b(maracaibo|bella vista|5 de julio)\b/ },
  { name: 'Barquisimeto', pattern: /\b(barquisimeto|barquisimeto este)\b/ },
];

// 💡 115. Sugerencias Predictivas (Typeahead Suggestions)
export const SEARCH_PREDICTIONS = [
  { text: 'Veterinaria 24 Horas El Poblado', category: 'veterinaria', city: 'Medellín' },
  { text: 'Odontología & Ortodoncia Invisible', category: 'odontologia', city: 'Medellín' },
  { text: 'Clínica Dental & Urgencias', category: 'odontologia', city: 'Bogotá' },
  { text: 'Peluquería & Barbería Premium', category: 'peluqueria', city: 'Medellín' },
  { text: 'Clínica Dental & Ortodoncia en Caracas', category: 'odontologia', city: 'Caracas' },
  { text: 'Spa, Masajes & Estética Facial', category: 'estetica', city: 'Medellín' },
  { text: 'Abogado Laboral & Tutelas', category: 'abogados', city: 'Bogotá' },
  { text: 'Consulta Médica & Fisioterapia', category: 'clinica', city: 'Medellín' },
  { text: 'Arriendo de Apartamentos y Locales', category: 'inmobiliaria', city: 'Medellín' },
];

function normalize(value) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function parseSearchIntent(query, city) {
  const normalizedQuery = normalize(query ?? '');
  let detectedCity = (city ?? '').trim();

  // Si no se proporcionó ciudad o el usuario nombró una en la voz:
  for (const c of CITY_HINTS) {
    if (c.pattern.test(normalizedQuery)) {
      detectedCity = c.name;
      break;
    }
  }

  const category = CATEGORY_HINTS.find(({ pattern }) => pattern.test(normalizedQuery));

  return {
    query: (query ?? '').trim(),
    city: detectedCity,
    categoryHint: category?.slug ?? null,
    availability: /\b(hoy|ahora|abierto|atienda hoy|trabaje hoy|ya|urgente|urgencias|24 horas|24h|disponible)\b/.test(normalizedQuery) ? 'today' : null,
    nearby: /\b(cerca|cercano|cercana|aqui|por aqui|alrededor)\b/.test(normalizedQuery),
    needsCity: detectedCity.length === 0,
  };
}
