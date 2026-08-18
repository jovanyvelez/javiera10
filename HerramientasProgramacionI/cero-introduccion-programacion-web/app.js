/* ============================================================
   CLASE 1 — HERRAMIENTAS DE PROGRAMACIÓN I
   (Introducción a la programación web)
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
  inicializarCapasDemo();
  inicializarMatchHerramienta();
  inicializarTraceSim();
  configurarTeclado();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
const STORAGE_KEY = 'curso-introduccion-programacion-web';

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
    1: '🌐 Web Explorer',
    2: '🧱 Arquitecto Cliente-Servidor',
    3: '🧬 Maestro de Capas',
    4: '☕ Descansado',
    5: '🔧 Tool Smith',
    6: '🕵️ HTTP Detective',
    7: '🛠️ Web Master'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 Web Dominado');
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
    const labels = ['Inicio', '¿Qué es web?', 'Cliente/Servidor', 'Anatomía web', 'Descanso', 'Herramientas', 'HTTP en acción', 'Taller'];
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
        result.textContent = '✅ ¡Correcto! WWW = World Wide Web (Telaraña Mundial), inventada por Tim Berners-Lee en 1991. ¡Volvamos a la clase!';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Casi. La respuesta correcta: World Wide Web. ¡A seguir!';
      }
    });
  });
}

/* ---------- TALLER (matching + order + input) ---------- */
const TALLER_RESP = {
  1: { '1a': '1A', '1b': '1B', '1c': '1C' },     // Cliente/Servidor/HTTP
  3: { '3a': '3A', '3b': '3B', '3c': '3C', '3d': '3D' }, // VS Code/React/DevTools/Git
  4: { '4A': '4A' } // el "matching" del jefe final tiene solo respuesta correcta
};
const TALLER_ORDER = { 2: ['2hw', '2kernel', '2so', '2apps', '2user'] };
const TALLER_INPUT = { 4: 'encontro' };
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
      const got = inp.value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const exp = TALLER_INPUT[id].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
      1: '¡Perfecto! Has definido cliente, servidor y HTTP. La web es una conversación.',
      2: '¡Excelente! El orden correcto es: Hardware → Red/HTTP → Servidor → Cliente → Usuario.',
      3: '¡Muy bien! VS Code (editor), React (framework), DevTools (navegador), Git (versiones). El mapa mental del oficio.',
      4: '🏆 ¡JEFE FINAL VENCIDO! 404 = página no existe; 500 = error interno del servidor. ¡Entiendes el idioma de la web!'
    };
    const xpPorReto = { 1: 25, 2: 30, 3: 30, 4: 55 };
    fb.innerHTML = `✅ ${msgs[id]} <strong>+${xpPorReto[id]} XP</strong>`;
    if (!estado.talleres[id]) {
      estado.talleres[id] = true;
      addXP(xpPorReto[id]);
    }
    if (Object.keys(estado.talleres).length === 4) {
      otorgarBadge('🛠️ Web Master Completado');
    }
  } else {
    fb.className = 'resultado-ws visible no';
    const hints = {
      1: 'Pista: Cliente = navegador que pide; Servidor = programa que responde; HTTP = idioma. Toca de nuevo.',
      2: 'Pista: el orden es de lo físico a lo humano: Hardware → Red → Servidor → Cliente → Usuario.',
      3: 'Pista: VS Code=editor, React=framework, DevTools=navegador, Git=versiones.',
      4: 'Pista: la palabra es "encontró" (el servidor no encontró la página). Se acepta con o sin tilde. 404 vs 500: no existe vs error interno.'
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

/* ---------- SIMULADOR RESTAURANTE WEB (Módulo 1) ---------- */
function inicializarSimuladorRestaurante() {
  const mesasEl = document.getElementById('restMesas');
  if (!mesasEl) return;

  const TOTAL_MESAS = 8;
  let mesas = [];      // {estado: 'libre'|'ocupada', cliente}
  let colaPedidos = 0; // pedidos pendientes en el servidor
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
    logEl.innerHTML = '<div class="log-line"><span class="t">[WEB]</span> Servidor listo. Esperando peticiones…</div>';
  };

  const render = () => {
    const ocupadas = mesas.filter(m => m.estado === 'ocupada').length;
    mesasEl.innerHTML = mesas.map((m) =>
      `<div class="mesa ${m.estado}">${m.estado === 'ocupada' ? '🌐' : '🪑'}</div>`
    ).join('');
    mesasVal.textContent = `${ocupadas}/${TOTAL_MESAS}`;
    memVal.textContent = colaPedidos;
    discoVal.textContent = Math.round(facturado);
    ioVal.textContent = servicios;
    clientesEl.textContent = clientes;
    facturadoEl.textContent = Math.round(facturado) + 'KB';

    [cellMesas, cellMem, cellDisco, cellIo].forEach(c => {
      if (!c) return;
      c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash');
    });
  };

  const log = (cls, msg) => {
    const d = document.createElement('div');
    d.className = 'log-line';
    d.innerHTML = `<span class="t">[WEB]</span> <span class="${cls}">${msg}</span>`;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
  };

  document.getElementById('restAdd').addEventListener('click', () => {
    const libre = mesas.findIndex(m => m.estado === 'libre');
    if (libre === -1) {
      log('err', '⚠ No hay pestañas libres. Cierra una antes de abrir otra.');
      return;
    }
    mesas[libre] = { estado: 'ocupada', cliente: ++clientes };
    colaPedidos++;
    log('ok', `🚶 Página #${clientes} → pestaña ${libre + 1}. Petición al servidor (cola: ${colaPedidos}).`);
    render();
    addXP(2);
  });

  document.getElementById('restAtender').addEventListener('click', () => {
    if (colaPedidos === 0) {
      log('warn', '🍳 No hay peticiones pendientes.');
      return;
    }
    colaPedidos--;
    log('ok', `🍳 Servidor preparó HTML/CSS/JS. Pendientes: ${colaPedidos}.`);
    servicios++;
    render();
    addXP(3);
  });

  document.getElementById('restCobrar').addEventListener('click', () => {
    const ocup = mesas.findIndex(m => m.estado === 'ocupada');
    if (ocup === -1) {
      log('warn', '📥 No hay pestañas esperando respuesta.');
      return;
    }
    const cliente = mesas[ocup].cliente;
    mesas[ocup] = { estado: 'libre', cliente: null };
    facturado += 80 + Math.floor(Math.random() * 120);
    log('ok', `📥 Pestaña ${ocup + 1} recibió la página (cliente #${cliente}). Renderizando…`);
    servicios++;
    render();
    addXP(4);
  });

  document.getElementById('restReset').addEventListener('click', init);

  init();
}

/* ---------- CLASIFICADOR DE CAPAS WEB (Módulo 2) ---------- */
function inicializarClasificadorCapas() {
  const bank = document.getElementById('itemBank');
  const wrap = document.getElementById('capasWrap');
  if (!bank || !wrap) return;

  const items = [
    { id: 'i1', label: '⚡ Cable de fibra óptica', capa: 'hardware' },
    { id: 'i2', label: '🗄️ Servidor físico en datacenter', capa: 'hardware' },
    { id: 'i3', label: '📶 Tu router WiFi', capa: 'hardware' },
    { id: 'i4', label: '🔧 Protocolo HTTP/HTTPS', capa: 'kernel' },
    { id: 'i5', label: '🐧 Apache / Nginx (servidor web)', capa: 'so' },
    { id: 'i6', label: '🌍 Node.js (servidor en JS)', capa: 'so' },
    { id: 'i7', label: '🌐 Google Chrome', capa: 'apps' },
    { id: 'i8', label: '🧑 Tú, que escribes la URL', capa: 'user' }
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

/* ---------- SIMULADOR DE CAPAS HTML/CSS/JS (Módulo 3) ---------- */
function inicializarCapasDemo() {
  const demo = document.getElementById('capasDemo');
  if (!demo) return;

  const h1 = document.getElementById('demoH1');
  const p = document.getElementById('demoP');
  const btn = document.getElementById('demoBtn');
  const valHtml = document.getElementById('capa-html-val');
  const valCss = document.getElementById('capa-css-val');
  const valJs = document.getElementById('capa-js-val');
  const expl = document.getElementById('capasExplicacionTxt');

  if (!h1 || !p || !btn) return;

  let clics = 0;
  let htmlOn = true, cssOn = true, jsOn = true;

  // Estilos "con CSS" y "sin CSS"
  const estiloConCss = 'color: var(--morado-claro); font-size: 1.8rem; margin: 0 0 0.8rem; font-weight: 800;';
  const estiloSinCss = 'color: inherit; font-size: 1rem; margin: 0 2rem 0.5rem; font-weight: 400;';
  const pConCss = 'font-size: 0.95rem; color: var(--texto-suave); margin: 0 0 1rem;';
  const pSinCss = 'font-size: 0.85rem; color: inherit; margin: 0 2rem 0.5rem;';
  const btnConCss = 'background: linear-gradient(135deg, var(--morado), var(--cian)); color: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 20px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px rgba(168,85,247,0.4);';
  const btnSinCss = 'background: transparent; color: inherit; border: 1px solid #888; padding: 0.2rem 0.5rem; font-weight: 400; cursor: pointer;';

  const aplicarEstilo = () => {
    if (cssOn) {
      h1.style.cssText = estiloConCss;
      p.style.cssText = pConCss;
      btn.style.cssText = btnConCss;
    } else {
      h1.style.cssText = estiloSinCss;
      p.style.cssText = pSinCss;
      btn.style.cssText = btnSinCss;
    }
    // El display lo controla la capa HTML (toggleHtml), independiente del CSS
    const display = htmlOn ? '' : 'none';
    h1.style.display = display;
    p.style.display = display;
    btn.style.display = display;
  };

  const actualizarExplicacion = () => {
    let txt = '';
    if (htmlOn && cssOn && jsOn) txt = 'Las 3 capas activas. El botón cuenta clics (JS), todo se ve ordenado (CSS) y tiene estructura (HTML).';
    else if (htmlOn && cssOn && !jsOn) txt = 'HTML + CSS activos, JS OFF. La página se ve bonita pero el botón NO responde: el contador no sube.';
    else if (htmlOn && !cssOn && jsOn) txt = 'HTML + JS activos, CSS OFF. El botón sigue funcionando pero todo se ve plano y feo, sin colores ni márgenes.';
    else if (htmlOn && !cssOn && !jsOn) txt = 'Solo HTML. Hay estructura pero no estilo ni comportamiento. Documento de los 90.';
    else if (!htmlOn) txt = 'HTML OFF. Sin estructura no hay nada que ver: la página está vacía, sin contenido.';
    expl.textContent = txt;
  };

  // Botón contador (capa JS)
  btn.addEventListener('click', () => {
    if (!jsOn) return;
    clics++;
    btn.textContent = `🎉 Contar clics: ${clics}`;
    addXP(1);
  });

  document.getElementById('toggleHtml').addEventListener('click', () => {
    htmlOn = !htmlOn;
    valHtml.textContent = htmlOn ? 'ON' : 'OFF';
    document.getElementById('capa-html-cell').style.opacity = htmlOn ? '1' : '0.4';
    aplicarEstilo();  // aplica (o quita) display:none según htmlOn
    actualizarExplicacion();
  });

  document.getElementById('toggleCss').addEventListener('click', () => {
    cssOn = !cssOn;
    valCss.textContent = cssOn ? 'ON' : 'OFF';
    document.getElementById('capa-css-cell').style.opacity = cssOn ? '1' : '0.4';
    aplicarEstilo();
    actualizarExplicacion();
  });

  document.getElementById('toggleJs').addEventListener('click', () => {
    jsOn = !jsOn;
    valJs.textContent = jsOn ? 'ON' : 'OFF';
    document.getElementById('capa-js-cell').style.opacity = jsOn ? '1' : '0.4';
    if (!jsOn) {
      btn.textContent = '🎉 Contar clics: 0 (JS desactivado)';
      clics = 0;
    } else {
      btn.textContent = `🎉 Contar clics: ${clics}`;
    }
    actualizarExplicacion();
  });

  document.getElementById('demoReset').addEventListener('click', () => {
    htmlOn = cssOn = jsOn = true;
    clics = 0;
    valHtml.textContent = valCss.textContent = valJs.textContent = 'ON';
    document.getElementById('capa-html-cell').style.opacity = '1';
    document.getElementById('capa-css-cell').style.opacity = '1';
    document.getElementById('capa-js-cell').style.opacity = '1';
    btn.textContent = '🎉 Contar clics: 0';
    aplicarEstilo();
    actualizarExplicacion();
  });

  aplicarEstilo();
  actualizarExplicacion();
}

/* ---------- MATCH HERRAMIENTA (Módulo 5) ---------- */
function inicializarMatchHerramienta() {
  const grid = document.getElementById('matchGrid');
  const optsEl = document.getElementById('matchOptions');
  const fb = document.getElementById('matchFeedback');
  const instr = document.getElementById('matchInstr');
  if (!grid || !optsEl) return;

  const herramientas = [
    { id: 'd1', icon: '📝', name: 'VS Code', so: 'Editor de código' },
    { id: 'd2', icon: '🌐', name: 'Chrome', so: 'Navegador + DevTools' },
    { id: 'd3', icon: '⚛️', name: 'React', so: 'Framework / librería' },
    { id: 'd4', icon: '🔧', name: 'Git', so: 'Control de versiones' },
    { id: 'd5', icon: '🎨', name: 'Figma', so: 'Diseño visual' },
    { id: 'd6', icon: '📦', name: 'npm', so: 'Gestor de paquetes' }
  ];

  // opciones de familia (sin repetir exactamente las del device para hacerlo retador)
  const opcionesFamilia = [
    { id: 'o1', label: 'Editor de código' },
    { id: 'o2', label: 'Navegador + DevTools' },
    { id: 'o3', label: 'Framework / librería' },
    { id: 'o4', label: 'Control de versiones' },
    { id: 'o5', label: 'Diseño visual' },
    { id: 'o6', label: 'Gestor de paquetes' }
  ];
  // mapeo correcto herramienta -> familia
  const correcto = { d1: 'o1', d2: 'o2', d3: 'o3', d4: 'o4', d5: 'o5', d6: 'o6' };

  let selectedDev = null;
  let aciertos = 0;

  const render = () => {
    grid.innerHTML = herramientas.map(d => {
      const matched = d.matched;
      return `<div class="match-device ${selectedDev === d.id ? 'selected' : ''} ${matched ? 'matched' : ''}" data-dev="${d.id}">
        <span class="d-icon">${d.icon}</span>
        <span class="d-name">${matched ? d.so : d.name}</span>
      </div>`;
    }).join('');
    optsEl.innerHTML = opcionesFamilia.map(o =>
      `<button class="match-opt ${o.used ? 'used' : ''}" data-opt="${o.id}">${o.label}</button>`
    ).join('');
    if (instr) instr.textContent = selectedDev
      ? `Herramienta seleccionada: ${herramientas.find(d => d.id === selectedDev).name}. Ahora toca su familia.`
      : 'Toca una herramienta de la izquierda para seleccionarla.';

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
        const dev = herramientas.find(d => d.id === selectedDev);
        const opt = opcionesFamilia.find(x => x.id === o.dataset.opt);
        if (correcto[selectedDev] === opt.id) {
          dev.matched = true;
          opt.used = true;
          aciertos++;
          addXP(5);
          if (aciertos === herramientas.length) {
            fb.className = 'match-feedback visible ok';
            fb.textContent = '🏆 ¡Perfecto! 6/6 herramientas emparejadas. ¡Conoces la caja de herramientas!';
          }
        } else {
          fb.className = 'match-feedback visible';
          fb.style.background = 'rgba(244, 63, 94, 0.12)';
          fb.style.color = 'var(--rosa)';
          fb.textContent = '❌ Esa familia no corresponde. Intenta otra vez.';
          setTimeout(() => fb.classList.remove('visible'), 1500);
        }
        selectedDev = null;
        render();
      });
    });
  };

  document.getElementById('matchReset').addEventListener('click', () => {
    herramientas.forEach(d => d.matched = false);
    opcionesFamilia.forEach(o => o.used = false);
    selectedDev = null; aciertos = 0;
    fb.classList.remove('visible');
    render();
  });

  render();
}

/* ---------- TRACE SIM HTTP (Módulo 6) ---------- */
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

  const layerNames = ['Usuario', 'Navegador', 'DNS', 'TCP/Red', 'Servidor'];

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const clearActive = () => layers.forEach(l => l.classList.remove('active', 'done'));

  const traceLog = (cls, msg) => {
    const d = document.createElement('div');
    d.className = 'log-line';
    d.innerHTML = `<span class="t">[WEB]</span> <span class="${cls}">${msg}</span>`;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
  };

  const runTrace = async (sitio = 'pagina', keepLog = false) => {
    if (running) return;
    running = true;
    clearActive();
    if (!keepLog) logEl.innerHTML = '';
    const baseLatency = 8 + Math.floor(Math.random() * 6);
    latEl.textContent = '0';
    stepEl.textContent = 'Inicio';

    // Bajada: usuario → servidor
    for (let i = 0; i < layers.length; i++) {
      layers[i].classList.add('active');
      stepEl.textContent = layerNames[i];
      latEl.textContent = (i + 1) * baseLatency;
      traceLog(i === 0 ? 'ok' : 't', `${layerNames[i]}: ${[
        `escribes ${sitio} y presionas Enter`,
        `navegador construye la petición HTTP`,
        `DNS traduce "${sitio}" a una IP`,
        `TCP establece conexión con el servidor`,
        `servidor recibe, prepara el HTML y responde`
      ][i]}`);
      await sleep(baseLatency * 30);
      layers[i].classList.remove('active');
      layers[i].classList.add('done');
    }

    // Subida (respuesta)
    traceLog('ok', `✓ Página "${sitio}" recibida. Latencia total: ${baseLatency * 5} ms`);
    appsAbiertas++;
    appsEl.textContent = appsAbiertas;
    stepEl.textContent = '✓ Hecho';
    clearActive();
    running = false;
    addXP(5);
  };

  openBtn.addEventListener('click', () => runTrace('youtube.com'));

  document.getElementById('traceOpen3').addEventListener('click', async () => {
    if (running) return;
    logEl.innerHTML = '';
    traceLog('warn', '⚠ Abriendo 3 pestañas en secuencia rápida…');
    for (const sitio of ['instagram.com', 'wikipedia.org', 'colegio.edu']) {
      await runTrace(sitio, true);  // keepLog=true para no borrar el log anterior
      await new Promise(r => setTimeout(r, 200));
    }
    traceLog('ok', '🏁 3 pestañas abiertas. El navegador hizo las peticiones en paralelo. ¡Asincronía!');
    addXP(15);
  });

  document.getElementById('traceReset').addEventListener('click', () => {
    clearActive();
    logEl.innerHTML = '<div class="log-line"><span class="t">[WEB]</span> Esperando petición…</div>';
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
    background: 'linear-gradient(135deg, #22d3ee, #a855f7)',
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