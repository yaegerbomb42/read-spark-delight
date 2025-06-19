const APP_CACHE = 'app-cache-v1';
const BOOK_CACHE = 'book-cache-v1';
const APP_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/placeholder.svg',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(APP_CACHE).then(cache => cache.addAll(APP_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== APP_CACHE && k !== BOOK_CACHE).map(k => caches.delete(k))
    ))
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin === location.origin && url.pathname.startsWith('/books/')) {
    event.respondWith(
      caches.open(BOOK_CACHE).then(cache =>
        cache.match(request).then(resp =>
          resp || fetch(request).then(r => { cache.put(request, r.clone()); return r; })
        )
      )
    );
    return;
  }

  if (request.method === 'GET' && url.origin === location.origin) {
    event.respondWith(
      caches.match(request).then(resp =>
        resp || fetch(request).then(r => {
          const clone = r.clone();
          caches.open(APP_CACHE).then(cache => cache.put(request, clone));
          return r;
        })
      )
    );
  }
});
