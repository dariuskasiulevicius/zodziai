const SHELL = 'zodziai-shell-v1';
const DATA  = 'zodziai-data-v1';
const FILES = ['./', 'index.html', 'styles.css', 'app.js', 'manifest.webmanifest', 'icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== SHELL && k !== DATA).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Žodžių failai: pirmiausia tinklas (2 s), tada atsarginė kopija.
// Data files: network-first with a 2s timeout, so a phone never serves last week's words.
function networkFirst(req) {
  return new Promise(resolve => {
    let settled = false;
    const fallback = () => caches.match(req).then(hit => resolve(hit || fetch(req)));
    const timer = setTimeout(() => { if (!settled) { settled = true; fallback(); } }, 2000);

    fetch(req).then(res => {
      clearTimeout(timer);
      if (settled) { caches.open(DATA).then(c => c.put(req, res.clone())); return; }
      settled = true;
      caches.open(DATA).then(c => c.put(req, res.clone()));
      resolve(res);
    }).catch(() => {
      clearTimeout(timer);
      if (!settled) { settled = true; fallback(); }
    });
  });
}

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  if (url.pathname.includes('/data/')) e.respondWith(networkFirst(e.request));
  else e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
