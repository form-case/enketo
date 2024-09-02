/* eslint-disable no-restricted-globals */
self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response; // Si el archivo está en la cache, servirlo.
        }
        return fetch(event.request); // De lo contrario, hacer una solicitud a la red.
      })
    );
  });
  /* eslint-enable no-restricted-globals */
  