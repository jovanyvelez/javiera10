/* ============================================================
   CLASE 7 — SISTEMAS OPERATIVOS (Gestión del almacenamiento)
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
// Máximo alcanzable sin repetir interacciones: 7×30 (módulos) + 4×25 (quizzes)
// + 140 (taller) + 10 (features) + 9 (asignación) + 7 (USB) = 476
const XP_TOTAL = 476;

/* ---------- INICIO ---------- */
document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarQuizzes();
  configurarTaller();
  configurarTrivia();
  inicializarFsFeatures();
  inicializarAsignacionSim();
  inicializarParticionador();
  inicializarFormatoUsb();
  configurarTeclado();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
const STORAGE_KEY = 'curso-so-gestion-almacenamiento';

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
    1: '🗂️ Archivero',
    2: '📏 Asignador',
    3: '☕ Descansado',
    4: '🍕 Particionador',
    5: '🔧 Formateador',
    6: '🛠️ Storage Master'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 Almacenamiento Dominado');
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
    const labels = ['Inicio', 'Sistema de archivos', 'Asignación', 'Descanso', 'Particiones', 'Formateo', 'Taller'];
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

  const correcta = opts[0].closest('#triviaOpts').querySelector('[data-tcorrecta]')?.dataset.tcorrecta;

  opts.forEach(op => {
    op.addEventListener('click', () => {
      const elegida = op.dataset.top;
      opts.forEach(o => { o.disabled = true; if (o.dataset.top === correcta) o.classList.add('correcta'); });
      if (elegida === correcta) {
        result.className = 'trivia-result visible ok';
        result.textContent = '✅ ¡Correcto! El bloque índice guarda la lista de bloques de un archivo. ¡Volvamos a la clase!';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Casi. El bloque índice es un bloque especial que guarda la lista de bloques de un archivo.';
      }
    });
  });
}

/* ---------- FEATURES GRID (Módulo 1) ---------- */
function inicializarFsFeatures() {
  const grid = document.getElementById('fsFeatures');
  if (!grid) return;

  const features = [
    { icon: '📁', title: 'Archivos', short: 'Unidad básica: fotos, documentos, juegos…', long: 'Un archivo es un conjunto de datos con un nombre y una extensión. El sistema de archivos lo identifica, sabe dónde están sus bloques y controla quién puede usarlo.' },
    { icon: '📂', title: 'Carpetas / directorios', short: 'Contenedores que organizan archivos.', long: 'Las carpetas (o directorios) son archivos especiales que guardan una lista de otros archivos y carpetas. Gracias a ellas puedes tener una estructura en árbol: C:\Usuarios\Tu\Documentos.' },
    { icon: '🏷️', title: 'Metadatos', short: 'Datos sobre los datos.', long: 'Son la información extra de cada archivo: tamaño, fecha de creación, fecha de modificación, permisos, propietario y qué bloques ocupa. Sin metadatos, el SO no sabría ni por dónde empezar a leer.' },
    { icon: '🛡️', title: 'Permisos', short: 'Quién puede leer, escribir o ejecutar.', long: 'El sistema de archivos asigna permisos a cada archivo. En Linux se ven como rwx (read, write, execute). En Windows también hay ACLs (listas de control de acceso) más finas.' },
    { icon: '🗺️', title: 'Tabla de asignación', short: 'El mapa de bloques del disco.', long: 'Es la estructura que dice qué bloques del disco están libres, cuáles ocupados y cuáles pertenecen a cada archivo. En FAT se llama FAT; en NTFS es el MFT; en ext4 es el bitmap de bloques + inodos.' }
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
      if (!isOpen && !card.dataset.xp) {
        card.dataset.xp = '1'; // XP solo la primera vez que se expande
        card.classList.add('expanded');
        addXP(2);
      }
    });
  });
}

/* ---------- SIMULADOR DE ASIGNACIÓN (Módulo 2) ---------- */
function inicializarAsignacionSim() {
  const grid = document.getElementById('diskGrid');
  const info = document.getElementById('allocInfo');
  const logEl = document.getElementById('allocLog');
  if (!grid || !info || !logEl) return;

  const TOTAL_BLOQUES = 24;
  let ocupados = [2, 3, 7, 8, 9, 13, 14, 18, 19, 20];
  let asignados = [];
  let indice = null;
  const xpDado = new Set(); // XP solo la primera vez por estrategia

  function render() {
    grid.innerHTML = '';
    for (let i = 0; i < TOTAL_BLOQUES; i++) {
      const div = document.createElement('div');
      div.className = 'disk-block';
      div.textContent = i;
      if (indice === i) {
        div.classList.add('indice');
        div.textContent = 'I';
      } else if (asignados.includes(i)) {
        div.classList.add('archivo');
      } else if (ocupados.includes(i)) {
        div.classList.add('ocupado');
      } else {
        div.classList.add('libre');
      }
      grid.appendChild(div);
    }
  }

  function log(cls, msg) {
    const d = document.createElement('div');
    d.className = 'log-line';
    d.innerHTML = `<span class="t">[DISK]</span> <span class="${cls}">${msg}</span>`;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function huecos() {
    const libres = [];
    let inicio = null;
    for (let i = 0; i < TOTAL_BLOQUES; i++) {
      if (!ocupados.includes(i) && !asignados.includes(i) && i !== indice) {
        if (inicio === null) inicio = i;
      } else {
        if (inicio !== null) {
          libres.push({ inicio, fin: i - 1, len: i - inicio });
          inicio = null;
        }
      }
    }
    if (inicio !== null) libres.push({ inicio, fin: TOTAL_BLOQUES - 1, len: TOTAL_BLOQUES - inicio });
    return libres;
  }

  function reset() {
    ocupados = [2, 3, 7, 8, 9, 13, 14, 18, 19, 20];
    asignados = [];
    indice = null;
    render();
    info.textContent = 'Disco reiniciado. El archivo "MI_FOTO.jpg" necesita 12 bloques. Elige una estrategia.';
    info.style.color = '';
    logEl.innerHTML = '';
    log('ok', 'Disco listo. 10 bloques ocupados, 14 libres. Necesitamos 12 bloques contiguos para la foto.');
  }

  document.getElementById('allocContigua').addEventListener('click', () => {
    reset();
    const h = huecos().filter(x => x.len >= 12)[0];
    if (h) {
      for (let i = h.inicio; i < h.inicio + 12; i++) asignados.push(i);
      render();
      info.innerHTML = `✅ Archivo guardado de forma <strong>contigua</strong> en bloques ${h.inicio}–${h.inicio + 11}. Lectura rápida, pero requiere hueco grande.`;
      info.style.color = 'var(--verde)';
      log('ok', `Contigua: bloques ${h.inicio}–${h.inicio + 11} asignados. Sin fragmentación externa en este caso.`);
    } else {
      info.innerHTML = '❌ No cabe contiguamente. Hay espacio libre total, pero partido en huecos pequeños: <strong>fragmentación externa</strong>.';
      info.style.color = 'var(--rosa)';
      log('err', 'Contigua: no hay 12 bloques seguidos libres. Fragmentación externa detectada.');
    }
    if (!xpDado.has('contigua')) { xpDado.add('contigua'); addXP(3); }
  });

  document.getElementById('allocEnlazada').addEventListener('click', () => {
    reset();
    let libres = [];
    for (let i = 0; i < TOTAL_BLOQUES; i++) {
      if (!ocupados.includes(i)) libres.push(i);
    }
    if (libres.length >= 12) {
      asignados = libres.slice(0, 12);
      render();
      info.innerHTML = `✅ Archivo guardado de forma <strong>enlazada</strong> en bloques dispersos: ${asignados.slice(0, 6).join(', ')}… Cada bloque apunta al siguiente. No hay fragmentación externa, pero la lectura es más lenta.`;
      info.style.color = 'var(--verde)';
      log('ok', `Enlazada: 12 bloques asignados dispersos. Cada uno guarda puntero al siguiente.`);
    } else {
      info.textContent = '❌ No hay suficientes bloques libres.';
      info.style.color = 'var(--rosa)';
    }
    if (!xpDado.has('enlazada')) { xpDado.add('enlazada'); addXP(3); }
  });

  document.getElementById('allocIndexada').addEventListener('click', () => {
    reset();
    let libres = [];
    for (let i = 0; i < TOTAL_BLOQUES; i++) {
      if (!ocupados.includes(i)) libres.push(i);
    }
    if (libres.length >= 13) {
      indice = libres[0];
      asignados = libres.slice(1, 13);
      render();
      info.innerHTML = `✅ Archivo guardado de forma <strong>indexada</strong>. Bloque índice ${indice} apunta a: ${asignados.join(', ')}. Dispersión permitida, pero lectura rápida consultando el índice.`;
      info.style.color = 'var(--verde)';
      log('ok', `Indexada: bloque índice ${indice} → bloques ${asignados.join(', ')}.`);
    } else {
      info.textContent = '❌ No hay suficientes bloques libres (se necesita 1 de índice + 12 de datos).';
      info.style.color = 'var(--rosa)';
    }
    if (!xpDado.has('indexada')) { xpDado.add('indexada'); addXP(3); }
  });

  document.getElementById('allocReset').addEventListener('click', reset);

  reset();
}

/* ---------- PARTICIONADOR (Módulo 4) ---------- */
function inicializarParticionador() {
  const DISK_TOTAL = 500;
  const segSystem = document.getElementById('partSystem');
  const segData = document.getElementById('partData');
  const segGames = document.getElementById('partGames');
  const segSwap = document.getElementById('partSwap');
  const status = document.getElementById('partStatus');
  if (!segSystem) return;

  const ranges = {
    system: document.getElementById('rangeSystem'),
    data: document.getElementById('rangeData'),
    games: document.getElementById('rangeGames'),
    swap: document.getElementById('rangeSwap')
  };
  const vals = {
    system: document.getElementById('valSystem'),
    data: document.getElementById('valData'),
    games: document.getElementById('valGames'),
    swap: document.getElementById('valSwap')
  };

  let sizes = { system: 200, data: 150, games: 100, swap: 50 };

  function update() {
    const total = sizes.system + sizes.data + sizes.games + sizes.swap;

    segSystem.style.flex = sizes.system;
    segData.style.flex = sizes.data;
    segGames.style.flex = sizes.games;
    segSwap.style.flex = sizes.swap;

    segSystem.querySelector('.ps-size').textContent = sizes.system + ' GB';
    segData.querySelector('.ps-size').textContent = sizes.data + ' GB';
    segGames.querySelector('.ps-size').textContent = sizes.games + ' GB';
    segSwap.querySelector('.ps-size').textContent = sizes.swap + ' GB';

    Object.keys(vals).forEach(k => vals[k].textContent = sizes[k] + ' GB');

    if (total === DISK_TOTAL) {
      status.innerHTML = `✅ Disco usado: ${total} GB / ${DISK_TOTAL} GB. Particiones balanceadas.`;
      status.style.color = 'var(--verde)';
    } else if (total < DISK_TOTAL) {
      status.innerHTML = `⚠️ Disco usado: ${total} GB / ${DISK_TOTAL} GB. Quedan ${DISK_TOTAL - total} GB sin asignar (espacio desaprovechado).`;
      status.style.color = 'var(--ambar)';
    } else {
      status.innerHTML = `❌ Disco usado: ${total} GB / ${DISK_TOTAL} GB. ¡Te pasaste por ${total - DISK_TOTAL} GB! Reduce alguna partición.`;
      status.style.color = 'var(--rosa)';
    }
  }

  function adjust(key, val) {
    // Simplificación: solo validamos el total, no auto-balanceamos para no sorprender al usuario
    sizes[key] = parseInt(val, 10);
    update();
  }

  Object.keys(ranges).forEach(k => {
    if (ranges[k]) {
      ranges[k].addEventListener('input', () => adjust(k, ranges[k].value));
    }
  });

  update();
}

/* ---------- FORMATEO USB (Módulo 5) ---------- */
function inicializarFormatoUsb() {
  const visual = document.getElementById('usbVisual');
  const info = document.getElementById('usbInfo');
  if (!visual || !info) return;

  const CELLS = 32;
  let cells = [];
  let wipeInterval = null;
  const xpDado = new Set(); // XP solo la primera vez por acción

  function detenerWipe() {
    if (wipeInterval) { clearInterval(wipeInterval); wipeInterval = null; }
  }

  function initUsb() {
    detenerWipe();
    cells = [];
    for (let i = 0; i < CELLS; i++) {
      cells.push(Math.random() < 0.35 ? 'archivo' : 'libre');
    }
    renderUsb();
    info.textContent = 'USB de 16 GB listo. Tiene archivos (azules) y espacio libre. Elige un tipo de formateo.';
    info.style.color = '';
  }

  function renderUsb() {
    visual.innerHTML = '';
    cells.forEach((state, i) => {
      const div = document.createElement('div');
      div.className = 'usb-cell ' + state;
      div.title = `Bloque ${i}: ${state}`;
      visual.appendChild(div);
    });
  }

  document.getElementById('fmtRapido').addEventListener('click', () => {
    detenerWipe();
    cells = cells.map(s => s === 'archivo' ? 'libre' : s);
    renderUsb();
    info.innerHTML = '⚡ <strong>Formato rápido (lógico)</strong>: se borró la tabla de archivos. Los datos aún podrían recuperarse con herramientas especiales.';
    info.style.color = 'var(--ambar)';
    if (!xpDado.has('rapido')) { xpDado.add('rapido'); addXP(2); }
  });

  document.getElementById('fmtCompleto').addEventListener('click', () => {
    detenerWipe();
    cells = cells.map(s => s === 'archivo' ? 'libre' : s);
    renderUsb();
    info.innerHTML = '🧹 <strong>Formato completo (lógico + verificación)</strong>: borra la tabla y verifica sectores. En algunos casos sobreescribe con ceros, pero no garantiza destrucción total.';
    info.style.color = 'var(--verde)';
    if (!xpDado.has('completo')) { xpDado.add('completo'); addXP(2); }
  });

  document.getElementById('fmtSeguro').addEventListener('click', () => {
    detenerWipe();
    let pasada = 0;
    wipeInterval = setInterval(() => {
      const clase = pasada % 2 === 0 ? 'seguro' : 'sobre';
      cells = cells.map(() => clase);
      renderUsb();
      pasada++;
      if (pasada >= 4) {
        clearInterval(wipeInterval);
        wipeInterval = null;
        cells = cells.map(() => 'libre');
        renderUsb();
        info.innerHTML = '🔒 <strong>Borrado seguro</strong>: los bloques fueron sobreescritos varias veces. La recuperación de datos es prácticamente imposible.';
        info.style.color = 'var(--cian)';
      }
    }, 300);
    if (!xpDado.has('seguro')) { xpDado.add('seguro'); addXP(3); }
  });

  document.getElementById('fmtReset').addEventListener('click', initUsb);

  initUsb();
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
      if (!dragSrc) return;
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
  1: { '1a': '1B', '1b': '1A', '1c': '1C', '1d': '1D' }
};
const TALLER_ORDER = { 2: ['2tipo', '2tabla', '2raiz', '2etiqueta', '2verificar'] };
const TALLER_INPUT = { 3: '3', '3b': '2' };
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
  if (chip.classList.contains('correct') || chip.classList.contains('paired-temp')) return;

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

    parejasMatch[id] = parejasMatch[id].filter(p => correctMap[p.left] === p.right);
    // Elimina parejas duplicadas (mismo concepto izquierdo registrado dos veces)
    const unicas = new Map();
    parejasMatch[id].forEach(p => unicas.set(p.left, p.right));
    parejasMatch[id] = [...unicas].map(([left, right]) => ({ left, right }));
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
    document.querySelectorAll(`.ws-input[data-ws="${id}"], .ws-input[data-ws="${id}b"]`).forEach(inp => {
      const key = inp.dataset.ws;
      const got = inp.value.trim().toLowerCase();
      const exp = (TALLER_INPUT[key] || '').toLowerCase();
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
      1: '¡Perfecto! Sistema de archivos=organiza archivos, Partición=región del disco, Formateo lógico=crea sistema de archivos, Indexada=usa bloque índice.',
      2: '¡Excelente! Orden: elegir tipo → escribir tabla vacía → crear raíz → poner etiqueta → verificar sectores.',
      3: '¡Muy bien! 10 KB / 4 KB = 2.5 → se necesitan 3 bloques; último bloque desperdicia 2 KB (12 - 10).',
      4: '🏆 ¡JEFE FINAL VENCIDO! Formatear no repara hardware ni bootloader; primero hay que diagnosticar y respaldar.'
    };
    const xpPorReto = { 1: 30, 2: 35, 3: 30, 4: 45 };
    fb.innerHTML = `✅ ${msgs[id]} <strong>+${xpPorReto[id]} XP</strong>`;
    if (!estado.talleres[id]) {
      estado.talleres[id] = true;
      addXP(xpPorReto[id]);
    }
    const retosTaller = ['1', '2', '3', '4'];
    if (retosTaller.every(r => estado.talleres[r])) {
      marcarCompletado(6);
      otorgarBadge('🛠️ Storage Master Completado');
    }
  } else {
    fb.className = 'resultado-ws visible no';
    const hints = {
      1: 'Pista: Sistema de archivos→organiza; Partición→región del disco; Formateo lógico→crea sistema de archivos; Indexada→bloque índice.',
      2: 'Pista: primero eliges el tipo de sistema de archivos, luego escribes la tabla vacía, creas el directorio raíz, pones etiqueta y, al final, verificas sectores.',
      3: 'Pista: 10 KB necesitan 3 bloques de 4 KB. En el último bloque sobran 2 KB.',
      4: 'Pista: formatear borra la tabla de archivos, no repara hardware ni errores de arranque. Lo primero es respaldar y diagnosticar.'
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
