const CACHE_NAME = 'tutelage-v1';
const urlsToCache = [
  '/',
  '/css/style.css',
  '/js/script.js',
  '/images/logo 1.png',
  '/images/logo 2.png',
  // Add other critical assets
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});
