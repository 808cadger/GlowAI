import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
  }),
);

registerRoute(
  ({ url }) => /\.(?:png|jpg|jpeg|webp|wasm|tflite|binarypb|data)$/i.test(url.pathname),
  new NetworkFirst({
    cacheName: 'models',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
);

registerRoute(
  ({ url }) => /\.(?:css|js)$/i.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: 'static-assets',
  }),
);

registerRoute(
  ({ url }) => url.origin === 'https://cdn.jsdelivr.net' || url.hostname.endsWith('github.io'),
  new CacheFirst({
    cacheName: 'model-cdn',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 120,
        maxAgeSeconds: 14 * 24 * 60 * 60,
      }),
    ],
  }),
);
