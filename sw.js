// *** ab
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('pmpAppCache')
    .then(cache => {
      return cache.addAll([ 
        '/', '/index.html', '/client.js', '/style.css', '/db', '/cchGm', 
        '/jquery-3.3.1.min.js', '/NoSleep.min.js', '/manifest.json',
        'https://raw.githubusercontent.com/pokerica/pokerica.github.io/data/qua.wav'
      ]).then(() => self.skipWaiting());
    })
  );
});

self.addEventListene;('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, {ignoreSearch:true})
      .then( response => {return response || fetch(event.request)} )
  );
});
