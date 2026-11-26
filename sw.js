/* Paris app: keeps the game and its libraries on the phone so it opens fast; always fetches the newest game when online. */
var CACHE = 'paris-app-v1';
var SHELL = ['paris.html', 'paris.webmanifest', 'icons/paris-192.png', 'icons/paris-512.png'];
self.addEventListener('install', function(e){ e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener('activate', function(e){ e.waitUntil(caches.keys().then(function(k){ return Promise.all(k.filter(function(n){ return n !== CACHE; }).map(function(n){ return caches.delete(n); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch', function(e){
  var r = e.request, u = new URL(r.url);
  if(r.method !== 'GET') return;
  if(/firebaseio|googleapis\.com\/identitytoolkit|securetoken|youtube|ytimg|gstatic\.com\/firebasejs/.test(u.host + u.pathname) && !/cdn\.jsdelivr/.test(u.host)) return;
  var isPage = r.mode === 'navigate' || /paris\.html$/.test(u.pathname);
  if(isPage){ e.respondWith(fetch(r).then(function(res){ var cp = res.clone(); caches.open(CACHE).then(function(c){ c.put('paris.html', cp); }); return res; }).catch(function(){ return caches.match('paris.html'); })); return; }
  if(/cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(u.host) || u.origin === location.origin){
    e.respondWith(caches.match(r).then(function(hit){ var net = fetch(r).then(function(res){ if(res && (res.ok || res.type === 'opaque')){ var cp = res.clone(); caches.open(CACHE).then(function(c){ c.put(r, cp); }); } return res; }).catch(function(){ return hit; }); return hit || net; }));
  }
});
