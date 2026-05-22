// Minimal service worker
// This file exists to prevent 404 errors when browsers attempt to load a service worker

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})
