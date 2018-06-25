// *** ab
self.addEventListener('install', e => {
    caches.open('pmpAppCache')
    .then(cache => {
      return cache.addAll([ 
        '/', '/index.html', '/client.js', '/style.css', '/db', '/cchGm', 
        '/jquery-3.3.1.min.js', '/NoSleep.min.js', '/manifest.json',
        'https://fonts.googleapis.com/css?family=IBM+Plex+Mono',
        'https://cdn.glitch.com/4ff3f5e8-d90e-4a0f-baad-bfa9d7216b55/quack.wav'
      ]).then(() => self.skipWaiting());
    });
});

self.addEventListener('activate', event => {
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, {ignoreSearch:true})
      .then( response => {return response || fetch(event.request)} )
  );
});

