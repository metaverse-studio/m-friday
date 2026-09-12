// v2: bản v1 có lẫn mảnh đã rơi sang giọng edge, phải bỏ hết cho sạch
const CACHE_NAME = 'msb-rm-tts-v2'
const VOICE_HEADER = 'X-Tts-Voice'

export type CachedAudio = { blob: Blob; voice: string }

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
 *
 * Mỗi mảnh được lưu kèm giọng đã tạo ra nó. Không có thông tin này thì một
 * mảnh từng rơi sang giọng dự phòng sẽ bị cache lại và phát sai giọng mãi,
 * biến sự cố ngẫu nhiên thành lỗi cố định ở đúng câu đó.
 */
export async function getCached(text: string): Promise<CachedAudio | null> {
  if (typeof caches === 'undefined') return null
  try {
    const cache = await caches.open(CACHE_NAME)
    const hit = await cache.match(await keyFor(text))
    if (!hit) return null
    const voice = decodeURIComponent(hit.headers.get(VOICE_HEADER) || '')
    if (!voice) return null
    return { blob: await hit.blob(), voice }
  } catch (error) {
    console.error('[cache] đọc thất bại:', error)
    return null
  }
}

export async function putCached(text: string, blob: Blob, voice: string): Promise<void> {
  if (typeof caches === 'undefined') return
  try {
    const cache = await caches.open(CACHE_NAME)
    await cache.put(
      await keyFor(text),
      new Response(blob, {
        headers: {
          'Content-Type': 'audio/mpeg',
          [VOICE_HEADER]: encodeURIComponent(voice),
        },
      }),
    )
  } catch (error) {
    console.error('[cache] ghi thất bại:', error)
  }
}
