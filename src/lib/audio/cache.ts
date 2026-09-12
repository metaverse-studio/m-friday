const CACHE_NAME = 'msb-rm-tts-v1'

async function hashText(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32)
}

async function keyFor(text: string): Promise<string> {
  return `/tts-cache/${await hashText(text)}`
}

/**
 * Cache nằm phía client chứ không phải server, vì đây là điều kiện
 * để demo chạy được khi mất mạng hoàn toàn.
 */
export async function getCached(text: string): Promise<Blob | null> {
  if (typeof caches === 'undefined') return null
  try {
    const cache = await caches.open(CACHE_NAME)
    const hit = await cache.match(await keyFor(text))
    return hit ? await hit.blob() : null
  } catch (error) {
    console.error('[cache] đọc thất bại:', error)
    return null
  }
}

export async function putCached(text: string, blob: Blob): Promise<void> {
  if (typeof caches === 'undefined') return
  try {
    const cache = await caches.open(CACHE_NAME)
    await cache.put(
      await keyFor(text),
      new Response(blob, { headers: { 'Content-Type': 'audio/mpeg' } }),
    )
  } catch (error) {
    console.error('[cache] ghi thất bại:', error)
  }
}
