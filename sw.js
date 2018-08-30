// *** [23d]-24a[bcde]
self.addEventListener('install', function(event)
{
  event.waitUntil(
    caches.open('pmpAppCache').then(function(cache) {
        return cache.addAll([ '/', '/index.html', '/client.js',
          '/aux/aux.js', '/style.css', '/manifest.json',
          '/aux/icon-144.png', '/aux/ibm.ttf', '/aux/quack.wav' ]);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.delete('pmpAppCache').then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request, {ignoreSearch:true})
    .then(function(response) {
      return response || fetch(event.request)
    })
  );
});