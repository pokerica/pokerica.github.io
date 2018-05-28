// *** 012345




//'use strict';
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('pmpAppCache')
    .then(cache => {
      return cache.addAll([ 
        '/', '/index.html', '/client.js', '/style.css', '/db', '/cchGm', 
        '/jquery-1.12.4.min.js', '/NoSleep.min.js', '/manifest.json',
        'https://raw.githubusercontent.com/pokerica/pokerica.github.io/data/qua.wav',
        'https://raw.githubusercontent.com/pokerica/pokerica.github.io/data/che.wav',
        'https://raw.githubusercontent.com/pokerica/pokerica.github.io/data/cli.wav',
        'https://raw.githubusercontent.com/pokerica/pokerica.github.io/data/cha.wav'
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
