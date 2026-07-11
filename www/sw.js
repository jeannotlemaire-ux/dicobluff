/* Dicobluff Service Worker
   Stratégie :
   - HTML principal : stale-while-revalidate (le user voit la version cache instantanément,
     la nouvelle version est récupérée en tâche de fond et utilisée au prochain chargement)
   - Assets statiques (icônes, manifest, fonts CDN) : cache-first avec fallback réseau
   - Firebase et toute requête externe non-asset : bypass (toujours réseau)
   - Versioning : incrémente CACHE_VERSION pour forcer l'invalidation de tous les caches
*/

const CACHE_VERSION = 'dicobluff-v28';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Précache minimal : le shell HTML + manifest + icônes critiques + page offline.
const PRECACHE_URLS = [
  './',
  './index.html',
  './game.html',
  './offline.html',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/favicon-32.png'
];

// Domaines à toujours laisser passer en réseau direct (pas de cache).
const NETWORK_ONLY_HOSTS = [
  'firebaseio.com',
  'firebasedatabase.app',
  'firebaseapp.com',
  'googleapis.com',
  'gstatic.com'
];

// ─── INSTALL ────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // addAll échoue tout si UNE URL échoue — on tolère les échecs unitaires
      return Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] precache failed for', url, err.message);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE ───────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH ──────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Bypass Firebase et toute requête vers domaines temps réel
  if (NETWORK_ONLY_HOSTS.some((h) => url.hostname.includes(h))) {
    return; // laisse le navigateur faire sa requête normale
  }

  // Bypass pour Capacitor (localhost) — les assets sont servis nativement par le WebViewAssetLoader.
  // Sur certaines versions Android, le SW ne peut pas fetcher https://localhost/ correctement.
  if (url.hostname === 'localhost') return;

  // Bypass des requêtes non-http (ex: chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // HTML principal → stale-while-revalidate
  if (req.mode === 'navigate' || (req.destination === 'document') || url.pathname.endsWith('.html')) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Assets statiques (icônes, manifest, images, css, js, fonts) → cache-first
  if (
    ['image', 'style', 'script', 'font', 'manifest'].includes(req.destination) ||
    url.pathname.includes('/icons/') ||
    url.pathname.endsWith('.webmanifest')
  ) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Par défaut : réseau avec fallback cache
  event.respondWith(networkFirst(req));
});

// ─── STRATÉGIES ─────────────────────────────────────────────────
async function cacheFirst(req) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.status === 200) cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

async function networkFirst(req) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.status === 200) cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(req);
    if (cached) return cached;
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(req);
  const networkPromise = fetch(req)
    .then((fresh) => {
      if (fresh && fresh.status === 200) cache.put(req, fresh.clone());
      return fresh;
    })
    .catch(() => null);
  // Si on a le cache, on le renvoie tout de suite et la maj se fait en arrière-plan
  if (cached) {
    networkPromise; // revalidation en tâche de fond
    return cached;
  }
  const fresh = await networkPromise;
  if (fresh) return fresh;
  // Aucune version en cache et réseau indisponible → page offline
  const offlinePage = await cache.match('./offline.html');
  return offlinePage || new Response('', { status: 504, statusText: 'Offline' });
}

// ─── MESSAGE (pour forcer une update depuis le client) ──────────
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// ─── PERIODIC BACKGROUND SYNC — mot du jour ─────────────────────
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'mot-du-jour') {
    event.waitUntil(showWordOfDayNotification());
  }
});

// ─── WEB PUSH (réservé à un futur backend) ───────────────────────
self.addEventListener('push', (event) => {
  const d = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(d.title || 'Dicobluff', {
      body:    d.body  || 'Le mot du jour t\'attend.',
      icon:    './assets/icons/icon-192.png',
      badge:   './assets/icons/favicon-32.png',
      tag:     'mot-du-jour',
      data:    { url: d.url || './?wod=1' }
    })
  );
});

// ─── NOTIFICATION CLICK ──────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wcs) => {
      const w = wcs.find((c) => c.url.includes('dicobluff') || c.url.includes(self.registration.scope));
      if (w) { w.focus(); return w.navigate(url); }
      return clients.openWindow(url);
    })
  );
});

// ─── HELPERS SW ─────────────────────────────────────────────────
async function showWordOfDayNotification() {
  const word  = await getWordFromIDB();
  const title = word ? 'Mot du jour : ' + word.w.toUpperCase() : 'Dicobluff — Mot du jour';
  const body  = word ? (word.h || 'Connais-tu sa vraie définition ?') : 'Découvre le mot du jour !';
  await self.registration.showNotification(title, {
    body,
    icon:     './assets/icons/icon-192.png',
    badge:    './assets/icons/favicon-32.png',
    tag:      'mot-du-jour',
    renotify: false,
    data:     { url: './?wod=1' }
  });
}

function getWordFromIDB() {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('dicobluff', 1);
      req.onsuccess = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('sw-data')) return resolve(null);
        const tx = db.transaction('sw-data', 'readonly');
        const get = tx.objectStore('sw-data').get('wod');
        get.onsuccess = () => resolve(get.result || null);
        get.onerror   = () => resolve(null);
      };
      req.onerror = () => resolve(null);
    } catch (e) { resolve(null); }
  });
}
