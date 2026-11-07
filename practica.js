// ============================================================
// Practica de hiragana / katakana
// Se carga DESPUES de script.js (va envuelto en una funcion para
// no chocar con las variables de script.js)
// ============================================================
(() => {
  const raiz = document.querySelector(".practica");
  if (!raiz) return;

  // ---------- Configuracion (lo que seguramente querras tocar) ----------

  // Rutas de las imagenes de Rie
  const SPRITES = {
    neutral: "sprits/Rie_neutral.png",
    feliz:   "sprits/Rie_happy.jpg",
    enojada: "sprits/Rie_angry.jpg",
  };

  // Cuantos botones aparecen en el modo Romaji → Kana
  const OPCIONES_POR_PREGUNTA = 4;

  // ---------- Datos ----------
  // Formato: "kana romaji,romaji-alternativo|kana romaji|..."
  // El primer romaji es el "principal"; los demas tambien se aceptan.

  const GOJUON = `あ a|い i|う u|え e|お o|か ka|き ki|く ku|け ke|こ ko|さ sa|し shi,si|す su|せ se|そ so|た ta|ち chi,ti|つ tsu,tu|て te|と to|な na|に ni|ぬ nu|ね ne|の no|は ha|ひ hi|ふ fu,hu|へ he|ほ ho|ま ma|み mi|む mu|め me|も mo|ら ra|り ri|る ru|れ re|ろ ro|や ya|ゆ yu|よ yo|わ wa|を wo,o|ん n,nn`;

  const DAKUTEN = `が ga|ぎ gi|ぐ gu|げ ge|ご go|ざ za|じ ji,zi|ず zu|ぜ ze|ぞ zo|だ da|ぢ ji,di,zi|づ zu,du|で de|ど do|ば ba|び bi|ぶ bu|べ be|ぼ bo|ぱ pa|ぴ pi|ぷ pu|ぺ pe|ぽ po`;

  // Yoon: base + prefijos romaji (el primero es el principal) + ゃ/ゅ/ょ
  const YOON_BASES = [
    ["き", ["ky"]],
    ["し", ["sh", "sy"]],
    ["ち", ["ch", "ty"]],
    ["に", ["ny"]],
    ["ひ", ["hy"]],
    ["み", ["my"]],
    ["り", ["ry"]],
    ["ぎ", ["gy"]],
    ["じ", ["j", "jy", "zy"]],
    ["び", ["by"]],
    ["ぴ", ["py"]],
  ];
  const YOON_VOCALES = [["ゃ", "a"], ["ゅ", "u"], ["ょ", "o"]];

  // ---------- Armado de los grupos ----------

  // Hiragana -> Katakana (mueve el codigo del caracter 0x60 posiciones)
  const ALFABETO = raiz.dataset.alfabeto === "katakana" ? "katakana" : "hiragana";
  const NOMBRE = ALFABETO === "katakana" ? "Katakana" : "Hiragana";

  const aKatakana = (texto) =>
    texto.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));
  const kanaDelAlfabeto = (texto) => (ALFABETO === "katakana" ? aKatakana(texto) : texto);

  function leerLista(texto) {
    return texto.split("|").map((par) => {
      const [kana, romajis] = par.split(" ");
      return { k: kanaDelAlfabeto(kana), r: romajis.split(",") };
    });
  }

  function armarYoon() {
    const lista = [];
    YOON_BASES.forEach(([base, prefijos]) => {
      YOON_VOCALES.forEach(([chica, vocal]) => {
        lista.push({
          k: kanaDelAlfabeto(base + chica),
          r: prefijos.map((p) => p + vocal),
        });
      });
    });
    return lista;
  }

  const GRUPOS = {
    gojuon:  leerLista(GOJUON),
    dakuten: leerLista(DAKUTEN),
    yoon:    armarYoon(),
  };

  // ---------- Elementos del DOM ----------

  const el = {
    racha:      document.getElementById("p_racha"),
    buenas:     document.getElementById("p_buenas"),
    malas:      document.getElementById("p_malas"),
    personaje:  document.getElementById("p_personaje"),
    tarjeta:    document.getElementById("p_tarjeta"),
    etiqueta:   document.getElementById("p_etiqueta"),
    simbolo:    document.getElementById("p_simbolo"),
    feedback:   document.getElementById("p_feedback"),
    form:       document.getElementById("p_form"),
    input:      document.getElementById("p_input"),
    comprobar:  document.getElementById("p_comprobar"),
    opciones:   document.getElementById("p_opciones"),
    noLoSe:     document.getElementById("p_nolose"),
    siguiente:  document.getElementById("p_siguiente"),
    modo:       document.getElementById("p_modo"),
    checks:     raiz.querySelectorAll(".practica_grupos input[type='checkbox']"),
  };

  // ---------- Estado ----------

  const estado = {
    modo: "kana-romaji",     // "kana-romaji" | "romaji-kana"
    pool: [],                // caracteres que se estan practicando
    actual: null,            // pregunta actual
    respondida: false,
    racha: 0,
    buenas: 0,
    malas: 0,
  };

  // Precargar sprites para que no parpadee al cambiar
  Object.values(SPRITES).forEach((ruta) => {
    const img = new Image();
    img.src = ruta;
  });

  // ---------- Utilidades ----------

  const aleatorio = (lista) => lista[Math.floor(Math.random() * lista.length)];

  function mezclar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  // "  SHI " -> "shi"
  const normalizar = (texto) => texto.toLowerCase().replace(/[\s'-]/g, "");

  function ponerSprite(nombre) {
    el.personaje.src = SPRITES[nombre];
  }

  function actualizarMarcador() {
    el.racha.textContent = estado.racha;
    el.buenas.textContent = estado.buenas;
    el.malas.textContent = estado.malas;
  }

  function actualizarPool() {
    estado.pool = [];
    el.checks.forEach((check) => {
      if (check.checked) estado.pool.push(...GRUPOS[check.value]);
    });
  }

  function actualizarTextoModo() {
    el.modo.textContent =
      estado.modo === "kana-romaji" ? `${NOMBRE} → Romaji` : `Romaji → ${NOMBRE}`;
  }

  // Lo que se muestra como respuesta correcta, ej: "shi / si"
  function respuestaCorrectaTexto() {
    return estado.modo === "kana-romaji"
      ? estado.actual.r.join(" / ")
      : estado.actual.k;
  }

  // ---------- Preguntas ----------

  function nuevaPregunta(enfocar = true) {
    // Evitar repetir el mismo caracter dos veces seguidas
    let candidato;
    do {
      candidato = aleatorio(estado.pool);
    } while (estado.pool.length > 1 && candidato === estado.actual);

    estado.actual = candidato;
    estado.respondida = false;

    // Reiniciar la tarjeta
    el.tarjeta.classList.remove("is-ok", "is-mal");
    el.feedback.textContent = "";
    ponerSprite("neutral");

    el.siguiente.hidden = true;
    el.noLoSe.hidden = false;

    if (estado.modo === "kana-romaji") {
      el.etiqueta.textContent = "¿Cómo se lee?";
      el.simbolo.textContent = candidato.k;
      el.simbolo.lang = "ja";

      el.opciones.hidden = true;
      el.form.hidden = false;
      el.input.value = "";
      el.input.readOnly = false;
      el.comprobar.hidden = false;
      if (enfocar) el.input.focus();
    } else {
      el.etiqueta.textContent = `¿Qué ${NOMBRE.toLowerCase()} es?`;
      el.simbolo.textContent = candidato.r[0];
      el.simbolo.lang = "en";

      el.form.hidden = true;
      el.opciones.hidden = false;
      armarOpciones();
    }
  }

  // Botones con kana para el modo romaji -> kana
  function armarOpciones() {
    const correcta = estado.actual;

    // Distractores: que no se lean igual que la correcta (ej. じ y ぢ)
    const distractores = mezclar(
      estado.pool.filter(
        (item) => item !== correcta && !item.r.some((r) => correcta.r.includes(r))
      )
    ).slice(0, OPCIONES_POR_PREGUNTA - 1);

    const lista = mezclar([correcta, ...distractores]);

    el.opciones.innerHTML = "";
    lista.forEach((item) => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "practica_opcion";
      boton.textContent = item.k;
      boton.lang = "ja";
      boton.dataset.correcta = item === correcta ? "1" : "0";
      boton.addEventListener("click", () => elegirOpcion(boton));
      el.opciones.appendChild(boton);
    });
  }

  // ---------- Resultados ----------

  function resolver(acierto, motivo) {
    estado.respondida = true;

    if (acierto) {
      estado.racha++;
      estado.buenas++;
      ponerSprite("feliz");
      el.tarjeta.classList.add("is-ok");
      el.feedback.textContent = "¡Correcto! ✧";
    } else {
      estado.racha = 0;
      estado.malas++;
      ponerSprite("enojada");
      el.tarjeta.classList.add("is-mal");
      el.feedback.textContent =
        (motivo === "no-se" ? "Era: " : "Incorrecto. Era: ") + respuestaCorrectaTexto();
    }

    actualizarMarcador();

    // Bloquear la entrada y mostrar "Siguiente"
    el.input.readOnly = true;
    el.comprobar.hidden = true;
    el.noLoSe.hidden = true;
    el.siguiente.hidden = false;
    el.siguiente.focus();   // Enter / espacio pasan a la siguiente
  }

  function enviarTexto() {
    if (estado.respondida) return nuevaPregunta();

    const texto = normalizar(el.input.value);
    if (!texto) return;                       // vacio: no hace nada

    resolver(estado.actual.r.includes(texto));
  }

  function elegirOpcion(boton) {
    if (estado.respondida) return;

    const acierto = boton.dataset.correcta === "1";
    resolver(acierto);

    // Marcar visualmente las opciones
    el.opciones.querySelectorAll(".practica_opcion").forEach((b) => {
      b.disabled = true;
      if (b.dataset.correcta === "1") b.classList.add("is-correcta");
    });
    if (!acierto) boton.classList.add("is-incorrecta");
  }

  function noLoSe() {
    if (estado.respondida) return;
    resolver(false, "no-se");

    // En modo opciones, resaltar la correcta
    el.opciones.querySelectorAll(".practica_opcion").forEach((b) => {
      b.disabled = true;
      if (b.dataset.correcta === "1") b.classList.add("is-correcta");
    });
  }

  // ---------- Eventos ----------

  el.form.addEventListener("submit", (e) => {
    e.preventDefault();
    enviarTexto();
  });

  el.noLoSe.addEventListener("click", noLoSe);
  el.siguiente.addEventListener("click", () => nuevaPregunta());

  el.modo.addEventListener("click", () => {
    estado.modo = estado.modo === "kana-romaji" ? "romaji-kana" : "kana-romaji";
    actualizarTextoModo();
    nuevaPregunta();
  });

  el.checks.forEach((check) => {
    check.addEventListener("change", () => {
      // Siempre debe quedar al menos un grupo activo
      if (![...el.checks].some((c) => c.checked)) {
        check.checked = true;
        return;
      }
      actualizarPool();
      nuevaPregunta();
    });
  });

  // ---------- Inicio ----------

  actualizarPool();
  actualizarTextoModo();
  actualizarMarcador();
  nuevaPregunta(false);   // false: no abrir el teclado en el celular al cargar
})();
