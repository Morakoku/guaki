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

export function getVisibleMapBounds(city: string): MapBounds | null {
  const normalizedCity = city.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  return normalizedCity === 'medellin' ? MEDELLIN_VISIBLE_MAP_BOUNDS : null;
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
