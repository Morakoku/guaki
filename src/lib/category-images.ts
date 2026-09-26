/**
 * Imagen por categoría + placeholder branded de GUAKI.
 * Punto único de verdad — 2026-09-23:
 *   Antes, cualquier ficha sin foto mostraba la de veterinaria (#ALTA, 2 sitios).
 *   Ahora: categoría conocida → su imagen local; desconocida → la branded.
 *
 * Cobertura de carpetas locales verificadas: belleza/, dental/, salud/,
 * veterinaria/, providers/ (+ fallback.svg siempre presente en origen).
 */

const CATEGORY_IMG: Array<[string[], string]> = [
  [['salud', 'clinica', 'clínica', 'médic', ' medic', 'fisio', 'psico'], '/images/salud/hero.jpg'],
  [['vet', 'mascota', 'pet'], '/images/veterinaria/hero.jpg'],
  [['dent', 'odont'], '/images/dental/hero.jpg'],
  [['bellez', 'salon', 'salón', 'peluq', 'uñas', 'nail', 'tatu'], '/images/belleza/hero.jpg'],
  [['spa', 'estetic', 'estétic'], '/images/providers/spa-1.jpg'],
  [['legal', 'abog', 'bufet'], '/images/providers/legal-1.jpg'],
];

export const GUAKI_FALLBACK_IMAGE = '/images/fallback.svg';

/** Imagen para la categoría; si no hay carpete local conocida, el placeholder nuevo. */
export function categoryImage(category?: string | null): string {
  const cat = (category || '').toLowerCase();
  for (const [keys, img] of CATEGORY_IMG) {
    if (keys.some((k) => cat.includes(k))) return img;
  }
  return GUAKI_FALLBACK_IMAGE;
}
