// ============================================================
// Practica de kanji N5
// Orden de carga: script.js -> kanji_datos.js -> practica_kanji.js
// ============================================================
(() => {
  const raiz = document.querySelector(".practica");
  if (!raiz || typeof KANJI_DATOS === "undefined") return;

  // ---------- Configuracion ----------

  const SPRITES = {
    neutral: "sprits/Rie_neutral.png",
    feliz:   "sprits/Rie_happy.jpg",
    enojada: "sprits/Rie_angry.jpg",
  };

  // Cuantas opciones salen en el modo Kanji -> Significado
  const OPCIONES_POR_PREGUNTA = 4;

  // ---------- Kana -> romaji (para aceptar lecturas escritas en romaji) ----------
  // Cada silaba puede tener varias formas validas (shi / si, tsu / tu...)

  const ROMAJI = {
    あ: ["a"], い: ["i"], う: ["u"], え: ["e"], お: ["o"],
    か: ["ka"], き: ["ki"], く: ["ku"], け: ["ke"], こ: ["ko"],
    さ: ["sa"], し: ["shi", "si"], す: ["su"], せ: ["se"], そ: ["so"],
    た: ["ta"], ち: ["chi", "ti"], つ: ["tsu", "tu"], て: ["te"], と: ["to"],
    な: ["na"], に: ["ni"], ぬ: ["nu"], ね: ["ne"], の: ["no"],
    は: ["ha"], ひ: ["hi"], ふ: ["fu", "hu"], へ: ["he"], ほ: ["ho"],
    ま: ["ma"], み: ["mi"], む: ["mu"], め: ["me"], も: ["mo"],
    や: ["ya"], ゆ: ["yu"], よ: ["yo"],
    ら: ["ra"], り: ["ri"], る: ["ru"], れ: ["re"], ろ: ["ro"],
    わ: ["wa"], を: ["wo", "o"], ん: ["n", "nn"],
    が: ["ga"], ぎ: ["gi"], ぐ: ["gu"], げ: ["ge"], ご: ["go"],
    ざ: ["za"], じ: ["ji", "zi"], ず: ["zu"], ぜ: ["ze"], ぞ: ["zo"],
    だ: ["da"], ぢ: ["ji", "di", "zi"], づ: ["zu", "du"], で: ["de"], ど: ["do"],
    ば: ["ba"], び: ["bi"], ぶ: ["bu"], べ: ["be"], ぼ: ["bo"],
    ぱ: ["pa"], ぴ: ["pi"], ぷ: ["pu"], ぺ: ["pe"], ぽ: ["po"],
  };

  // Yoon: base + ゃ/ゅ/ょ  (ky + a = kya)
  const YOON_PREFIJOS = {
    き: ["ky"], し: ["sh", "sy"], ち: ["ch", "ty"], に: ["ny"], ひ: ["hy"],
    み: ["my"], り: ["ry"], ぎ: ["gy"], じ: ["j", "jy", "zy"], び: ["by"], ぴ: ["py"],
  };
  const YOON_VOCAL = { ゃ: "a", ゅ: "u", ょ: "o" };

  // Katakana -> hiragana (resta 0x60 al codigo del caracter)
  const aHiragana = (texto) =>
    texto.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

  // "ひゃく" -> ["ひゃ", "く"]
  function partirKana(texto) {
    const silabas = [];
    for (const c of texto) {
      if (YOON_VOCAL[c] && silabas.length) silabas[silabas.length - 1] += c;
      else silabas.push(c);
    }
    return silabas;
  }

  function romajiDeSilaba(silaba) {
    if (silaba.length === 2 && YOON_VOCAL[silaba[1]] && YOON_PREFIJOS[silaba[0]]) {
      return YOON_PREFIJOS[silaba[0]].map((p) => p + YOON_VOCAL[silaba[1]]);
    }
    return ROMAJI[silaba] || null;
  }

  // Todas las formas romaji validas de una lectura
  function variantesRomaji(lectura, esOnyomi) {
    let combos = [""];
    partirKana(aHiragana(lectura)).forEach((silaba) => {
      const opciones = romajiDeSilaba(silaba);
      if (!opciones) throw new Error("Silaba desconocida: " + silaba + " en " + lectura);
      combos = combos.flatMap((c) => opciones.map((o) => c + o));
    });

    const set = new Set(combos);

    // En onyomi se acepta escribir las vocales largas de varias formas:
    // shou / shoo / sho,  kyuu / kyu,  sei / see / se
    if (esOnyomi) {
      combos.forEach((c) => {
        set.add(c.replace(/ou/g, "oo"));
        set.add(c.replace(/ou|oo/g, "o"));
        set.add(c.replace(/uu/g, "u"));
        set.add(c.replace(/ei/g, "ee"));
        set.add(c.replace(/ei/g, "e"));
      });
    }
    return set;
  }

  // ---------- Preparar los datos ----------

  const SECCIONES = {};   // id -> lista de kanji

  KANJI_DATOS.forEach((seccion) => {
    SECCIONES[seccion.id] = seccion.kanji.map((item) => {
      const rOn = new Set();
      const rKun = new Set();
      item.on.forEach((l) => variantesRomaji(l, true).forEach((r) => rOn.add(r)));
      item.kun.forEach((l) => variantesRomaji(l, false).forEach((r) => rKun.add(r)));

      const significado = item.sig[0].toUpperCase() + item.sig.slice(1);
      return {
        k: item.k,
        sig: item.sig,
        significado,
        palabras: item.sig.split(/,\s*/),        // para evitar opciones repetidas
        on: item.on,
        kun: item.kun,
        rOn, rKun,                               // romaji aceptado
        kOn: new Set(item.on.map(aHiragana)),    // kana aceptado (hiragana)
        kKun: new Set(item.kun),
        detalle:
          `${significado} · ON: ${item.on.join(" / ")} · KUN: ${item.kun.length ? item.kun.join(" / ") : "—"}`,
      };
    });
  });

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
    detalle:    document.getElementById("p_detalle"),
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
    modo: "significado",   // "significado" | "lectura"
    pool: [],
    actual: null,
    respondida: false,
    racha: 0,
    buenas: 0,
    malas: 0,
  };

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

  const ponerSprite = (nombre) => { el.personaje.src = SPRITES[nombre]; };

  function actualizarMarcador() {
    el.racha.textContent = estado.racha;
    el.buenas.textContent = estado.buenas;
    el.malas.textContent = estado.malas;
  }

  function actualizarPool() {
    estado.pool = [];
    el.checks.forEach((check) => {
      if (check.checked) estado.pool.push(...SECCIONES[check.value]);
    });
  }

  function actualizarTextoModo() {
    el.modo.textContent =
      estado.modo === "significado" ? "Kanji → Significado" : "Kanji → Lectura";
  }

  // "  Shi-Si " -> "shisi"
  const normalizar = (texto) => texto.toLowerCase().replace(/[\s'’\-・]/g, "");

  // Devuelve "onyomi", "kunyomi" o null
  function tipoDeLectura(item, escrito) {
    const texto = normalizar(escrito);
    if (!texto) return null;

    // Escrito en kana (hiragana o katakana)
    if (/[぀-ヿ]/.test(texto)) {
      const kana = aHiragana(texto);
      if (item.kOn.has(kana)) return "onyomi";
      if (item.kKun.has(kana)) return "kunyomi";
      return null;
    }

    // Escrito en romaji
    if (item.rOn.has(texto)) return "onyomi";
    if (item.rKun.has(texto)) return "kunyomi";
    return null;
  }

  // ---------- Preguntas ----------

  function nuevaPregunta(enfocar = true) {
    let candidato;
    do {
      candidato = aleatorio(estado.pool);
    } while (estado.pool.length > 1 && candidato === estado.actual);

    estado.actual = candidato;
    estado.respondida = false;

    el.tarjeta.classList.remove("is-ok", "is-mal");
    el.feedback.textContent = "";
    el.detalle.textContent = "";
    ponerSprite("neutral");

    el.siguiente.hidden = true;
    el.noLoSe.hidden = false;
    el.simbolo.textContent = candidato.k;

    if (estado.modo === "significado") {
      el.etiqueta.textContent = "¿Qué significa?";
      el.form.hidden = true;
      el.opciones.hidden = false;
      armarOpciones();
    } else {
      el.etiqueta.textContent = "¿Cómo se lee? (vale onyomi o kunyomi)";
      el.opciones.hidden = true;
      el.form.hidden = false;
      el.input.value = "";
      el.input.readOnly = false;
      el.comprobar.hidden = false;
      if (enfocar) el.input.focus();
    }
  }

  // 4 significados en espanol; las falsas no comparten palabras con la correcta
  function armarOpciones() {
    const correcta = estado.actual;

    // Primero de las secciones elegidas; si faltan, de todos los kanji
    const todos = Object.values(SECCIONES).flat();
    const valido = (item) =>
      item !== correcta && !item.palabras.some((p) => correcta.palabras.includes(p));

    let distractores = mezclar(estado.pool.filter(valido));
    if (distractores.length < OPCIONES_POR_PREGUNTA - 1) {
      const extra = mezclar(todos.filter((i) => valido(i) && !distractores.includes(i)));
      distractores = distractores.concat(extra);
    }
    distractores = distractores.slice(0, OPCIONES_POR_PREGUNTA - 1);

    el.opciones.innerHTML = "";
    mezclar([correcta, ...distractores]).forEach((item) => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "practica_opcion";
      boton.textContent = item.significado;
      boton.dataset.correcta = item === correcta ? "1" : "0";
      boton.addEventListener("click", () => elegirOpcion(boton));
      el.opciones.appendChild(boton);
    });
  }

  // ---------- Resultados ----------

  function resolver(acierto, motivo, tipo) {
    estado.respondida = true;

    if (acierto) {
      estado.racha++;
      estado.buenas++;
      ponerSprite("feliz");
      el.tarjeta.classList.add("is-ok");
      el.feedback.textContent = "¡Correcto! ✧" + (tipo ? ` (${tipo})` : "");
    } else {
      estado.racha = 0;
      estado.malas++;
      ponerSprite("enojada");
      el.tarjeta.classList.add("is-mal");

      if (motivo === "no-se") {
        el.feedback.textContent = "Se lee / significa:";
      } else if (estado.modo === "significado") {
        el.feedback.textContent = "Incorrecto. Era: " + estado.actual.significado;
      } else {
        el.feedback.textContent = "Incorrecto. Las lecturas son:";
      }
    }

    // Ficha completa del kanji (significado + onyomi + kunyomi)
    el.detalle.textContent = estado.actual.detalle;

    actualizarMarcador();

    el.input.readOnly = true;
    el.comprobar.hidden = true;
    el.noLoSe.hidden = true;
    el.siguiente.hidden = false;
    el.siguiente.focus();
  }

  function marcarOpciones(elegida) {
    el.opciones.querySelectorAll(".practica_opcion").forEach((b) => {
      b.disabled = true;
      if (b.dataset.correcta === "1") b.classList.add("is-correcta");
    });
    if (elegida && elegida.dataset.correcta !== "1") elegida.classList.add("is-incorrecta");
  }

  function enviarTexto() {
    if (estado.respondida) return nuevaPregunta();

    const escrito = el.input.value;
    if (!normalizar(escrito)) return;   // vacio: no hace nada

    const tipo = tipoDeLectura(estado.actual, escrito);
    resolver(Boolean(tipo), null, tipo);
  }

  function elegirOpcion(boton) {
    if (estado.respondida) return;
    resolver(boton.dataset.correcta === "1");
    marcarOpciones(boton);
  }

  function noLoSe() {
    if (estado.respondida) return;
    resolver(false, "no-se");
    if (estado.modo === "significado") marcarOpciones(null);
  }

  // ---------- Eventos ----------

  el.form.addEventListener("submit", (e) => {
    e.preventDefault();
    enviarTexto();
  });

  el.noLoSe.addEventListener("click", noLoSe);
  el.siguiente.addEventListener("click", () => nuevaPregunta());

  el.modo.addEventListener("click", () => {
    estado.modo = estado.modo === "significado" ? "lectura" : "significado";
    actualizarTextoModo();
    nuevaPregunta();
  });

  el.checks.forEach((check) => {
    check.addEventListener("change", () => {
      // Siempre debe quedar al menos una seccion activa
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
