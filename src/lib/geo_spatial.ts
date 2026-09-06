/**
 * GUAKI GEOSPATIAL & CITY EXPERIENCE ENGINE (Capítulo 7: 121-130)
 * Haversine formula, Transit station indexing, ETA estimators, and Neighborhood zoning.
 */

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface TransitStation {
  name: string;
  system: 'Metro de Medellín' | 'TransMilenio' | 'Metroplus';
  city: string;
  lat: number;
  lng: number;
}

export const TRANSIT_STATIONS: TransitStation[] = [
  // Medellín
  { name: 'Estación Poblado', system: 'Metro de Medellín', city: 'Medellín', lat: 6.2125, lng: -75.5775 },
  { name: 'Estación Aguacatala', system: 'Metro de Medellín', city: 'Medellín', lat: 6.1953, lng: -75.5802 },
  { name: 'Estación Industriales', system: 'Metro de Medellín', city: 'Medellín', lat: 6.2295, lng: -75.5736 },
  { name: 'Estación Estadio', system: 'Metro de Medellín', city: 'Medellín', lat: 6.2536, lng: -75.5894 },
  { name: 'Estación San Antonio', system: 'Metro de Medellín', city: 'Medellín', lat: 6.2472, lng: -75.5694 },
  { name: 'Estación Envigado', system: 'Metro de Medellín', city: 'Medellín', lat: 6.1772, lng: -75.5898 },
  // Bogotá
  { name: 'Estación Calle 72', system: 'TransMilenio', city: 'Bogotá', lat: 4.6568, lng: -74.0594 },
  { name: 'Estación Calle 85', system: 'TransMilenio', city: 'Bogotá', lat: 4.6702, lng: -74.0583 },
  { name: 'Estación Virrey', system: 'TransMilenio', city: 'Bogotá', lat: 4.6775, lng: -74.0567 },
  { name: 'Estación Pepe Sierra', system: 'TransMilenio', city: 'Bogotá', lat: 4.6975, lng: -74.0538 },
];

/**
 * 122. Cálculo de distancia Haversine en kilómetros entre dos coordenadas
 */
export function calculateDistanceKm(loc1: GeoLocation, loc2: GeoLocation): number {
  const R = 6371; // Radio de la tierra en km
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Formatea la distancia para humanos (ej. "450 m" o "2.3 km")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * 126. Estimación de tiempos de llegada por modalidad de transporte
 */
export interface TravelTimes {
  walkingMin: number;
  cyclingMin: number;
  transitCarMin: number;
}

export function estimateTravelTimes(distanceKm: number): TravelTimes {
  // Velocidades promedio urbanas en Colombia
  const walkingMin = Math.max(1, Math.round((distanceKm / 4.8) * 60));
  const cyclingMin = Math.max(1, Math.round((distanceKm / 14) * 60));
  const transitCarMin = Math.max(2, Math.round((distanceKm / 22) * 60) + 3); // +3 min por semáforos/tráfico
  return { walkingMin, cyclingMin, transitCarMin };
}

/**
 * 127. Encuentra la estación de transporte masivo más cercana
 */
export function getNearestTransitStation(
  userOrBizLoc: GeoLocation,
  city?: string
): { station: TransitStation; distanceKm: number } | null {
  const filtered = city
    ? TRANSIT_STATIONS.filter((s) => s.city.toLowerCase() === city.toLowerCase())
    : TRANSIT_STATIONS;

  if (filtered.length === 0) return null;

  let nearest = filtered[0];
  let minDistance = calculateDistanceKm(userOrBizLoc, nearest);

  for (let i = 1; i < filtered.length; i++) {
    const d = calculateDistanceKm(userOrBizLoc, filtered[i]);
    if (d < minDistance) {
      minDistance = d;
      nearest = filtered[i];
    }
  }

  return { station: nearest, distanceKm: minDistance };
}

/**
 * 125. Zonas, Barrios y Comunas Destacadas
 */
export const CITY_SECTORS = {
  Medellín: [
    { name: 'El Poblado', slug: 'el-poblado', description: 'Milla de Oro, Provenza, Manila & Astorga' },
    { name: 'Laureles - Estadio', slug: 'laureles', description: 'Primer y Segundo Parque, San Joaquín' },
    { name: 'Envigado', slug: 'envigado', description: 'Jardines, Otraparte & Zona Centro' },
    { name: 'Belén', slug: 'belen', description: 'Rosales, Los Alpes & Parque de Belén' },
  ],
  Bogotá: [
    { name: 'Chapinero & Zona G', slug: 'chapinero', description: 'Chapinero Alto, Quinta Camacho & Zona Rosa' },
    { name: 'Usaquén & Santa Bárbara', slug: 'usaquen', description: 'Plaza de Usaquén, Unicentro & Cedritos' },
    { name: 'Chicó & Parque 93', slug: 'chico', description: 'Virrey, El Chicó & Cabrera' },
  ],
};
