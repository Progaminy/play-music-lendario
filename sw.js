// =============================================
// MUSICA ALENDARIA - Service Worker
// =============================================

const CACHE_NAME = 'musica-alendaria-v1';
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/login.html',
    '/css/style.css',
    '/css/lit.css',
    '/css/dark.css',
    '/css/mobile.css',
    '/css/animacoes.css',
    '/css/player.css',
    '/css/modal.css',
    '/css/componentes.css',
    '/js/dados.js',
    '/js/tema.js',
    '/js/auth.js',
    '/js/player.js',
    '/js/modal.js',
    '/js/favoritos.js',
    '/js/filtros.js',
    '/js/eventos.js',
    '/js/postagem.js',
    '/js/offline.js',
    '/js/suporte.js',
    '/js/app.js'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('⚙️ Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cache aberto');
                return cache.addAll(CACHE_ASSETS);
            })
            .catch(err => {
                console.warn('⚠️ Cache parcial:', err);
            })
    );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Ativado');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('🗑️ Cache antigo removido:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Interceptar requisições (offline first)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Retornar do cache ou buscar da rede
                return response || fetch(event.request).then(fetchResponse => {
                    // Guardar no cache para futuro
                    if (event.request.method === 'GET') {
                        const responseClone = fetchResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return fetchResponse;
                });
            })
            .catch(() => {
                // Offline - retornar página de fallback se for HTML
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/index.html');
                }
            })
    );
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
    if (event.data && event.data.tipo === 'cache-musica') {
        console.log('📲 Cache solicitado para:', event.data.musicaId);
    }
});

console.log('🎵 Musica Alendaria - Service Worker pronto!');