/* ============================================================
   CLASE 1 — SISTEMAS OPERATIVOS (¿Qué es un SO?)
   Lógica de navegación, simuladores, quizzes y taller
============================================================ */

const TOTAL_MODULOS = 8; // 0..7 (incluye módulo de descanso)

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
  iniciarHeroAnimacion();
  inicializarSimuladorRestaurante();
  inicializarClasificadorCapas();
  inicializarTimeline();
  inicializarMatchDevice();
  inicializarTraceSim();
  configurarTeclado();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
const STORAGE_KEY = 'curso-so-que-es-sistema-operativo';

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
    1: '🧭 Navegador SO',
    2: '🧱 Capas Master',
    3: '📜 Historiador',
    4: '☕ Descansado',
    5: '🌳 Familia Experta',
    6: '🕵️ Rastreador de Peticiones',
    7: '🛠️ Kernel Master'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 SO Dominado');
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
  // Cuenta módulos completables: 1,2,3,5,6,7 (saltamos el 0 inicio y el 4 descanso)
  const completables = [1, 2, 3, 5, 6, 7];
  const total = completables.length;
  const completos = completables.filter(m => estado.completados.has(m)).length;
  const pct = Math.round((completos / total) * 100);

  const barra = document.getElementById('barra');
  if (barra) barra.style.width = pct + '%';

  const ptxt = document.getElementById('porcentaje');
  if (ptxt) ptxt.textContent = pct + '%';

  const mAct = document.getElementById('modulo-actual');
  if (mAct) {
    const labels = ['Inicio', '¿Qué es?', 'Capas', 'Historia', 'Descanso', 'Familias', 'Intermediario', 'Taller'];
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
  estado.quizzes[idQuiz] = { aciertos, total };

  if (aciertos === total && !quiz.dataset.recompensado) {
    quiz.dataset.recompensado = 'true';
    addXP(XP_POR_QUIZ_PERFECTO);
  }

  const res = quiz.querySelector('.resultado-quiz');
  if (res) {
    res.classList.add('visible');
    if (aciertos === total) {
      res.classList.add('exito');
      res.innerHTML = `🎉 ¡Perfecto! ${aciertos}/${total}. (+${XP_POR_QUIZ_PERFECTO} XP)`;
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

  opts.forEach(op => {
    op.addEventListener('click', () => {
      const correcta = op.dataset.tcorrecta;
      const elegida = op.dataset.top;
      opts.forEach(o => { o.disabled = true; if (o.dataset.top === correcta) o.classList.add('correcta'); });
      if (elegida === correcta) {
        result.className = 'trivia-result visible ok';
        result.textContent = '✅ ¡Correcto! Android está basado en Linux. iOS está basado en Unix (BSD). ¡Volvamos a la clase!';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Casi. La respuesta correcta: Android está basado en Linux. iOS, en Unix. ¡A seguir!';
      }
    });
  });
}

/* ---------- TALLER (matching + order + input) ---------- */
const TALLER_RESP = {
  1: { '1a': '1A', '1b': '1B', '1c': '1C' },     // SO/Kernel/Hardware
  3: { '3a': '3D', '3b': '3B', '3c': '3C', '3d': '3A' }, // Unix 1969, Linux 1991, iOS 2007, Mac 1984
  4: { '4A': '4A' } // el "matching" del jefe final tiene solo respuesta correcta
};
const TALLER_ORDER = { 2: ['2hw', '2kernel', '2so', '2apps', '2user'] };
const TALLER_INPUT = { 4: 'memoria' };
const TALLER_CORRECT_MATCH = { 4: '4A' }; // respuesta correcta del matching del reto 4

const seleccionMatch = {}; // {idReto: {left: mid, right: mid}}
const parejasMatch = {};   // {idReto: [{left, right}, ...]}

function configurarTaller() {
  // Matching blocks
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

  // Order block (reto 2): drag and drop + flechas
  configurarOrden(2);

  // Botones validar
  document.querySelectorAll('[data-check-ws]').forEach(btn => {
    btn.addEventListener('click', () => validarReto(btn.dataset.checkWs));
  });
}

function seleccionarMatchChip(id, chip, lado) {
  // Si ya está emparejado y correcto, no se puede cambiar
  if (chip.classList.contains('correct')) return;

  seleccionMatch[id][lado] = chip.dataset.mid;
  // marcar visualmente
  const block = chip.closest('.ws-block');
  block.querySelectorAll(`[data-role="${lado}"] .ws-chip`).forEach(c => c.classList.remove('selected'));
  chip.classList.add('selected');

  // si ambos lados seleccionados, formar pareja
  if (seleccionMatch[id].left && seleccionMatch[id].right) {
    parejasMatch[id].push({ left: seleccionMatch[id].left, right: seleccionMatch[id].right });
    // marcar temporalmente y limpiar selección
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
  let allOk = true;

  // Matching (retos 1, 3, 4)
  if (TALLER_RESP[id]) {
    const block = document.querySelector(`[data-ws-match="${id}"]`);
    const correctMap = TALLER_RESP[id];
    let aciertos = 0;
    parejasMatch[id].forEach(p => {
      const expectedRight = correctMap[p.left];
      const leftChip = block.querySelector(`[data-mid="${p.left}"]`);
      const rightChip = block.querySelector(`[data-mid="${p.right}"]`);
      // reset visual
      leftChip.classList.remove('correct', 'wrong', 'paired-temp');
      rightChip.classList.remove('correct', 'wrong', 'paired-temp');
      leftChip.style.opacity = '';
      rightChip.style.opacity = '';
      if (expectedRight === p.right) {
        leftChip.classList.add('correct');
        rightChip.classList.add('correct');
        aciertos++;
      } else {
        leftChip.classList.add('wrong');
        rightChip.classList.add('wrong');
        allOk = false;
      }
    });
    // si faltan parejas por formar
    const totalEsperado = Object.keys(correctMap).length;
    if (parejasMatch[id].length !== totalEsperado) allOk = false;
  }

  // Orden (reto 2)
  if (TALLER_ORDER[id]) {
    const cont = document.getElementById('wsOrder2');
    const items = cont.querySelectorAll('.ws-order-item');
    const expected = TALLER_ORDER[id];
    items.forEach((it, i) => {
      const oid = it.dataset.oid;
      it.classList.remove('correct', 'wrong');
      const num = it.querySelector('.ord-num');
      num.textContent = i + 1;
      if (oid === expected[i]) {
        it.classList.add('correct');
      } else {
        it.classList.add('wrong');
        allOk = false;
      }
    });
  }

  // Input (reto 4)
  if (TALLER_INPUT[id]) {
    const inputs = document.querySelectorAll(`.ws-input[data-ws="${id}"]`);
    inputs.forEach(inp => {
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

  fb.classList.add('visible');
  if (allOk) {
    fb.className = 'resultado-ws visible ok';
    const msgs = {
      1: '¡Perfecto! Has definido SO, kernel y hardware correctamente. El SO es el intermediario.',
      2: '¡Excelente! El orden correcto es: Hardware → Kernel → SO → Aplicaciones → Usuario.',
      3: '¡Muy bien! Unix (1969), Mac GUI (1984), Linux (1991), iOS (2007). La historia tiene sentido.',
      4: '🏆 ¡JEFE FINAL VENCIDO! El SO falló al repartir la RAM. Reiniciar funciona porque el SO empieza de cero y reparte CPU y RAM otra vez.'
    };
    const xpPorReto = { 1: 25, 2: 30, 3: 30, 4: 55 };
    fb.innerHTML = `✅ ${msgs[id]} <strong>+${xpPorReto[id]} XP</strong>`;
    if (!estado.talleres[id]) {
      estado.talleres[id] = true;
      addXP(xpPorReto[id]);
    }
    if (Object.keys(estado.talleres).length === 4) {
      otorgarBadge('🛠️ Kernel Master Completado');
    }
  } else {
    fb.className = 'resultado-ws visible no';
    const hints = {
      1: 'Pista: SO = intermediario; Kernel = corazón; Hardware = físico. Toca de nuevo las parejas.',
      2: 'Pista: el orden es de lo físico a lo humano: Hardware → Kernel → SO → Apps → Usuario.',
      3: 'Pista: Unix nació en 1969, Mac con GUI en 1984, Linux en 1991, iPhone en 2007.',
      4: 'Pista: lo que se agota con 12 apps abiertas es la MEMORIA (RAM). Reiniciar libera y reparte de nuevo.'
    };
    fb.innerHTML = `❌ Algunas respuestas son incorrectas. ${hints[id]}`;
  }

  guardarProgreso();
}

/* Ordenar por drag + flechas (reto 2) */
function configurarOrden(id) {
  const cont = document.getElementById('wsOrder2');
  if (!cont) return;
  const items = cont.querySelectorAll('.ws-order-item');
  let dragSrc = null;

  items.forEach(it => {
    it.addEventListener('dragstart', e => {
      dragSrc = it;
      it.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    it.addEventListener('dragend', () => {
      it.classList.remove('dragging');
      renumerarOrden();
    });
    it.addEventListener('dragover', e => {
      e.preventDefault();
      const after = getDragAfterElement(cont, e.clientY);
      if (after == null) cont.appendChild(dragSrc);
      else cont.insertBefore(dragSrc, after);
    });
  });

  // Flechas
  document.querySelectorAll('[data-ws-up]').forEach(btn => {
    btn.addEventListener('click', () => moverOrden(-1));
  });
  document.querySelectorAll('[data-ws-down]').forEach(btn => {
    btn.addEventListener('click', () => moverOrden(1));
  });
}

function getDragAfterElement(container, y) {
  const els = [...container.querySelectorAll('.ws-order-item:not(.dragging)')];
  return els.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: -Infinity }).element;
}

function moverOrden(dir) {
  const cont = document.getElementById('wsOrder2');
  const selected = cont.querySelector('.ws-order-item.selected');
  if (!selected) {
    // si no hay seleccionado, marca el primero
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
  renumerarOrden();
}

// click para seleccionar item
document.addEventListener('click', e => {
  const it = e.target.closest('.ws-order-item');
  if (it && it.closest('#wsOrder2')) {
    document.querySelectorAll('#wsOrder2 .ws-order-item').forEach(x => x.classList.remove('selected'));
    it.classList.add('selected');
    renumerarOrden();
  }
});

function renumerarOrden() {
  const cont = document.getElementById('wsOrder2');
  if (!cont) return;
  cont.querySelectorAll('.ws-order-item').forEach((it, i) => {
    it.querySelector('.ord-num').textContent = i + 1;
  });
}

/* ---------- HERO ANIMACIÓN ---------- */
function iniciarHeroAnimacion() {
  const term = document.querySelector('.hero-terminal .cursor');
  if (!term) return;
  // ya tiene animación CSS de blink; nada más que hacer
}

/* ---------- SIMULADOR RESTAURANTE (Módulo 1) ---------- */
function inicializarSimuladorRestaurante() {
  const mesasEl = document.getElementById('restMesas');
  if (!mesasEl) return;

  const TOTAL_MESAS = 8;
  let mesas = [];      // {estado: 'libre'|'ocupada', cliente}
  let colaPedidos = 0; // pedidos pendientes en cocina
  let facturado = 0;
  let servicios = 0;
  let clientes = 0;

  const mesasVal = document.getElementById('r-mesas-val');
  const memVal = document.getElementById('r-mem-val');
  const discoVal = document.getElementById('r-disco-val');
  const ioVal = document.getElementById('r-io-val');
  const cellMesas = document.getElementById('r-cell-mesas');
  const cellMem = document.getElementById('r-cell-mem');
  const cellDisco = document.getElementById('r-cell-disco');
  const cellIo = document.getElementById('r-cell-io');
  const clientesEl = document.getElementById('restClientes');
  const facturadoEl = document.getElementById('restFacturado');
  const logEl = document.getElementById('restLog');

  const init = () => {
    mesas = [];
    for (let i = 0; i < TOTAL_MESAS; i++) mesas.push({ estado: 'libre', cliente: null });
    colaPedidos = 0; facturado = 0; servicios = 0; clientes = 0;
    render();
    logEl.innerHTML = '<div class="log-line"><span class="t">[SO]</span> Restaurante abierto. Esperando clientes…</div>';
  };

  const render = () => {
    const ocupadas = mesas.filter(m => m.estado === 'ocupada').length;
    mesasEl.innerHTML = mesas.map((m, i) =>
      `<div class="mesa ${m.estado}">${m.estado === 'ocupada' ? '🍽️' : '🪑'}</div>`
    ).join('');
    mesasVal.textContent = `${ocupadas}/${TOTAL_MESAS}`;
    memVal.textContent = colaPedidos;
    discoVal.textContent = Math.round(facturado);
    ioVal.textContent = servicios;
    clientesEl.textContent = clientes;
    facturadoEl.textContent = '$' + Math.round(facturado);

    [cellMesas, cellMem, cellDisco, cellIo].forEach(c => {
      if (!c) return;
      c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash');
    });
  };

  const log = (cls, msg) => {
    const d = document.createElement('div');
    d.className = 'log-line';
    d.innerHTML = `<span class="t">[SO]</span> <span class="${cls}">${msg}</span>`;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
  };

  document.getElementById('restAdd').addEventListener('click', () => {
    const libre = mesas.findIndex(m => m.estado === 'libre');
    if (libre === -1) {
      log('err', '⚠ No hay mesas libres (CPU saturado). Cliente se va.');
      return;
    }
    mesas[libre] = { estado: 'ocupada', cliente: ++clientes };
    colaPedidos++;
    log('ok', `🚶 Cliente #${clientes} → mesa ${libre + 1}. Pedido en cocina (cola: ${colaPedidos}).`);
    render();
    addXP(2);
  });

  document.getElementById('restAtender').addEventListener('click', () => {
    if (colaPedidos === 0) {
      log('warn', '🍳 No hay pedidos pendientes.');
      return;
    }
    colaPedidos--;
    log('ok', `🍳 Cocina preparó un pedido. Pendientes: ${colaPedidos}.`);
    servicios++;
    render();
    addXP(3);
  });

  document.getElementById('restCobrar').addEventListener('click', () => {
    const ocup = mesas.findIndex(m => m.estado === 'ocupada');
    if (ocup === -1) {
      log('warn', '💵 No hay mesas ocupadas que cobrar.');
      return;
    }
    const cliente = mesas[ocup].cliente;
    mesas[ocup] = { estado: 'libre', cliente: null };
    facturado += 15 + Math.floor(Math.random() * 25);
    log('ok', `💵 Mesa ${ocup + 1} cobrada (cliente #${cliente}). Mesa liberada.`);
    servicios++;
    render();
    addXP(4);
  });

  document.getElementById('restReset').addEventListener('click', init);

  init();
}

/* ---------- CLASIFICADOR DE CAPAS (Módulo 2) ---------- */
function inicializarClasificadorCapas() {
  const bank = document.getElementById('itemBank');
  const wrap = document.getElementById('capasWrap');
  if (!bank || !wrap) return;

  const items = [
    { id: 'i1', label: '🖥️ Pantalla táctil', capa: 'hardware' },
    { id: 'i2', label: '⚙️ Chip de silicio', capa: 'hardware' },
    { id: 'i3', label: '🔩 Disco SSD', capa: 'hardware' },
    { id: 'i4', label: '🔬 Scheduler del kernel', capa: 'kernel' },
    { id: 'i5', label: '🐧 Servicios de archivos (Linux)', capa: 'so' },
    { id: 'i6', label: '🌐 Gestor de red WiFi', capa: 'so' },
    { id: 'i7', label: '💬 WhatsApp', capa: 'apps' },
    { id: 'i8', label: '🧑 Tú, que escribes', capa: 'user' }
  ];

  const feedback = document.getElementById('capasFeedback');
  const progress = document.getElementById('capasProgress');
  let colocados = {};

  const render = () => {
    bank.innerHTML = items.map(it =>
      `<div class="drag-item ${colocados[it.id] ? 'placed' : ''}" data-id="${it.id}" data-capa="${it.capa}" draggable="true">${colocados[it.id] ? '✓ ' : ''}${it.label}</div>`
    ).join('');

    wrap.querySelectorAll('.capa').forEach(capa => {
      const cid = capa.dataset.capa;
      const drops = capa.querySelector('[data-drops]');
      const colocadosAqui = Object.entries(colocados).filter(([_, c]) => c === cid);
      drops.innerHTML = colocadosAqui.map(([iid, c]) => {
        const it = items.find(x => x.id === iid);
        return `<span class="chip-layer">${it.label} <span class="x" data-remove="${iid}">✕</span></span>`;
      }).join('');
    });

    const ok = Object.keys(colocados).length;
    if (progress) progress.textContent = `${ok}/8 clasificados`;
    if (feedback) feedback.style.display = ok > 0 ? 'block' : 'none';
    bindDrag();
  };

  const bindDrag = () => {
    bank.querySelectorAll('.drag-item:not(.placed)').forEach(d => {
      d.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', d.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
      });
    });
    wrap.querySelectorAll('.capa').forEach(capa => {
      capa.addEventListener('dragover', e => {
        e.preventDefault();
        capa.classList.add('over');
      });
      capa.addEventListener('dragleave', () => capa.classList.remove('over'));
      capa.addEventListener('drop', e => {
        e.preventDefault();
        capa.classList.remove('over');
        const id = e.dataTransfer.getData('text/plain');
        const it = items.find(x => x.id === id);
        if (!it || colocados[id]) return;
        colocados[id] = capa.dataset.capa;
        render();
        addXP(1);
      });
    });
    wrap.querySelectorAll('.capa .x').forEach(x => {
      x.addEventListener('click', () => {
        const iid = x.dataset.remove;
        delete colocados[iid];
        render();
      });
    });
  };

  // Soporte táctil: click item → click capa
  let selected = null;
  bank.addEventListener('click', e => {
    const d = e.target.closest('.drag-item:not(.placed)');
    if (!d) return;
    selected = d.dataset.id;
    bank.querySelectorAll('.drag-item').forEach(x => x.style.borderColor = '');
    d.style.borderColor = 'var(--cian)';
  });
  wrap.addEventListener('click', e => {
    const capa = e.target.closest('.capa');
    if (!capa || !selected) return;
    const it = items.find(x => x.id === selected);
    if (!it || colocados[selected]) return;
    colocados[selected] = capa.dataset.capa;
    selected = null;
    render();
    addXP(1);
  });

  document.getElementById('capasReset').addEventListener('click', () => {
    colocados = {};
    render();
  });

  render();
}

/* ---------- LÍNEA DE TIEMPO (Módulo 3) ---------- */
function inicializarTimeline() {
  const items = document.querySelectorAll('.tl-item');
  if (!items.length) return;
  items.forEach(it => {
    it.addEventListener('click', () => {
      it.classList.toggle('expanded');
    });
  });
  // expandir el primero por defecto
  if (items[0]) items[0].classList.add('expanded');
}

/* ---------- MATCH DEVICE (Módulo 5) ---------- */
function inicializarMatchDevice() {
  const grid = document.getElementById('matchGrid');
  const optsEl = document.getElementById('matchOptions');
  const fb = document.getElementById('matchFeedback');
  const instr = document.getElementById('matchInstr');
  if (!grid || !optsEl) return;

  const devices = [
    { id: 'd1', icon: '📱', name: 'Celular', so: 'Android (Linux) / iOS (Unix)' },
    { id: 'd2', icon: '💻', name: 'Laptop', so: 'Windows / macOS / Linux' },
    { id: 'd3', icon: '📺', name: 'Smart TV', so: 'Android TV / Tizen (Linux)' },
    { id: 'd4', icon: '🚗', name: 'Auto moderno', so: 'Linux embebido' },
    { id: 'd5', icon: '⌚', name: 'Reloj inteligente', so: 'watchOS / Wear OS (Linux)' },
    { id: 'd6', icon: '🏦', name: 'Cajero automático', so: 'Windows embebido / Linux' }
  ];

  // opciones SO (sin repetir exactamente las del device para hacerlo retador)
  const opcionesSO = [
    { id: 'o1', label: 'Android / iOS' },
    { id: 'o2', label: 'Windows / macOS / Linux' },
    { id: 'o3', label: 'Android TV / Tizen (Linux)' },
    { id: 'o4', label: 'Linux embebido' },
    { id: 'o5', label: 'watchOS / Wear OS' },
    { id: 'o6', label: 'Windows embebido / Linux' }
  ];
  // mapeo correcto device -> opcion
  const correcto = { d1: 'o1', d2: 'o2', d3: 'o3', d4: 'o4', d5: 'o5', d6: 'o6' };

  let selectedDev = null;
  let aciertos = 0;

  const render = () => {
    grid.innerHTML = devices.map(d => {
      const matched = d.matched;
      return `<div class="match-device ${selectedDev === d.id ? 'selected' : ''} ${matched ? 'matched' : ''}" data-dev="${d.id}">
        <span class="d-icon">${d.icon}</span>
        <span class="d-name">${matched ? d.so : d.name}</span>
      </div>`;
    }).join('');
    optsEl.innerHTML = opcionesSO.map(o =>
      `<button class="match-opt ${o.used ? 'used' : ''}" data-opt="${o.id}">${o.label}</button>`
    ).join('');
    if (instr) instr.textContent = selectedDev
      ? `Dispositivo seleccionado: ${devices.find(d => d.id === selectedDev).name}. Ahora toca el SO correcto.`
      : 'Toca un dispositivo de la izquierda para seleccionarlo.';

    bind();
  };

  const bind = () => {
    grid.querySelectorAll('.match-device:not(.matched)').forEach(d => {
      d.addEventListener('click', () => {
        selectedDev = d.dataset.dev;
        render();
      });
    });
    optsEl.querySelectorAll('.match-opt:not(.used)').forEach(o => {
      o.addEventListener('click', () => {
        if (!selectedDev) return;
        const dev = devices.find(d => d.id === selectedDev);
        const opt = opcionesSO.find(x => x.id === o.dataset.opt);
        if (correcto[selectedDev] === opt.id) {
          dev.matched = true;
          opt.used = true;
          aciertos++;
          addXP(5);
          if (aciertos === devices.length) {
            fb.className = 'match-feedback visible ok';
            fb.textContent = '🏆 ¡Perfecto! 6/6 dispositivos emparejados. ¡Conoces las familias!';
          }
        } else {
          fb.className = 'match-feedback visible';
          fb.style.background = 'rgba(244, 63, 94, 0.12)';
          fb.style.color = 'var(--rosa)';
          fb.textContent = '❌ Ese SO no corresponde. Intenta otra vez.';
          setTimeout(() => fb.classList.remove('visible'), 1500);
        }
        selectedDev = null;
        render();
      });
    });
  };

  document.getElementById('matchReset').addEventListener('click', () => {
    devices.forEach(d => d.matched = false);
    opcionesSO.forEach(o => o.used = false);
    selectedDev = null; aciertos = 0;
    fb.classList.remove('visible');
    render();
  });

  render();
}

/* ---------- TRACE SIM (Módulo 6) ---------- */
function inicializarTraceSim() {
  const openBtn = document.getElementById('traceOpen');
  if (!openBtn) return;

  const layers = document.querySelectorAll('#traceLayers .trace-layer');
  const logEl = document.getElementById('traceLog');
  const stepEl = document.getElementById('traceStep');
  const latEl = document.getElementById('traceLatency');
  const appsEl = document.getElementById('traceApps');
  let running = false;
  let appsAbiertas = 0;

  const layerNames = ['Usuario', 'App', 'SO', 'Kernel', 'Hardware'];

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const clearActive = () => layers.forEach(l => l.classList.remove('active', 'done'));

  const traceLog = (cls, msg) => {
    const d = document.createElement('div');
    d.className = 'log-line';
    d.innerHTML = `<span class="t">[SO]</span> <span class="${cls}">${msg}</span>`;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
  };

  const runTrace = async (appName = 'app', keepLog = false) => {
    if (running) return;
    running = true;
    clearActive();
    if (!keepLog) logEl.innerHTML = '';
    const baseLatency = 8 + Math.floor(Math.random() * 6);
    latEl.textContent = '0';
    stepEl.textContent = 'Inicio';

    // Bajada: usuario → hardware
    for (let i = 0; i < layers.length; i++) {
      layers[i].classList.add('active');
      stepEl.textContent = layerNames[i];
      latEl.textContent = (i + 1) * baseLatency;
      traceLog(i === 0 ? 'ok' : 't', `${layerNames[i]}: ${[
        `tocas el ícono de ${appName}`,
        `${appName} pide al SO "ábrete"`,
        `SO recibe, verifica permisos`,
        `kernel traduce a órdenes de hardware`,
        `hardware asigna CPU/RAM/GPU, pinta píxeles`
      ][i]}`);
      await sleep(baseLatency * 30);
      layers[i].classList.remove('active');
      layers[i].classList.add('done');
    }

    // Subida (respuesta)
    traceLog('ok', `✓ ${appName} abierta. Latencia total: ${baseLatency * 5} ms`);
    appsAbiertas++;
    appsEl.textContent = appsAbiertas;
    stepEl.textContent = '✓ Hecho';
    clearActive();
    running = false;
    addXP(5);
  };

  openBtn.addEventListener('click', () => runTrace('WhatsApp'));

  document.getElementById('traceOpen3').addEventListener('click', async () => {
    if (running) return;
    logEl.innerHTML = '';
    traceLog('warn', '⚠ Abriendo 3 apps en secuencia rápida…');
    for (const app of ['Instagram', 'YouTube', 'Spotify']) {
      await runTrace(app, true);  // keepLog=true para no borrar el log anterior
      await new Promise(r => setTimeout(r, 200));
    }
    traceLog('ok', '🏁 3 apps abiertas. El SO repartió la CPU en turnitos. ¡Multitarea!');
    addXP(15);
  });

  document.getElementById('traceReset').addEventListener('click', () => {
    clearActive();
    logEl.innerHTML = '<div class="log-line"><span class="t">[SO]</span> Esperando petición…</div>';
    stepEl.textContent = '—';
    latEl.textContent = '0';
    appsAbiertas = 0;
    appsEl.textContent = '0';
  });
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