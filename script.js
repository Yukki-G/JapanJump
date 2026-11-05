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