/* ============================================================
   CLASE 6 — SISTEMAS OPERATIVOS (Gestión de la memoria)
   Lógica de navegación, simuladores, quizzes y taller
============================================================ */

const TOTAL_MODULOS = 7; // 0..6 (incluye módulo de descanso)

/* ---------- ESTADO GLOBAL ---------- */
const estado = {
  moduloActual: 0,
  completados: new Set(),
  quizzes: {},
  talleres: {},
  badges: new Set(),
  xp: 0
};

const XP_POR_MODULO = 30;
const XP_POR_QUIZ_PERFECTO = 25;
const XP_TOTAL = 640;

/* ---------- INICIO ---------- */
document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarCopiarCodigo();
  configurarQuizzes();
  configurarTaller();
  configurarTrivia();
  inicializarFeaturesGrid();
  inicializarPyramid();
  inicializarAllocSim();
  inicializarPageSim();
  inicializarMonSim();
  configurarTeclado();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
const STORAGE_KEY = 'curso-so-gestion-memoria';

function guardarProgreso() {
  try {
    const datos = {
      moduloActual: estado.moduloActual,
      completados: [...estado.completados],
      quizzes: estado.quizzes,
      talleres: estado.talleres,
      badges: [...estado.badges],
      xp: estado.xp
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
  } catch (e) { /* sin localStorage: ignorar */ }
}

function cargarProgreso() {
  try {
    const datos = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!datos) return;
    estado.moduloActual = datos.moduloActual || 0;
    estado.completados = new Set(datos.completados || []);
    estado.quizzes = datos.quizzes || {};
    estado.talleres = datos.talleres || {};
    estado.badges = new Set(datos.badges || []);
    estado.xp = datos.xp || 0;
  } catch (e) { /* datos corruptos: ignorar */ }
}

/* ---------- NAVEGACIÓN ---------- */
function configurarNavegacion() {
  document.querySelectorAll('.btn-modulo').forEach(btn => {
    btn.addEventListener('click', () => irAModulo(parseInt(btn.dataset.modulo, 10)));
  });
}

function configurarBotonesInternos() {
  document.querySelectorAll('.btn-anterior, .btn-siguiente').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = parseInt(btn.dataset.ir, 10);
      if (btn.classList.contains('btn-siguiente')) marcarCompletado(estado.moduloActual);
      irAModulo(m);
    });
  });
  document.querySelectorAll('[data-reiniciar]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('¿Quieres volver al inicio? Tu progreso se conserva.')) irAModulo(0);
    });
  });
}

function irAModulo(n) {
  if (n < 0 || n >= TOTAL_MODULOS) return;
  estado.moduloActual = n;
  document.querySelectorAll('.modulo').forEach(m => m.classList.remove('activo'));
  const mod = document.querySelector(`.modulo[data-modulo="${n}"]`);
  if (mod) mod.classList.add('activo');
  document.querySelectorAll('.btn-modulo').forEach(btn => {
    btn.classList.toggle('activo', parseInt(btn.dataset.modulo, 10) === n);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  actualizarUI();
  guardarProgreso();
}

/* ---------- COMPLETADOS, XP Y BADGES ---------- */
function marcarCompletado(n) {
  if (estado.completados.has(n)) return;
  estado.completados.add(n);
  estado.xp = Math.min(XP_TOTAL, estado.xp + XP_POR_MODULO);

  const badgesModulo = {
    0: '🚀 Iniciado',
    1: '🧠 Memoria Experta',
    2: '📦 Allocator',
    3: '☕ Descansado',
    4: '📄 Page Master',
    5: '📊 Monitor Pro',
    6: '🛠️ Memory Master'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 Memoria Dominada');
  }

  mostrarToast(`🎉 ¡+${XP_POR_MODULO} XP! Módulo ${n} completado`);
  guardarProgreso();
}

function otorgarBadge(nombre) {
  if (estado.badges.has(nombre)) return;
  estado.badges.add(nombre);
  mostrarToast(`🎖️ Insignia: ${nombre}`);
  actualizarUI();
}

function addXP(cantidad) {
  estado.xp = Math.min(XP_TOTAL, estado.xp + cantidad);
  guardarProgreso();
  actualizarUI();
}

/* ---------- UI: PROGRESO Y BADGES ---------- */
function actualizarUI() {
  const completables = [1, 2, 4, 5, 6];
  const total = completables.length;
  const completos = completables.filter(m => estado.completados.has(m)).length;
  const pct = Math.round((completos / total) * 100);

  const barra = document.getElementById('barra');
  if (barra) barra.style.width = pct + '%';

  const ptxt = document.getElementById('porcentaje');
  if (ptxt) ptxt.textContent = pct + '%';

  const mAct = document.getElementById('modulo-actual');
  if (mAct) {
    const labels = ['Inicio', 'Tipos de memoria', 'Administración', 'Descanso', 'Segmentación y paginación', 'Recursos y monitoreo', 'Taller'];
    mAct.textContent = labels[estado.moduloActual] || ('Módulo ' + estado.moduloActual);
  }

  const xpEl = document.getElementById('xp-display');
  if (xpEl) xpEl.textContent = `${estado.xp} / ${XP_TOTAL} XP`;

  const badgesCont = document.getElementById('badges');
  if (badgesCont) {
    badgesCont.innerHTML = '';
    estado.badges.forEach(b => {
      const span = document.createElement('span');
      span.className = 'badge';
      span.textContent = b;
      badgesCont.appendChild(span);
    });
  }

  document.querySelectorAll('.btn-modulo').forEach(btn => {
    const m = parseInt(btn.dataset.modulo, 10);
    btn.classList.toggle('completado', estado.completados.has(m));
  });
}

/* ---------- COPIAR CÓDIGO ---------- */
function configurarCopiarCodigo() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.closest('.code-wrap').querySelector('code, pre').innerText;
      navigator.clipboard.writeText(code).then(() => {
        const original = btn.textContent;
        btn.textContent = '✅ Copiado';
        btn.classList.add('ok');
        setTimeout(() => { btn.textContent = original; btn.classList.remove('ok'); }, 1800);
      });
    });
  });
}

/* ---------- QUIZZES ---------- */
function configurarQuizzes() {
  document.querySelectorAll('.quiz').forEach(quiz => {
    const idQuiz = quiz.dataset.quiz;
    const preguntas = quiz.querySelectorAll('.pregunta');

    preguntas.forEach(pregunta => {
      const correcta = pregunta.dataset.correcta;
      const opciones = pregunta.querySelectorAll('.opcion');

      opciones.forEach(op => {
        op.addEventListener('click', () => {
          if (pregunta.dataset.respondida === 'true') return;
          pregunta.dataset.respondida = 'true';

          const elegida = op.dataset.op;
          if (elegida === correcta) {
            op.classList.add('correcta');
            pregunta.dataset.acierto = 'true';
          } else {
            op.classList.add('incorrecta');
            pregunta.dataset.acierto = 'false';
            opciones.forEach(o => {
              if (o.dataset.op === correcta) o.classList.add('correcta');
            });
          }

          opciones.forEach(o => o.disabled = true);
          verificarQuizCompleto(quiz, idQuiz);
        });
      });
    });
  });
}

function verificarQuizCompleto(quiz, idQuiz) {
  const preguntas = quiz.querySelectorAll('.pregunta');
  const respondidas = quiz.querySelectorAll('.pregunta[data-respondida="true"]');
  if (preguntas.length !== respondidas.length) return;

  let aciertos = 0;
  preguntas.forEach(p => { if (p.dataset.acierto === 'true') aciertos++; });
  const total = preguntas.length;

  // Evita farmear XP recargando: solo se recompensa la primera vez que se logra el perfect
  const yaRecompensado = estado.quizzes[idQuiz] && estado.quizzes[idQuiz].recompensado;
  estado.quizzes[idQuiz] = { aciertos, total, recompensado: !!yaRecompensado };

  if (aciertos === total && !yaRecompensado) {
    estado.quizzes[idQuiz].recompensado = true;
    addXP(XP_POR_QUIZ_PERFECTO);
  }

  const res = quiz.querySelector('.resultado-quiz');
  if (res) {
    res.classList.add('visible');
    if (aciertos === total) {
      res.classList.add('exito');
      res.innerHTML = yaRecompensado
        ? `🎉 ¡Perfecto! ${aciertos}/${total}.`
        : `🎉 ¡Perfecto! ${aciertos}/${total}. (+${XP_POR_QUIZ_PERFECTO} XP)`;
    } else if (aciertos >= total / 2) {
      res.classList.add('parcial');
      res.textContent = `👍 ${aciertos}/${total} correctas. ¡Buen intento!`;
    } else {
      res.classList.add('parcial');
      res.textContent = `🤔 ${aciertos}/${total}. Te invitamos a releer el módulo.`;
    }
  }

  guardarProgreso();
}

/* ---------- TRIVIA (descanso) ---------- */
function configurarTrivia() {
  const opts = document.querySelectorAll('#triviaOpts .trivia-opt');
  const result = document.getElementById('triviaResult');
  if (!opts.length || !result) return;

  const correcta = opts.length ? (opts[0].closest('#triviaOpts').querySelector('[data-tcorrecta]')?.dataset.tcorrecta) : null;

  opts.forEach(op => {
    op.addEventListener('click', () => {
      const elegida = op.dataset.top;
      opts.forEach(o => { o.disabled = true; if (o.dataset.top === correcta) o.classList.add('correcta'); });
      if (elegida === correcta) {
        result.className = 'trivia-result visible ok';
        result.textContent = '✅ ¡Correcto! La caché guarda copias rapidísimas de los datos más usados. ¡Volvamos a la clase!';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Casi. La caché es una copia pequeña y rapidísima de los datos que la CPU usa con más frecuencia. ¡A seguir!';
      }
    });
  });
}

/* ---------- FEATURES GRID (Módulo 1: 5 niveles) ---------- */
function inicializarFeaturesGrid() {
  const grid = document.getElementById('featuresGrid');
  if (!grid) return;

  const features = [
    { icon: '⚡', title: 'Registros', short: 'Dentro de la CPU. ~0,3 ns. Unos pocos KB.', long: 'Son las celdas de memoria dentro del propio procesador. Guardan los datos que la CPU está usando EN ESTE INSTANTE (operandos, contador de programa). Son lo más rápido que existe, pero caben poquísimas cosas: por eso se usan como "mesa de trabajo" momentánea.' },
    { icon: '🚀', title: 'Caché (L1/L2/L3)', short: 'Entre CPU y RAM. ~1-10 ns. Unos pocos MB.', long: 'Memoria SRAM ultrarrápida que guarda COPIA de los datos de la RAM que la CPU pide con más frecuencia. Cuando la CPU repite una petición, la caché responde sin bajar a la RAM. Niveles: L1 (dentro del núcleo, diminuta), L2 y L3 (más grandes y un poco más lentas).' },
    { icon: '💾', title: 'RAM (DRAM)', short: 'Memoria principal. ~10-100 ns. GB.', long: 'La memoria principal: aquí viven los procesos en ejecución (clase 5). Es volátil: al apagar el equipo se borra. Es la que el SO administra con particiones, paginación y swap. Su tamaño es el que ves en la caja del PC: 4, 8, 16 GB…' },
    { icon: '🔒', title: 'ROM / Firmware', short: 'Solo lectura. ~100 ns. MB.', long: 'Memoria no volátil grabada de fábrica. Guarda el firmware y el BIOS/UEFI: el primer programa que corre al encender y que arranca el sistema operativo. No la administra el SO para procesos; es de solo lectura (aunque hoy los BIOS modernos se pueden actualizar con cuidado).' },
    { icon: '🗄️', title: 'Disco (SSD/HDD)', short: 'Secundaria. ~0,1-10 ms. GB-TB. Persistente.', long: 'La memoria de almacenamiento: archivos, programas instalados y el swap. Es MIL VECES más lenta que la RAM (milisegundos vs nanosegundos) pero barata y persistente. Cuando el SO usa el disco como "RAM de respaldo" (swap), todo se siente lento: por eso "abrir el juego desde el disco" tarda.' }
  ];

  grid.innerHTML = features.map((f, i) =>
    `<div class="feature-card" data-fidx="${i}">
      <span class="f-icon">${f.icon}</span>
      <div class="f-title">${f.title}</div>
      <p class="f-short">${f.short}</p>
      <div class="f-long">${f.long}</div>
    </div>`
  ).join('');

  grid.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('click', () => {
      const isOpen = card.classList.contains('expanded');
      grid.querySelectorAll('.feature-card').forEach(c => c.classList.remove('expanded'));
      if (!isOpen) {
        card.classList.add('expanded');
        addXP(2);
      }
    });
  });
}

/* ---------- PIRÁMIDE DE MEMORIA (Módulo 1) ---------- */
function inicializarPyramid() {
  const pyr = document.getElementById('memPyramid');
  const info = document.getElementById('pyramidInfo');
  if (!pyr || !info) return;

  const niveles = [
    { nombre: 'Registros', tam: 'KB', vel: '~0,3 ns', color: '#22d3ee' },
    { nombre: 'Caché', tam: 'MB', vel: '~1-10 ns', color: '#00ff9d' },
    { nombre: 'RAM', tam: 'GB', vel: '~10-100 ns', color: '#a855f7' },
    { nombre: 'ROM', tam: 'MB', vel: '~100 ns', color: '#facc15' },
    { nombre: 'Disco', tam: 'GB-TB', vel: '~0,1-10 ms', color: '#ff7a29' }
  ];

  pyr.innerHTML = niveles.map((n, i) => `
    <div class="pyramid-level" data-lvl="${i}" style="--lvl-color:${n.color};">
      <span class="p-name">${n.nombre}</span>
      <span class="p-meta">${n.tam} · ${n.vel}</span>
    </div>`).join('');

  pyr.querySelectorAll('.pyramid-level').forEach(lvl => {
    lvl.addEventListener('click', () => {
      pyr.querySelectorAll('.pyramid-level').forEach(l => l.classList.remove('activo'));
      lvl.classList.add('activo');
      const n = niveles[parseInt(lvl.dataset.lvl, 10)];
      const veces = n.vel.includes('ms')
        ? '¡un millón de veces más lento que la RAM!'
        : 'nanosegundos: un abrir y cerrar de ojos a nivel atómico.';
      info.innerHTML = `<strong style="color:${n.color}">${n.nombre}</strong> — tamaño típico: ${n.tam} · acceso: ${n.vel} (${veces})`;
      addXP(2);
    });
  });
}

/* ---------- SIMULADOR DE ASIGNACIÓN (Módulo 2) ---------- */
function inicializarAllocSim() {
  const strip = document.getElementById('allocStrip');
  const logEl = document.getElementById('allocLog');
  const status = document.getElementById('allocStatus');
  if (!strip || !logEl || !status) return;

  const HUECOS = [100, 400, 200, 300, 500]; // KB, en orden
  const PROCESOS = [
    { id: 'P1', size: 150 },
    { id: 'P2', size: 300 },
    { id: 'P3', size: 120 },
    { id: 'P4', size: 90 },
    { id: 'P5', size: 450 }
  ];
  const TOTAL = HUECOS.reduce((a, b) => a + b, 0); // 1500 KB

  const log = (cls, msg) => {
    const d = document.createElement('div');
    d.className = 'log-line';
    d.innerHTML = `<span class="t">[MEM]</span> <span class="${cls}">${msg}</span>`;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
  };

  function render(bloques) {
    strip.innerHTML = bloques.map((b, i) => {
      const ancho = (b.orig / TOTAL) * 100;
      let inner = '';
      (b.procs || []).forEach(p => {
        inner += `<div class="alloc-proc" style="width:${(p.size / b.orig) * 100}%;" title="${p.id} (${p.size} KB)">${p.id}</div>`;
      });
      if (b.size > 0) {
        inner += `<div class="alloc-hueco" style="width:${(b.size / b.orig) * 100}%;" title="${b.size} KB libres">${b.size}</div>`;
      }
      return `<div class="alloc-block" style="width:${ancho}%;" data-blk="${i}">
        <div class="alloc-block-head">H${i + 1} · ${b.orig} KB</div>
        <div class="alloc-block-inner">${inner}</div>
      </div>`;
    }).join('');
  }

  function ejecutar(alg) {
    const bloques = HUECOS.map(s => ({ size: s, orig: s, procs: [] }));
    logEl.innerHTML = '';
    let ok = 0;

    PROCESOS.forEach(p => {
      let idx = -1;
      if (alg === 'first') {
        idx = bloques.findIndex(b => b.size >= p.size);
      } else if (alg === 'best') {
        let mejor = -1, mejorTam = Infinity;
        bloques.forEach((b, i) => {
          if (b.size >= p.size && b.size < mejorTam) { mejorTam = b.size; mejor = i; }
        });
        idx = mejor;
      } else if (alg === 'worst') {
        let peor = -1, peorTam = -1;
        bloques.forEach((b, i) => {
          if (b.size >= p.size && b.size > peorTam) { peorTam = b.size; peor = i; }
        });
        idx = peor;
      }

      if (idx === -1) {
        log('err', `${p.id} (${p.size} KB) ❌ NO cabe: ningún hueco contiguo ≥ ${p.size} KB`);
        return;
      }

      const b = bloques[idx];
      b.procs.push({ id: p.id, size: p.size });
      b.size -= p.size;
      ok++;
      log('ok', `${p.id} (${p.size} KB) → hueco H${idx + 1}: queda ${b.size} KB libre`);
    });

    const libreTotal = bloques.reduce((a, b) => a + b.size, 0);
    const libres = bloques.filter(b => b.size > 0).length;
    render(bloques);

    if (ok === PROCESOS.length) {
      status.innerHTML = `✅ <strong>${ok}/${PROCESOS.length}</strong> procesos colocados. Quedan ${libreTotal} KB libres en ${libres} huecos (fragmentación externa).`;
      status.style.color = 'var(--verde)';
    } else {
      status.innerHTML = `⚠️ Solo <strong>${ok}/${PROCESOS.length}</strong> colocados. Hay ${libreTotal} KB libres, pero dispersos en ${libres} huecos: el proceso que falta necesita un bloque <em>continuo</em>. ¡Eso es fragmentación externa!`;
      status.style.color = 'var(--ambar)';
    }
  }

  const nomAlg = { first: 'First Fit', best: 'Best Fit', worst: 'Worst Fit' };
  [['allocFirst', 'first'], ['allocBest', 'best'], ['allocWorst', 'worst']].forEach(([id, alg]) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => {
      logEl.innerHTML = '';
      log('ok', `Algoritmo: ${nomAlg[alg]} — cada proceso busca hueco donde quepa.`);
      ejecutar(alg);
      addXP(2);
    });
  });

  const reset = document.getElementById('allocReset');
  if (reset) reset.addEventListener('click', () => {
    logEl.innerHTML = '';
    status.innerHTML = 'Elige un algoritmo para repartir la memoria.';
    status.style.color = '';
    strip.innerHTML = HUECOS.map((s, i) => `
      <div class="alloc-block" style="width:${(s / TOTAL) * 100}%;" data-blk="${i}">
        <div class="alloc-block-head">H${i + 1} · ${s} KB</div>
        <div class="alloc-block-inner"><div class="alloc-hueco" style="width:100%;">${s}</div></div>
      </div>`).join('');
  });

  reset.click();
}

/* ---------- SIMULADOR DE PAGINACIÓN (Módulo 4) ---------- */
function inicializarPageSim() {
  const ptable = document.getElementById('pageTable');
  const pmap = document.getElementById('pageMap');
  const note = document.getElementById('ptableNote');
  const tLogic = document.getElementById('transLogic');
  const tFisica = document.getElementById('transFisica');
  const tSteps = document.getElementById('transSteps');
  const status = document.getElementById('pageStatus');
  if (!ptable || !pmap || !tLogic || !tFisica || !tSteps || !status) return;

  const PAGE_SIZE = 4096;
  const OCUPADOS = new Set([1, 3, 5, 6, 8, 10, 12, 14, 15]);
  let tabla = { 0: 2, 1: 7, 2: 4, 3: 11, 4: 9, 5: 13 };
  let paginasCargadas = [0, 1, 2, 3, 4, 5];
  let logica = null;

  function render() {
    // Tabla de páginas
    const paginas = [...paginasCargadas].sort((a, b) => a - b);
    ptable.innerHTML = paginas.map(pg =>
      `<div class="ptable-cell" data-page="${pg}">
        <span class="skey">página ${pg}</span>
        <span class="sval">→ marco ${tabla[pg]}</span>
      </div>`).join('') || '<div class="ptable-note">sin páginas cargadas</div>';

    // Mapa de marcos
    pmap.innerHTML = Array.from({ length: 16 }, (_, m) => {
      let cls = 'libre';
      let lbl = '·';
      if (OCUPADOS.has(m)) { cls = 'otro'; lbl = '👤'; }
      const pg = paginasCargadas.find(p => tabla[p] === m);
      if (pg !== undefined) { cls = 'navegador'; lbl = `p${pg}`; }
      return `<div class="page-cell ${cls}" data-marco="${m}"><span class="m-num">${m}</span><span class="m-lbl">${lbl}</span></div>`;
    }).join('');

    if (note) note.textContent = `página → marco (tamaño de página: ${PAGE_SIZE / 1024} KB)`;
  }

  function limpiarFlash() {
    ptable.querySelectorAll('.ptable-cell').forEach(c => c.classList.remove('flash'));
    pmap.querySelectorAll('.page-cell').forEach(c => c.classList.remove('flash'));
  }

  function flash(pg, marco) {
    limpiarFlash();
    const pc = ptable.querySelector(`.ptable-cell[data-page="${pg}"]`);
    if (pc) pc.classList.add('flash');
    const mc = pmap.querySelector(`.page-cell[data-marco="${marco}"]`);
    if (mc) mc.classList.add('flash');
  }

  const randomBtn = document.getElementById('pageRandom');
  if (randomBtn) randomBtn.addEventListener('click', () => {
    limpiarFlash();
    const pg = paginasCargadas[Math.floor(Math.random() * paginasCargadas.length)];
    const offset = Math.floor(Math.random() * PAGE_SIZE);
    logica = { pg, offset };
    tLogic.textContent = `lógica: p${pg} + offset ${offset}`;
    tFisica.textContent = 'física: —';
    tSteps.textContent = `La CPU pidió la dirección lógica página ${pg}, offset ${offset}. Presiona "🧮 Traducir".`;
    status.textContent = `Dirección lógica lista: página ${pg}, offset ${offset}.`;
    status.style.color = '';
    addXP(2);
  });

  const transBtn = document.getElementById('pageTranslate');
  if (transBtn) transBtn.addEventListener('click', () => {
    if (!logica) return;
    const { pg, offset } = logica;
    const marco = tabla[pg];
    const fisica = marco * PAGE_SIZE + offset;
    tFisica.textContent = `física: ${fisica}`;
    tSteps.innerHTML = `1) Consulta la tabla: página ${pg} → <strong>marco ${marco}</strong> · 2) Fórmula: ${marco} × ${PAGE_SIZE} + ${offset} = <strong>${fisica}</strong>`;
    flash(pg, marco);
    status.textContent = `Traducción OK: p${pg}+${offset} → marco ${marco} → dirección física ${fisica}.`;
    status.style.color = 'var(--verde)';
    addXP(2);
  });

  const faultBtn = document.getElementById('pageFault');
  if (faultBtn) faultBtn.addEventListener('click', () => {
    if (paginasCargadas.includes(7)) {
      status.textContent = 'ℹ️ La página 7 ya está en RAM (marco 0). Sin page fault.';
      status.style.color = '';
      return;
    }
    const libre = [0, 2, 4, 7, 9, 11, 13].find(m => !OCUPADOS.has(m) && !Object.values(tabla).includes(m));
    tLogic.textContent = 'lógica: p7 + offset 2048';
    tFisica.textContent = 'física: —';
    tSteps.innerHTML = '1) ⚠️ <strong>PAGE FAULT</strong>: la CPU pidió la página 7 pero no está en la tabla. · 2) El SO la busca en el <strong>swap</strong> y la carga en un marco libre.';
    tabla[7] = libre;
    paginasCargadas.push(7);
    render();
    flash(7, libre);
    status.innerHTML = `⚡ <strong>PAGE FAULT resuelto:</strong> página 7 cargada desde el swap al marco ${libre}. El proceso ni se enteró.`;
    status.style.color = 'var(--ambar)';
    addXP(3);
  });

  const resetBtn = document.getElementById('pageReset');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    tabla = { 0: 2, 1: 7, 2: 4, 3: 11, 4: 9, 5: 13 };
    paginasCargadas = [0, 1, 2, 3, 4, 5];
    logica = null;
    limpiarFlash();
    tLogic.textContent = 'lógica: —';
    tFisica.textContent = 'física: —';
    tSteps.textContent = 'Presiona "🎲 Dirección aleatoria" para empezar.';
    status.textContent = 'Listo. El Navegador tiene 6 páginas cargadas.';
    status.style.color = '';
    render();
  });

  render();
}

/* ---------- SIMULADOR DE MONITOREO (Módulo 5) ---------- */
function inicializarMonSim() {
  const status = document.getElementById('monStatus');
  if (!status) return;

  const el = {
    used: document.getElementById('monUsed'),
    free: document.getElementById('monFree'),
    cache: document.getElementById('monCache'),
    swapUsed: document.getElementById('monSwapUsed'),
    swapFree: document.getElementById('monSwapFree'),
    segUsed: document.getElementById('monSegUsed'),
    segCache: document.getElementById('monSegCache'),
    segFree: document.getElementById('monSegFree'),
    segSwap: document.getElementById('monSegSwap')
  };

  const INICIAL = { used: 6.1, cache: 5.6, free: 4.3, swapUsed: 0 };
  let m = { ...INICIAL };
  const TOTAL = 16, SWAP_TOTAL = 2;

  const fmt = v => v <= 0.05 ? '0 B' : (v.toFixed(1).replace('.', ',') + ' Gi');

  function render(msj, color) {
    el.used.textContent = fmt(m.used);
    el.free.textContent = fmt(m.free);
    el.cache.textContent = fmt(m.cache);
    el.swapUsed.textContent = fmt(m.swapUsed);
    el.swapFree.textContent = fmt(Math.max(0, SWAP_TOTAL - m.swapUsed));
    el.segUsed.style.width = ((m.used / TOTAL) * 100) + '%';
    el.segCache.style.width = ((m.cache / TOTAL) * 100) + '%';
    el.segFree.style.width = ((m.free / TOTAL) * 100) + '%';
    el.segSwap.style.width = Math.min(100, (m.swapUsed / SWAP_TOTAL) * 100) + '%';
    status.textContent = msj;
    status.style.color = color || '';
  }

  function recalcular(accionOk) {
    m.free = +(TOTAL - m.used - m.cache).toFixed(1);
    if (m.free < 0) {
      const deficit = -m.free;
      m.free = 0;
      m.swapUsed = +(m.swapUsed + deficit).toFixed(1);
    }
    if (m.swapUsed > SWAP_TOTAL) {
      render('💥 ¡OOM! RAM y swap agotados: el SO activa el OOM killer y mata procesos para no colapsar. Cierra programas o reinicia el simulador.', 'var(--rosa)');
      return;
    }
    if (m.swapUsed > 0) {
      render(`⚠️ RAM llena: el SO mueve ${fmt(m.swapUsed)} al swap (disco). Todo se sentirá más lento.`, 'var(--ambar)');
    } else if (accionOk) {
      render('✅ Operación completada: la caché aprovecha la RAM libre. Todo fluye.', 'var(--verde)');
    }
  }

  const tabs = document.getElementById('monTabs');
  if (tabs) tabs.addEventListener('click', () => {
    m.used = +(m.used + 1.5).toFixed(1);
    m.cache = +(m.cache + 0.8).toFixed(1);
    recalcular(true);
    addXP(2);
  });

  const juego = document.getElementById('monJuego');
  if (juego) juego.addEventListener('click', () => {
    m.used = +(m.used + 4).toFixed(1);
    recalcular(true);
    addXP(2);
  });

  const cerrar = document.getElementById('monCerrar');
  if (cerrar) cerrar.addEventListener('click', () => {
    m.used = +(Math.max(0, m.used - 1.5)).toFixed(1);
    m.cache = +(Math.max(0, m.cache - 0.8)).toFixed(1);
    if (m.swapUsed > 0 && m.used + m.cache < TOTAL - 0.5) {
      m.swapUsed = +(Math.max(0, m.swapUsed - 1)).toFixed(1);
    }
    recalcular(true);
    addXP(2);
  });

  const reset = document.getElementById('monReset');
  if (reset) reset.addEventListener('click', () => {
    m = { ...INICIAL };
    render('Sistema en reposo: la caché aprovecha la RAM libre.', '');
  });

  reset.click();
}

/* ---------- ORDEN GENÉRICO (drag + flechas) ---------- */
function renumerarOrden(cont) {
  cont.querySelectorAll('.ws-order-item').forEach((it, i) => {
    const num = it.querySelector('.ord-num');
    if (num) num.textContent = i + 1;
  });
}

function configurarOrdenGenerico(cont) {
  let dragSrc = null;
  cont.querySelectorAll('.ws-order-item').forEach(it => {
    it.addEventListener('dragstart', e => {
      dragSrc = it;
      it.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    it.addEventListener('dragend', () => {
      it.classList.remove('dragging');
      renumerarOrden(cont);
    });
    it.addEventListener('dragover', e => {
      e.preventDefault();
      const after = getDragAfter(cont, e.clientY);
      if (after == null) cont.appendChild(dragSrc);
      else cont.insertBefore(dragSrc, after);
    });
  });

  const scope = cont.closest('.simulador') || cont.closest('.challenge') || cont.parentElement;
  scope.querySelectorAll('[data-ws-up]').forEach(btn => {
    btn.addEventListener('click', () => {
      moverOrdenGenerico(cont, -1);
      renumerarOrden(cont);
    });
  });
  scope.querySelectorAll('[data-ws-down]').forEach(btn => {
    btn.addEventListener('click', () => {
      moverOrdenGenerico(cont, 1);
      renumerarOrden(cont);
    });
  });
}

function getDragAfter(container, y) {
  const els = [...container.querySelectorAll('.ws-order-item:not(.dragging)')];
  return els.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: -Infinity }).element;
}

function moverOrdenGenerico(cont, dir) {
  const selected = cont.querySelector('.ws-order-item.selected');
  if (!selected) {
    const first = cont.querySelector('.ws-order-item');
    if (first) first.classList.add('selected');
    return;
  }
  const items = [...cont.children];
  const i = items.indexOf(selected);
  const j = i + dir;
  if (j < 0 || j >= items.length) return;
  if (dir < 0) cont.insertBefore(selected, items[j]);
  else cont.insertBefore(selected, items[j].nextSibling);
}

document.addEventListener('click', e => {
  const it = e.target.closest('.ws-order-item');
  if (!it) return;
  const cont = it.parentElement;
  cont.querySelectorAll('.ws-order-item').forEach(x => x.classList.remove('selected'));
  it.classList.add('selected');
});

/* ---------- TALLER (matching + order + input + select) ---------- */
const TALLER_RESP = {
  1: { '1a': '1A', '1b': '1B', '1c': '1C', '1d': '1D' }
};
const TALLER_ORDER = { 2: ['2reg', '2cache', '2ram', '2ssd', '2hdd', '2cinta'] };
const TALLER_INPUT = { 3: '17384' };
const TALLER_SELECT = { 4: '4B' };
let reto4Seleccion = null;

const seleccionMatch = {};
const parejasMatch = {};

function configurarTaller() {
  document.querySelectorAll('[data-ws-match]').forEach(block => {
    const id = block.dataset.wsMatch;
    parejasMatch[id] = [];
    seleccionMatch[id] = {};

    block.querySelectorAll('[data-role="left"] .ws-chip').forEach(chip => {
      chip.addEventListener('click', () => seleccionarMatchChip(id, chip, 'left'));
    });
    block.querySelectorAll('[data-role="right"] .ws-chip').forEach(chip => {
      chip.addEventListener('click', () => seleccionarMatchChip(id, chip, 'right'));
    });
  });

  const cont2 = document.getElementById('wsOrder2');
  if (cont2) configurarOrdenGenerico(cont2);

  document.querySelectorAll('[data-r4]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-r4]').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      reto4Seleccion = chip.dataset.r4;
    });
  });

  document.querySelectorAll('[data-check-ws]').forEach(btn => {
    btn.addEventListener('click', () => validarReto(btn.dataset.checkWs));
  });
}

function seleccionarMatchChip(id, chip, lado) {
  if (chip.classList.contains('correct')) return;

  seleccionMatch[id][lado] = chip.dataset.mid;
  const block = chip.closest('.ws-block');
  block.querySelectorAll(`[data-role="${lado}"] .ws-chip`).forEach(c => c.classList.remove('selected'));
  chip.classList.add('selected');

  if (seleccionMatch[id].left && seleccionMatch[id].right) {
    parejasMatch[id].push({ left: seleccionMatch[id].left, right: seleccionMatch[id].right });
    block.querySelectorAll('.ws-chip.selected').forEach(c => {
      c.classList.remove('selected');
      c.classList.add('paired-temp');
      c.style.opacity = '0.5';
    });
    seleccionMatch[id] = {};
  }
}

function validarReto(id) {
  const fb = document.getElementById(`ws-fb-${id}`);
  if (!fb) return;
  if (!TALLER_RESP[id] && !TALLER_ORDER[id] && !TALLER_INPUT[id] && !TALLER_SELECT[id]) return;
  let allOk = true;

  if (TALLER_RESP[id]) {
    const block = document.querySelector(`[data-ws-match="${id}"]`);
    const correctMap = TALLER_RESP[id];

    // Limpiar parejas incorrectas previas: conservar solo las correctas y resetear estilos
    parejasMatch[id] = parejasMatch[id].filter(p => correctMap[p.left] === p.right);
    block.querySelectorAll('.ws-chip').forEach(c => {
      c.classList.remove('correct', 'wrong', 'paired-temp');
      c.style.opacity = '';
    });
    block.querySelectorAll('.ws-chip').forEach(c => {
      if (parejasMatch[id].some(p => p.left === c.dataset.mid || p.right === c.dataset.mid)) {
        c.classList.add('correct');
      }
    });

    const totalEsperado = Object.keys(correctMap).length;
    if (parejasMatch[id].length !== totalEsperado) allOk = false;
  }

  if (TALLER_ORDER[id]) {
    const cont = document.getElementById('wsOrder2');
    const items = [...cont.querySelectorAll('.ws-order-item')];
    const orden = items.map(it => it.dataset.oid);
    const expected = TALLER_ORDER[id];
    items.forEach((it, i) => {
      it.classList.remove('correct', 'wrong');
      if (orden[i] === expected[i]) {
        it.classList.add('correct');
      } else {
        it.classList.add('wrong');
        allOk = false;
      }
    });
  }

  if (TALLER_INPUT[id]) {
    document.querySelectorAll(`.ws-input[data-ws="${id}"]`).forEach(inp => {
      const got = inp.value.trim().toLowerCase();
      const exp = TALLER_INPUT[id].toLowerCase();
      inp.classList.remove('correct', 'wrong');
      if (got === exp) {
        inp.classList.add('correct');
      } else {
        inp.classList.add('wrong');
        allOk = false;
      }
    });
  }

  if (TALLER_SELECT[id]) {
    const chips = document.querySelectorAll('[data-r4]');
    chips.forEach(c => c.classList.remove('correct', 'wrong'));
    if (!reto4Seleccion) {
      allOk = false;
    } else if (reto4Seleccion === TALLER_SELECT[id]) {
      const okChip = document.querySelector(`[data-r4="${TALLER_SELECT[id]}"]`);
      if (okChip) okChip.classList.add('correct');
    } else {
      const badChip = document.querySelector(`[data-r4="${reto4Seleccion}"]`);
      if (badChip) badChip.classList.add('wrong');
      const okChip = document.querySelector(`[data-r4="${TALLER_SELECT[id]}"]`);
      if (okChip) okChip.classList.add('correct');
      allOk = false;
    }
  }

  fb.classList.add('visible');
  if (allOk) {
    fb.className = 'resultado-ws visible ok';
    const msgs = {
      1: '¡Perfecto! RAM=volátil de procesos, ROM=firmware de arranque, caché=copia rápida, swap=disco que extiende la RAM.',
      2: '¡Excelente! La jerarquía: Registros → Caché → RAM → SSD → HDD → Cinta. Cada nivel es más lento y más barato.',
      3: '¡Muy bien! Página 2 → marco 4. Dirección física = 4 × 4096 + 1000 = 17384.',
      4: '🏆 ¡JEFE FINAL VENCIDO! El SO usa memoria virtual: va intercambiando páginas entre RAM y swap. Lento, pero funciona.'
    };
    const xpPorReto = { 1: 30, 2: 35, 3: 40, 4: 45 };
    fb.innerHTML = `✅ ${msgs[id]} <strong>+${xpPorReto[id]} XP</strong>`;
    if (!estado.talleres[id]) {
      estado.talleres[id] = true;
      addXP(xpPorReto[id]);
    }
    const retosTaller = ['1', '2', '3', '4'];
    if (retosTaller.every(r => estado.talleres[r])) {
      marcarCompletado(6);
      otorgarBadge('🛠️ Memory Master Completado');
    }
  } else {
    fb.className = 'resultado-ws visible no';
    const hints = {
      1: 'Pista: RAM→guarda procesos actuales; ROM→firmware de arranque; caché→copia rápida de uso frecuente; swap→disco que extiende la RAM.',
      2: 'Pista: el orden es Registros → Caché → RAM → SSD → HDD → Cinta. Piensa en velocidad: CPU primero, cintas de backup al final.',
      3: 'Pista: página 2 está en el marco 4. Calcula 4 × 4096 + 1000. Solo el número, sin comas ni espacios.',
      4: 'Pista: con paginación + swap el proceso puede "caber" aunque la RAM física sea menor. El SO intercambia páginas entre RAM y disco.'
    };
    fb.innerHTML = `❌ Algunas respuestas son incorrectas. ${hints[id]}`;
  }

  guardarProgreso();
}

/* ---------- ATAJOS DE TECLADO ---------- */
function configurarTeclado() {
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.key === 'ArrowRight') {
      if (estado.moduloActual < TOTAL_MODULOS - 1) {
        marcarCompletado(estado.moduloActual);
        irAModulo(estado.moduloActual + 1);
      }
    } else if (e.key === 'ArrowLeft') {
      if (estado.moduloActual > 0) irAModulo(estado.moduloActual - 1);
    }
  });
}

/* ---------- TOAST ---------- */
function mostrarToast(mensaje) {
  const toast = document.createElement('div');
  toast.textContent = mensaje;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    background: 'linear-gradient(135deg, #22d3ee, #00ff9d)',
    color: '#000',
    padding: '0.9rem 1.4rem',
    borderRadius: '30px',
    fontWeight: '700',
    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
    zIndex: '1000',
    transition: 'all 0.4s ease',
    opacity: '0',
    transform: 'translateY(20px)',
    maxWidth: '90%',
    fontSize: '0.92rem'
  });
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
