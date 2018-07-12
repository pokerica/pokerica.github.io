// *** r20abcdefghijk
self.addEventListener('install', e => {
  caches.delete('pmpAppCache').then(cache => {
      caches.open('pmpAppCache').then(cache => {
        return cache.addAll([ '/', '/index.html', '/client.js', '/icons/aux.js',
          '/style.css', '/manifest.json', '/icons/ibm.ttf', '/icons/quack.wav' ])
          .then(() => self.skipWaiting()); }); });
});
self.addEventListener('activate', event => {self.clients.claim(); });
self.addEventListener('fetch', event => {event.respondWith(
  caches.match(event.request, {ignoreSearch:true})
    .then( response => {return response || fetch(event.request)} ) );
});
