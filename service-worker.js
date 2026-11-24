const CACHE_NAME = 'fincontrole-v3';
const ASSETS = [
  './',
  './index.html',
  './instalar.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Origins that are safe to cache (same-origin only)
const ALLOWED_ORIGINS = [location.origin];

function isAllowedOrigin(url) {
  try {
    const u = new URL(url);
    return ALLOWED_ORIGINS.includes(u.origin);
  } catch {
    return false;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Network-first: always try to get the freshest version when online.
  // Falls back to the last cached copy only when there's no connection.
  // Skip caching cross-origin requests (e.g., Google Fonts) to avoid opaque response pollution
  if (!isAllowedOrigin(event.request.url)) {
    return fetch(event.request).catch(() => caches.match(event.request));
  }
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response && response.status === 200 && response.type === 'basic') {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      // Add security headers to responses
      const headers = new Headers(response.headers);
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('X-Frame-Options', 'DENY');
      headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      headers.set('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
      });
    }).catch(() => caches.match(event.request))
  );
});

// Best-effort: allow the app to ask the service worker to show a notification
// even if triggered from a background message. Real "closed app" scheduled
// notifications are not guaranteed on Android web apps; this is a best-effort layer.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag } = event.data;
    self.registration.showNotification(title, {
      body,
      tag,
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      vibrate: [100, 50, 100]
    });
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'fincontrole-check') {
    event.waitUntil(
      self.registration.showNotification('FinControle', {
        body: 'Abra o app para conferir seus lançamentos de hoje.',
        icon: './icons/icon-192.png'
      })
    );
  }
});
