const C='scan-v1';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const same=new URL(r.url).origin===self.location.origin;
  const keep=res=>{if(res&&(res.ok||res.type==='opaque')){const c=res.clone();caches.open(C).then(x=>x.put(r,c))}return res};
  if(same){
    // نفس الموقع: الأحدث أولاً، ولو مفيش نت يرجع من الكاش
    e.respondWith(fetch(r).then(keep).catch(()=>caches.match(r).then(h=>h||caches.match('./index.html'))));
  }else{
    // ملفات القارئ من الإنترنت: تتخزن مرة واحدة وتشتغل أوفلاين بعد كده
    e.respondWith(caches.match(r).then(h=>h||fetch(r).then(keep)));
  }
});
