const CACHE_NAME = "caixote-motorizadas-v3";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./ícone-192.png",
    "./ícone-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

/*
   IMPORTANTE:
   O Three.js vem do jsDelivr.
   Não vamos tentar colocá-lo no cache do jogo.
*/

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    const url = new URL(event.request.url);

    /*
      Deixa recursos externos, como Three.js,
      serem carregados normalmente pela internet.
    */

    if (url.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cached => {

                if (cached) {
                    return cached;
                }

                return fetch(event.request)
                    .then(response => {

                        if (
                            !response ||
                            response.status !== 200
                        ) {
                            return response;
                        }

                        const copy =
                            response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(
                                    event.request,
                                    copy
                                );
                            });

                        return response;
                    })
                    .catch(() => {
                        return caches.match(
                            "./index.html"
                        );
                    });
            })
    );
});