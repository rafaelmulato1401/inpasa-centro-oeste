// Service worker mínimo: habilita instalação; rede sempre primeiro (login/dados nunca ficam em cache velho).
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{});
