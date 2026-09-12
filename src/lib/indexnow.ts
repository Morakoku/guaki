const INDEXNOW_HOST = 'guaki.online';
const INDEXNOW_KEY_FILE_FALLBACK = 'guaki-indexnow-master-key-2026';

/**
 * Notifica a IndexNow (Bing, Yandex, Naver, Seznam) URLs recién publicadas.
 * Fire-and-forget: nunca debe romper el flujo de auditoría/publicación.
 */
export async function pingIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY?.trim() || INDEXNOW_KEY_FILE_FALLBACK;
  const allowedHosts = new Set([INDEXNOW_HOST, `www.${INDEXNOW_HOST}`]);

  const urlList = urls.filter((value) => {
    try {
      return allowedHosts.has(new URL(value).hostname);
    } catch {
      return false;
    }
  });
  if (urlList.length === 0) return;

  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: INDEXNOW_HOST,
        key,
        keyLocation: `https://${INDEXNOW_HOST}/${key}.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    /* silencioso por diseño */
  }
}
