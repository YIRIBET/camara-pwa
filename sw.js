// Service Worker para PWA
const CACHE_NAME = 'camara-pwa-v1'; // Nombre/versión del caché
const urlsToCache = [ // Lista de archivos a guardar en caché
    './',
    './index.html',
    './app.js',
    './manifest.json',
    './main.js',
    './sw.js',
    './image/icons/camara.png',
];

/**
 * Evento Install: Se ejecuta cuando el Service Worker se instala por primera vez
 * Aquí precargamos los recursos en el caché
 */
self.addEventListener('install', function(event) {
    console.log('[Service Worker] Instalando...');
    
    // Usar event.waitUntil para asegurar que la instalación no termine 
    // hasta que el caché esté listo
    event.waitUntil(
        // Abrir el caché con el nombre definido
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('[Service Worker] Cache abierto');
                // Agregar todos los archivos de urlsToCache al almacenamiento
                return cache.addAll(urlsToCache);
            })
            .catch(function(error) {
                console.error('[Service Worker] Error al abrir cache:', error);
            })
    );
});

/**
 * Evento Fetch: Intercepta todas las peticiones de red
 * Implementa estrategia "Cache First, then Network"
 */
self.addEventListener('fetch', function(event) {
    // Usar event.respondWith para controlar la respuesta
    event.respondWith(
        // 1. Intentar encontrar la solicitud en el caché
        caches.match(event.request)
            .then(function(response) {
                // 2. Si se encuentra una respuesta en caché
                if (response) {
                    console.log('[Service Worker] Sirviendo desde caché:', event.request.url);
                    return response; // Devolver la versión en caché
                }
                
                // 3. Si no está en caché, ir a la red
                console.log('[Service Worker] Buscando en red:', event.request.url);
                return fetch(event.request);
            })
            .catch(function(error) {
                console.error('[Service Worker] Error en fetch:', error);
            })
    );
});

/**
 * Evento Activate: Se ejecuta cuando el Service Worker toma control
 * Aquí eliminamos cachés antiguos de versiones anteriores
 */
self.addEventListener('activate', function(event) {
    console.log('[Service Worker] Activando...');
    
    event.waitUntil(
        // 1. Obtener todos los nombres de caché existentes
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                // 2. Mapear y filtrar los cachés que no coinciden con el nombre actual
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Eliminando caché antiguo:', cacheName);
                        // 3. Eliminar los cachés obsoletos
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Tomar control inmediatamente de todas las páginas
    return self.clients.claim();
});