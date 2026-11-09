const menuBtn = document.querySelector('.listnav_menu');
const menu = document.getElementById('menu');
const dropdowns = document.querySelectorAll('.dropdown');
const isMobile = window.matchMedia('(max-width: 768px)');

// Abrir / cerrar el menú completo (hamburguesa)
function setMenu(open) {
  menu.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  if (!open) closeAllDropdowns();
}

function closeAllDropdowns() {
  dropdowns.forEach(d => {
    d.classList.remove('open');
    d.querySelector('.listnav_title').setAttribute('aria-expanded', 'false');
  });
}

menuBtn.addEventListener('click', () => {
  setMenu(!menu.classList.contains('open'));
});

// En móvil: tocar un título despliega/oculta su submenú (acordeón)
dropdowns.forEach(dropdown => {
  const title = dropdown.querySelector('.listnav_title');

  title.addEventListener('click', () => {
    if (!isMobile.matches) return;   // en PC lo maneja el hover por CSS

    const willOpen = !dropdown.classList.contains('open');
    closeAllDropdowns();
    dropdown.classList.toggle('open', willOpen);
    title.setAttribute('aria-expanded', String(willOpen));
  });
});

// Cerrar con Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    setMenu(false);
    menuBtn.focus();
  }
});

// Cerrar al tocar fuera de la barra
document.addEventListener('click', e => {
  if (!e.target.closest('.contain_listnav')) setMenu(false);
});

// Si se agranda la ventana a modo PC, reiniciar el estado móvil
isMobile.addEventListener('change', () => setMenu(false));



// Flip cards
const cells = document.querySelectorAll(".cell");

cells.forEach((cell) => {
    const button = cell.querySelector(".cell-front");
    const back = cell.querySelector(".cell-back");

    cell.addEventListener("click", () => {
        const flipped = cell.classList.toggle("is-flipped");

        button.setAttribute("aria-expanded", flipped);
        back.setAttribute("aria-hidden", !flipped);
    });
});


// Estrellas colgantes
const cielo = document.getElementById("cielo");
const rand = (min, max) => Math.random() * (max - min) + min;

function construirCielo() {
  cielo.innerHTML = "";

  const W = window.innerWidth;
  const H = window.innerHeight;

  // Guirnalda curva de arriba
  const arcoW = Math.max(220, W / 4);
  const arcoH = 36;
  const nArcos = Math.ceil(W / arcoW);

  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", W);
  svg.setAttribute("height", arcoH + 4);

  let d = "M0 0";
  for (let i = 0; i < nArcos; i++) {
    d += ` A ${arcoW / 2} ${arcoH} 0 0 0 ${(i + 1) * arcoW} 0`;
  }

  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "rgba(255,255,255,0.8)");
  path.setAttribute("stroke-width", "1.5");
  path.setAttribute("stroke-dasharray", "2 4");
  path.setAttribute("stroke-linecap", "round");
  svg.appendChild(path);
  cielo.appendChild(svg);

  // Hilos con estrellas (menos en pantallas chicas)
  const cantidad = Math.round(W / (W < 600 ? 70 : 55));

  for (let n = 0; n < cantidad; n++) {
    const x = rand(10, W - 10);

    // altura de la guirnalda en esa posición X (para que el hilo salga de la curva)
    const i = Math.floor(x / arcoW);
    const t = (x - i * arcoW - arcoW / 2) / (arcoW / 2);
    const y0 = arcoH * Math.sqrt(Math.max(0, 1 - t * t));

    const largo = rand(50, Math.min(H * 0.45, 320));
    const tam = rand(10, 24);

    const hilo = document.createElement("div");
    hilo.className = "hilo";
    hilo.style.left = x + "px";
    hilo.style.top = y0 + "px";
    hilo.style.height = largo + "px";
    hilo.style.setProperty("--dur-balanceo", rand(3, 6).toFixed(2) + "s");

    const estrella = document.createElement("div");
    estrella.className = "estrella";
    estrella.style.setProperty("--tam", tam.toFixed(1) + "px");
    estrella.style.setProperty("--dur-titilar", rand(1.5, 4).toFixed(2) + "s");
    estrella.style.setProperty("--retraso", "-" + rand(0, 4).toFixed(2) + "s");
    estrella.appendChild(document.createElement("i"));

    hilo.appendChild(estrella);
    cielo.appendChild(hilo);
  }
}

construirCielo();

let temporizador;
window.addEventListener("resize", () => {
  clearTimeout(temporizador);
  temporizador = setTimeout(construirCielo, 200);
});

// Estrellas fugases 
function lanzarFugaz() {
  const W = window.innerWidth;
  const H = window.innerHeight;

  const fugaz = document.createElement("div");
  fugaz.className = "fugaz";
  fugaz.style.left = rand(-W * 0.1, W * 0.7) + "px";   // sale de la parte alta/izquierda
  fugaz.style.top  = rand(0, H * 0.4) + "px";
  fugaz.style.setProperty("--ang", rand(20, 40).toFixed(1) + "deg");

  const mov = document.createElement("div");
  mov.className = "fugaz-mov";
  mov.style.setProperty("--dur",  rand(1.1, 2).toFixed(2) + "s");
  mov.style.setProperty("--dist", rand(W * 0.4, W * 0.8).toFixed(0) + "px");
  mov.style.setProperty("--cola", rand(80, 180).toFixed(0) + "px");
  mov.style.setProperty("--tam",  rand(16, 26).toFixed(0) + "px");

  const cola = document.createElement("span");
  cola.className = "fugaz-cola";

  const cabeza = document.createElement("span");
  cabeza.className = "fugaz-cabeza";
  cabeza.textContent = "✧";

  mov.append(cola, cabeza);
  fugaz.appendChild(mov);
  cielo.appendChild(fugaz);

  // se elimina solo al terminar para no acumular elementos
  mov.addEventListener("animationend", () => fugaz.remove());
}

// Una cada 2 a 6 segundos, a intervalos irregulares
function programarFugaz() {
  setTimeout(() => {
    if (!document.hidden) lanzarFugaz();
    programarFugaz();
  }, rand(500, 1000));
}

programarFugaz();



// ============================================================
// Animaciones al hacer scroll  (pegar al final de script.js)
// ============================================================
// 1) La lista AUTO de abajo pone las clases solita: no hace falta tocar el HTML.
// 2) Cada elemento se anima cada vez que vuelve a entrar en pantalla.
//    Si alguno solo debe animarse UNA vez, agregale la clase "aparece--una-vez".
(() => {

  // ---------- QUE ANIMAR ----------
  // sel:       selector CSS de los elementos
  // clases:    clases de animacion que se les agregan
  // escalonar: (opcional) segundos de retraso entre columnas -> efecto de "ola" en cuadriculas
  const AUTO = [
    // Titulos y separadores: se escriben de izquierda a derecha
    { sel: "h4",                            clases: "aparece aparece--escribe aparece--ajustado" },
    { sel: ".bienv",                        clases: "aparece aparece--escribe" },
    { sel: ".intersecciones",               clases: "aparece aparece--escribe aparece--ajustado" },

    // Tarjetas y cajas grandes: suben
    { sel: ".tarjeta",                      clases: "aparece" },
    { sel: ".tabla_kanjis_tittle",          clases: "aparece" },
    { sel: ".tabla_kanji_grid > .cell_kanji", clases: "aparece", escalonar: 0.08 },
    { sel: ".contain_info_tarj > .info_tarj", clases: "aparece", escalonar: 0.1 },

    // Celdas pequenas de hiragana / katakana: "pop" en ola
    { sel: ".tabla_grid > .cell",           clases: "aparece aparece--pop", escalonar: 0.06 },
  ];

  // ---------- Poner las clases ----------
  AUTO.forEach(({ sel, clases }) => {
    document.querySelectorAll(sel).forEach((el) => el.classList.add(...clases.split(/\s+/)));
  });

  // ---------- Retraso por columna (ola) ----------
  // Numera cada elemento dentro de su fila y le da un retraso segun su columna.
  // Se calcula leyendo la posicion real, asi funciona con cualquier cantidad de
  // columnas y se vuelve a calcular si cambia el ancho de la pantalla.
  function escalonar() {
    AUTO.filter((a) => a.escalonar).forEach(({ sel, escalonar: paso }) => {
      let filaTop = null;
      let columna = 0;
      document.querySelectorAll(sel).forEach((el) => {
        const top = el.offsetTop;
        if (filaTop === null || Math.abs(top - filaTop) > 4) { filaTop = top; columna = 0; }
        el.style.setProperty("--retraso", (columna * paso).toFixed(2) + "s");
        columna++;
      });
    });
  }

  escalonar();
  let temporizador;
  window.addEventListener("resize", () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(escalonar, 200);
  });

  // ---------- Aparecer / reiniciar al entrar y salir de pantalla ----------
  const items = document.querySelectorAll(".aparece");
  if (!items.length) return;

  // Navegadores muy viejos: mostrar todo sin animar
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("visible"));
    return;
  }

  const MINIMO_VISIBLE = 0.15;   // cuanto del elemento debe verse para que aparezca (15%)

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        const el = entrada.target;
        const unaVez = el.classList.contains("aparece--una-vez");

        if (entrada.isIntersecting && entrada.intersectionRatio >= MINIMO_VISIBLE) {
          el.classList.add("visible");
          if (unaVez) observador.unobserve(el);
        } else if (!entrada.isIntersecting && !unaVez) {
          // Salio por completo de la pantalla: se reinicia para animar de nuevo
          el.classList.remove("visible");
        }
      });
    },
    { threshold: [0, MINIMO_VISIBLE] }
  );

  items.forEach((el) => observador.observe(el));
})();




// ============================================================
// Rastro de brillitos que deja el cursor 
// ============================================================
(() => {

  // ---------- Ajustes  ----------
  const SIMBOLOS   = ["✧", "✦", "⋆"];      
  const COLORES    = ["#ffffff", "#ffffff", "#ff8fc7"]; 
  const DISTANCIA  = 16;      
  const MAXIMO     = 30;      
  const TAM        = [10, 20];     // tamano min y max (px)
  const DURACION   = [0.7, 1.3];   // segundos que tarda en apagarse
  const CAIDA      = [14, 38];     // px que cae mientras se apaga

  // ---------- Solo con mouse, y respetando "reducir movimiento" ----------
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const entre = (min, max) => Math.random() * (max - min) + min;
  const alAzar = (lista) => lista[Math.floor(Math.random() * lista.length)];

  let ultimoX = null;
  let ultimoY = null;
  let vivos = 0;

  function soltarBrillo(x, y) {
    if (vivos >= MAXIMO) return;

    const b = document.createElement("span");
    b.className = "brillo";
    b.textContent = alAzar(SIMBOLOS);
    b.setAttribute("aria-hidden", "true");

    // Variacion
    b.style.left = x + entre(-4, 4) + "px";
    b.style.top  = y + entre(-4, 4) + "px";
    b.style.setProperty("--tam",  entre(...TAM).toFixed(1) + "px");
    b.style.setProperty("--dur",  entre(...DURACION).toFixed(2) + "s");
    b.style.setProperty("--dx",   entre(-14, 14).toFixed(1) + "px");
    b.style.setProperty("--dy",   entre(...CAIDA).toFixed(1) + "px");
    b.style.setProperty("--giro", entre(-90, 90).toFixed(0) + "deg");
    b.style.setProperty("--color-brillo", alAzar(COLORES));

    vivos++;
    b.addEventListener("animationend", () => {
      b.remove();
      vivos--;
    });
    document.body.appendChild(b);
  }

  document.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;

      if (ultimoX !== null) {
        const dx = e.clientX - ultimoX;
        const dy = e.clientY - ultimoY;
        if (dx * dx + dy * dy < DISTANCIA * DISTANCIA) return;   
      }
      ultimoX = e.clientX;
      ultimoY = e.clientY;
      soltarBrillo(e.clientX, e.clientY);
    },
    { passive: true }
  );
})();