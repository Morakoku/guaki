export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

interface ReverseGeoResponse {
  address?: {
    neighbourhood?: string;
    suburb?: string;
    city_district?: string;
    city?: string;
    town?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
  display_name?: string;
}

// Centros urbanos de referencia (Colombia) para fallback por distancia
const KNOWN_COLOMBIAN_REGIONS = [
  { name: 'Ciudad Verde, Soacha', city: 'Soacha', lat: 4.5847, lng: -74.2251 },
  { name: 'El Poblado, Medellín', city: 'Medellín', lat: 6.2088, lng: -75.5684 },
  { name: 'Laureles, Medellín', city: 'Medellín', lat: 6.2425, lng: -75.5925 },
  { name: 'Centro, Medellín', city: 'Medellín', lat: 6.2442, lng: -75.5701 },
  { name: 'Chapinero, Bogotá', city: 'Bogotá', lat: 4.6486, lng: -74.0628 },
  { name: 'Usaquén, Bogotá', city: 'Bogotá', lat: 4.6974, lng: -74.0305 },
  { name: 'Fontibón, Bogotá', city: 'Bogotá', lat: 4.6750, lng: -74.1436 },
  { name: 'San Fernando, Cali', city: 'Cali', lat: 3.4286, lng: -76.5414 },
  { name: 'El Peñón, Cali', city: 'Cali', lat: 3.4500, lng: -76.5380 },
  { name: 'El Prado, Barranquilla', city: 'Barranquilla', lat: 10.9998, lng: -74.8016 },
  { name: 'Cabecera, Bucaramanga', city: 'Bucaramanga', lat: 7.1193, lng: -73.1096 },
];

// Centros urbanos de referencia (Venezuela) para fallback por distancia
const KNOWN_VENEZUELAN_REGIONS = [
  { name: 'Chacao, Caracas', city: 'Caracas', lat: 10.4961, lng: -66.8517 },
  { name: 'Las Mercedes, Caracas', city: 'Caracas', lat: 10.4806, lng: -66.8595 },
  { name: 'El Viñedo, Valencia', city: 'Valencia', lat: 10.1620, lng: -68.0077 },
  { name: 'Bella Vista, Maracaibo', city: 'Maracaibo', lat: 10.6544, lng: -71.6406 },
  { name: 'Este, Barquisimeto', city: 'Barquisimeto', lat: 10.0678, lng: -69.3467 },
];

const KNOWN_REGIONS = [
  ...KNOWN_COLOMBIAN_REGIONS.map((region) => ({ ...region, country: 'Colombia' })),
  ...KNOWN_VENEZUELAN_REGIONS.map((region) => ({ ...region, country: 'Venezuela' })),
];

function countryFromCoordinates(lat: number, lng: number): string {
  if (lat >= 0.6 && lat <= 12.2 && lng >= -73.4 && lng <= -59.8) return 'Venezuela';
  if (lat >= -4.3 && lat <= 13.0 && lng >= -79.1 && lng <= -66.8) return 'Colombia';
  return 'Colombia';
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');

    if (!latParam || !lngParam) {
      return NextResponse.json(
        { error: 'Parámetros lat y lng son obligatorios.' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Coordenadas inválidas.' },
        { status: 400 }
      );
    }

    // 1. Intentar geocodificación inversa real con OpenStreetMap Nominatim
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`;
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'GUAKI-Marketplace-LocationService/1.0 (contacto@guaki.online)',
          'Accept-Language': 'es-CO,es;q=0.9',
        },
        signal: AbortSignal.timeout(3500),
      });

      if (response.ok) {
        const data = (await response.json()) as ReverseGeoResponse;
        if (data && data.address) {
          const addr = data.address;
          const barrio =
            addr.neighbourhood ||
            addr.suburb ||
            addr.city_district ||
            addr.county;
          const countryName = addr.country || countryFromCoordinates(lat, lng);
          const ciudad =
            addr.city ||
            addr.town ||
            addr.municipality ||
            addr.state ||
            countryName;

          let formatted = '';
          if (barrio && barrio !== ciudad) {
            formatted = `${barrio}, ${ciudad}`;
          } else {
            formatted = ciudad;
          }

          return NextResponse.json({
            success: true,
            lat,
            lng,
            locationName: formatted,
            city: ciudad,
            country: countryName,
            neighborhood: barrio || null,
            source: 'nominatim_live',
          });
        }
      }
    } catch {
      // Si falla Nominatim (timeout/rate limit), usamos cálculo de proximidad matemática
    }

    // 2. Fallback de proximidad matemática con las coordenadas GPS reales del usuario
    let nearest = KNOWN_REGIONS[0];
    let minDistance = getDistanceKm(lat, lng, nearest.lat, nearest.lng);

    for (const region of KNOWN_REGIONS) {
      const dist = getDistanceKm(lat, lng, region.lat, region.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = region;
      }
    }

    // Si está a menos de 45km de una ciudad conocida, retornar el nombre de la ciudad
    if (minDistance < 45) {
      return NextResponse.json({
        success: true,
        lat,
        lng,
        locationName: nearest.name,
        city: nearest.city,
        country: nearest.country,
        neighborhood: null,
        source: 'gps_proximity_fallback',
      });
    }

    // Ubicación fuera del catálogo principal: se resuelve el país por coordenadas
    const fallbackCountry = countryFromCoordinates(lat, lng);
    return NextResponse.json({
      success: true,
      lat,
      lng,
      locationName: `${fallbackCountry} (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
      city: fallbackCountry,
      country: fallbackCountry,
      neighborhood: null,
      source: 'gps_coordinates',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al procesar ubicación.' },
      { status: 500 }
    );
  }
}
