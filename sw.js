// *** abcdef
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('pmpAppCache')
    .then(cache => {
      return cache.addAll([ 
        '/', '/index.html', '/client.js', '/style.css', '/db', '/cchGm', 
        '/jquery-3.3.1.min.js', '/NoSleep.min.js', '/manifest.json',
        'https://cdn.glitch.com/3d55ae24-1d9b-4f07-a031-020eb383a488/qua.wav'
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
