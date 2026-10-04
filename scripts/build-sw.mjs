import fs from "node:fs";
import path from "node:path";
const files = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name !== "sw.js")
      files.push("/" + p.replaceAll("\\", "/").replace(/^dist\//, ""));
  }
}
walk("dist");
const cache = "lumo-" + Date.now();
fs.writeFileSync(
  "dist/sw.js",
  `const CACHE=${JSON.stringify(cache)},FILES=${JSON.stringify(files)};self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('lumo-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method==='GET'&&new URL(e.request.url).origin===location.origin)e.respondWith(caches.match(e.request,{ignoreVary:true}).then(r=>r||fetch(e.request).catch(()=>e.request.mode==='navigate'?caches.match('/index.html'):Response.error())))});`,
);
