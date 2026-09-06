import { filterPublishedProviders } from './provider_directory.mjs';

function contains(value, query) {
  return String(value ?? '').toLowerCase().includes(String(query ?? '').toLowerCase());
}

export function resolveInventoryAccess({ actor, nodeEnv, localTestToken, presentedLocalTestToken } = {}) {
  if (actor?.id) {
    return { authorized: true, kind: actor.role === 'admin' ? 'admin' : 'owner' };
  }
  if (
    nodeEnv === 'test' &&
    typeof localTestToken === 'string' &&
    localTestToken.length > 0 &&
    presentedLocalTestToken === localTestToken
  ) {
    return { authorized: true, kind: 'local-test' };
  }
  return { authorized: false, kind: 'anonymous' };
}

export function filterInventoryItems(records, { city = '', category = '', search = '' } = {}) {
  return (Array.isArray(records) ? records : []).filter((record) =>
    (!city || contains(record.city, city)) &&
    (!category || contains(record.category, category)) &&
    (!search || contains(record.name, search) || contains(record.description, search) || (Array.isArray(record.services) && record.services.some((service) => contains(service, search))))
  );
}

export function filterPublicInventory(records, filters = {}) {
  return filterInventoryItems(filterPublishedProviders(records), filters);
}

/**
 * @param {{items?: unknown[], publicInventoryTotal?: number, filters?: {city?: string, category?: string, search?: string}, access?: {authorized: boolean}}} input
 */
export function buildInventoryApiContract(input = {}) {
  const { items, publicInventoryTotal = 0, filters = {}, access = { authorized: false } } = input;
  const safeItems = Array.isArray(items) ? items : [];
  const hasPublicFilter = Boolean(filters.city || filters.category || filters.search);
  const body = { items: safeItems, total: safeItems.length };

  if (!access.authorized && safeItems.length === 0) {
    if (!hasPublicFilter && publicInventoryTotal === 0) {
      body.emptyState = 'public_inventory_empty';
      body.message = 'Sin datos todavía';
    } else if (publicInventoryTotal > 0) {
      body.emptyState = 'filtered_no_results';
    }
  }

  return {
    body,
    headers: {
      'Cache-Control': access.authorized
        ? 'private, no-store'
        : 'public, s-maxage=30, stale-while-revalidate=300',
    },
  };
}
