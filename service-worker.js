// --- service-worker.js ---

const CACHE_NAME = 'ecoglow-pwa-cache-v1'; // Nama cache, ganti 'v1' jika ada perubahan mayor
const urlsToCache = [
    '/', // Cache the root URL (index.html)
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/icon-192x192.png', // Pastikan nama dan lokasi ikon sesuai
    '/icon-512x512.png', // Pastikan nama dan lokasi ikon sesuai
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css' // Cache Font Awesome CSS
    // Tambahkan URL aset lain yang ingin Anda cache di sini
];

// Event: install - Terjadi saat Service Worker pertama kali diinstal
self.addEventListener('install', (event) => {
    // Menunggu hingga semua aset di-cache
    event.waitUntil(
        caches.open(CACHE_NAME) // Buka cache dengan nama yang ditentukan
            .then(cache => {
                console.log('Service Worker: Cache dibuka, menambahkan URL ke cache.');
                return cache.addAll(urlsToCache); // Tambahkan semua URL yang ingin di-cache
            })
            .then(() => self.skipWaiting()) // Memaksa Service Worker baru untuk langsung aktif
            .catch(error => {
                console.error('Service Worker: Gagal meng-cache semua aset:', error);
            })
    );
});

// Event: activate - Terjadi saat Service Worker diaktifkan
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME]; // Daftar cache yang valid

    // Menghapus cache lama yang tidak lagi dibutuhkan
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Menghapus cache lama:', cacheName);
                        return caches.delete(cacheName); // Hapus cache yang tidak ada di whitelist
                    }
                })
            );
        })
        .then(() => self.clients.claim()) // Mengambil kontrol atas semua halaman yang terbuka
    );
});

// Event: fetch - Terjadi setiap kali browser meminta sumber daya (resource)
self.addEventListener('fetch', (event) => {
    // Coba ambil dari cache dulu, jika tidak ada di cache, baru ambil dari jaringan.
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Jika ada di cache, kembalikan respons dari cache
                if (response) {
                    console.log('Service Worker: Mengambil dari cache:', event.request.url);
                    return response;
                }
                // Jika tidak ada di cache, ambil dari jaringan
                console.log('Service Worker: Mengambil dari jaringan:', event.request.url);
                return fetch(event.request)
                    .then(networkResponse => {
                        // Klon respons karena respons stream hanya bisa dibaca sekali
                        // Kita ingin menggunakannya untuk cache dan juga mengembalikannya
                        const responseToCache = networkResponse.clone();

                        // Cache respons jaringan untuk penggunaan di masa mendatang
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        console.warn('Service Worker: Gagal mengambil dari jaringan atau cache:', event.request.url);
                        return new Response('Anda sedang offline dan halaman ini tidak di-cache.', {
                            status: 503,
                            statusText: 'Offline'
                        });
                    });
            })
    );
});
