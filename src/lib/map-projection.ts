export interface MapCoordinate {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapPosition {
  left: number;
  top: number;
}

const MEDELLIN_VISIBLE_MAP_BOUNDS: MapBounds = {
  north: 6.28,
  south: 6.14,
  east: -75.49,
  west: -75.64,
};

// 2026-09-24: bounds por ciudad — solo Medellín tenía (el mapa de las demás
// ciudades quedaba roto). Centros aproximados + spread urbano (~0.14°).
const CITY_BOUNDS: Record<string, MapBounds> = {
  medellin: MEDELLIN_VISIBLE_MAP_BOUNDS,
  bogota: { north: 4.76, south: 4.52, east: -74.03, west: -74.22 },
  cali: { north: 3.52, south: 3.32, east: -76.44, west: -76.62 },
  barranquilla: { north: 11.06, south: 10.86, east: -74.70, west: -74.92 },
  cartagena: { north: 10.46, south: 10.30, east: -75.44, west: -75.58 },
  bucaramanga: { north: 7.16, south: 7.04, east: -73.08, west: -73.20 },
  soacha: { north: 4.62, south: 4.51, east: -74.19, west: -74.25 },
  pereira: { north: 4.83, south: 4.73, east: -75.68, west: -75.77 },
  manizales: { north: 5.09, south: 5.01, east: -75.52, west: -75.55 },
  'santa marta': { north: 11.25, south: 11.16, east: -74.18, west: -74.23 },
  caracas: { north: 10.53, south: 10.41, east: -66.78, west: -66.95 },
  valencia: { north: 10.23, south: 10.14, east: -68.00, west: -68.05 },
  maracaibo: { north: 10.72, south: 10.60, east: -71.57, west: -71.67 },
  barquisimeto: { north: 10.11, south: 10.00, east: -69.35, west: -69.38 },
  maracay: { north: 10.29, south: 10.20, east: -67.62, west: -67.66 },
  'ciudad guayana': { north: 8.33, south: 8.23, east: -62.80, west: -62.85 },
  'merida': { north: 8.62, south: 8.54, east: -71.15, west: -71.18 },
  'san cristobal': { north: 7.79, south: 7.73, east: -72.25, west: -72.27 },
};

export function getVisibleMapBounds(city: string): MapBounds | null {
  const normalizedCity = city.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  return CITY_BOUNDS[normalizedCity] ?? null;
}

export function projectCoordinateToPercent(
  coordinate: MapCoordinate,
  bounds: MapBounds
): MapPosition | null {
  const { lat, lng } = coordinate;
  const { north, south, east, west } = bounds;

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    !Number.isFinite(north) ||
    !Number.isFinite(south) ||
    !Number.isFinite(east) ||
    !Number.isFinite(west) ||
    north <= south ||
    east <= west ||
    lat > north ||
    lat < south ||
    lng > east ||
    lng < west
  ) {
    return null;
  }

  return {
    left: ((lng - west) / (east - west)) * 100,
    top: ((north - lat) / (north - south)) * 100,
  };
}
