const CACHE_NAME = 'poke-champions-ultimate-v1';

// കാഷെ (Cache) ചെയ്യേണ്ട നിങ്ങളുടെ ഒറിജിനൽ അസറ്റ്സുകൾ
const ASSETS_TO_CACHE = [
  '/pokemon-game/',
  '/pokemon-game/index.html',
  '/pokemon-game/index.css',
  '/pokemon-game/assets/index-C6TRSKfE.js',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js',
  'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'
];

// Service Worker ഇൻസ്റ്റാൾ ചെയ്യുമ്പോൾ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// പഴയ കാഷെകൾ ഡിലീറ്റ് ചെയ്ത് അപ്ഡേറ്റ് ചെയ്യാൻ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// നെറ്റ്‌വർക്ക് റിക്വസ്റ്റുകൾ ഹാൻഡിൽ ചെയ്യാൻ (Cache First, then Network)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // കാഷെയിൽ ഉണ്ടെങ്കിൽ അത് നൽകുക
      if (response) {
        return response;
      }
      
      // ഇല്ലെങ്കിൽ ഇന്റർനെറ്റിൽ നിന്നും ഡൗൺലോഡ് ചെയ്യുക
      return fetch(event.request).then((fetchResponse) => {
        // PokeAPI ഇമേജുകൾ ഡൈനാമിക് ആയി കാഷെ ചെയ്യാൻ (ഓപ്ഷണൽ)
        if (event.request.url.includes('raw.githubusercontent.com/PokeAPI')) {
          let responseClone = fetchResponse.clone();
          caches.open('poke-api-images-v1').then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return fetchResponse;
      });
    }).catch(() => {
      // ഇന്റർനെറ്റ് ഇല്ലെങ്കിൽ കാണിക്കേണ്ടത്
      console.log('Offline mode active.');
    })
  );
});
