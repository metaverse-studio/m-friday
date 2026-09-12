const CACHE_NAME = 'msb-virtual-rm-v1'

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/audio/ringtone.mp3',
  '/audio/fallback/GREETING.mp3',
  '/audio/fallback/CASH_FLOW.mp3',
  '/audio/fallback/PERIOD_COMPARE.mp3',
  '/audio/fallback/OBLIGATION_CALENDAR.mp3',
  '/audio/fallback/TXN_HISTORY.mp3',
  '/audio/fallback/RECENT_ACTIONS.mp3',
  '/audio/fallback/TRADE_FINANCE.mp3',
  '/audio/fallback/FRAUD_ALERT.mp3',
  '/audio/fallback/APPROVE_FIDO.mp3',
  '/audio/fallback/REJECT_ORDER.mp3',
  '/audio/fallback/SUGGEST_CCTG.mp3',
  '/audio/fallback/FX_FORWARD.mp3',
  '/audio/fallback/LOAN_BALANCE.mp3',
  '/audio/fallback/CALL_HOTLINE.mp3',
  '/audio/fallback/SESSION_SUMMARY.mp3',
  '/audio/fallback/UNKNOWN.mp3',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key)
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Bỏ qua các yêu cầu API
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // Audio fallback và icon: Cache-First
  if (url.pathname.startsWith('/audio/') || url.pathname.endsWith('.png')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return response
        })
      }),
    )
    return
  }

  // Next.js static bundles: Stale-While-Revalidate
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return networkResponse
        })
        return cached || fetchPromise
      }),
    )
    return
  }

  // Navigation (HTML page): Network-First rơi về cached / khi offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/').then((cached) => cached || Response.error()),
      ),
    )
    return
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  )
})
