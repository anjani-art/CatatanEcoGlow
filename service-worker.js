const CACHE_NAME = 'ecoglow-pwa-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // Mengaktifkan service worker baru segera
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // Jika tidak ada di cache, fetch dari network
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Periksa apakah kami menerima respons yang valid
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Penting: Kloning respons karena stream hanya dapat dikonsumsi sekali
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // Fallback untuk offline jika network fetch gagal
                        // Anda bisa menambahkan halaman offline khusus di sini
                        // if (event.request.mode === 'navigate') {
                        //   return caches.match('/offline.html');
                        // }
                        console.log('Network request failed and no cache match for:', event.request.url);
                        return new Response('<h1>Offline</h1><p>Anda sedang offline dan halaman ini tidak tersedia di cache.</p>', { headers: { 'Content-Type': 'text/html' } });
                    });
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Mengambil kendali segera
    );
});
