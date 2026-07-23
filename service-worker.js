const CACHE_NAME = 'fincontrole-v2';
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
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response && response.status === 200 && response.type === 'basic') {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return response;
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
