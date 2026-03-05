const CACHE_NAME = 'bcd-tracker-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js'
];

// Install: Cache all static files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Fetch: Serve from cache if offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return cached file, or try to fetch from network
            return response || fetch(event.request).catch(() => {
                // If both fail (like a dead API request while offline), 
                // you could return a custom offline message here
            });
        })
    );
});
