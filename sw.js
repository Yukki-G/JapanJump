// ============================================================
// Service worker: guarda la web en el celular para usarla sin internet
// ------------------------------------------------------------
// - La primera vez (con internet) descarga todos los ARCHIVOS de abajo.
// - Despues siempre responde desde lo guardado (rapido y sin internet)
//   y, si hay internet, revisa en segundo plano si cambio algo.
//   Los cambios se ven la SIGUIENTE vez que abras la app.
//
// Si agregas una pagina, imagen o script nuevo: agregalo a ARCHIVOS
// y sube el numero de VERSION (v1 -> v2) para que se descargue todo de nuevo.
// ============================================================

const VERSION = "nihon-v1";

const ARCHIVOS = [
  "./",
  "index.html",
  "hiragana_tabla.html",
  "katakana_tabla.html",
  "kanji_tabla.html",
  "practica_hiragana.html",
  "practica_katakana.html",
  "practica_kanji.html",
  "style.css",
  "script.js",
  "practica.js",
  "kanji_datos.js",
  "practica_kanji.js",
  "manifest.webmanifest",
  "fonts/saira.woff2",
  "fonts/saira-italic.woff2",
  "icons/favicon.png",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "images/ban4.jpg",
  "images/ban5.jpg",
  "images/ban6.jpg",
  "images/Ban_Disc.png",
  "images/halo.png",
  "images/marco.png",
  "images/mi_pfp.jpg",
  "sprits/Rie_neutral.png",
  "sprits/Rie_happy.jpg",
  "sprits/Rie_angry.jpg",
];

// Instalar: descargar y guardar todo
self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(ARCHIVOS.map((a) => new Request(a, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

// Activar: borrar las versiones viejas
self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((nombres) => Promise.all(nombres.filter((n) => n !== VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Cada vez que la pagina pide un archivo
self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  const url = new URL(pedido.url);

  // Solo archivos propios (el widget de Discord, etc. va directo a internet)
  if (pedido.method !== "GET" || url.origin !== self.location.origin) return;

  evento.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const guardado = await cache.match(pedido, { ignoreSearch: true });

      // Pedirlo a internet y actualizar lo guardado (si hay conexion)
      const deInternet = fetch(pedido)
        .then((respuesta) => {
          if (respuesta.ok) cache.put(pedido, respuesta.clone());
          return respuesta;
        })
        .catch(() => null);

      if (guardado) {
        evento.waitUntil(deInternet);
        return guardado;
      }

      const respuesta = await deInternet;
      if (respuesta) return respuesta;

      // Sin internet y sin copia: si era una pagina, mostrar el inicio
      if (pedido.mode === "navigate") return cache.match("index.html");
      return Response.error();
    })
  );
});
