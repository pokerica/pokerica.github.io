// *** 23d 25e
// *** 25abcdefghijk
var vrz= 'p25k';
self.addEventListener('install', function(event)
{
  event.waitUntil(
    caches.open(vrz).then(function(cache) {
        return cache.addAll([ '/',          
          'index.html', 'client.js',
          'aux/aux.js', 'style.css',
          'manifest.json', 'aux/icon-144.png',
          'aux/ibm.ttf', 'aux/quack.wav' ]);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event)
{
  event.waitUntil(
    caches.keys().then(function(ns) {
      return Promise.all(ns.map(function(nm) {
        if(nm !== vrz) {
          return caches.delete(nm); }
      }) );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request, {ignoreVary:true, ignoreSearch:true})
    .then(function(response) {
      return response || fetch(event.request)
    })
  );
});
