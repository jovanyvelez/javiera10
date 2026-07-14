/* ============================================================
   CLASE 2 — SISTEMAS OPERATIVOS (Funciones y componentes)
   Lógica de navegación, simuladores, quizzes y taller
   Versión revisada: 9 módulos, drivers, diagnóstico técnico
============================================================ */

const TOTAL_MODULOS = 9; // 0..8 (incluye módulo de descanso)

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
  configurarDiagnostico();
  configurarTrivia();
  inicializarScheduler();
  inicializarMemMap();
  inicializarFsExplorer();
  inicializarPermMatrix();
  inicializarDevManager();
  inicializarClassMatrix();
  inicializarFeatureMatch();
  configurarTeclado();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
const STORAGE_KEY = 'curso-so-funciones-componentes';

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
  } catch (e) {}
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
  } catch (e) {}
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
    1: '⚙️ Planificador',
    2: '💾 Gestor de Memoria',
    3: '🗄️ Archivero',
    4: '☕ Descansado',
    5: '🔧 Maestro Drivers',
    6: '👤 Guardián de Permisos',
    7: '🏷️ Clasificador',
    8: '🛠️ Componentes Master'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 Componentes Dominado');
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
  // Completables: 1,2,3,5,6,7,8 (saltamos 0 inicio y 4 descanso)
  const completables = [1, 2, 3, 5, 6, 7, 8];
  const total = completables.length;
  const completos = completables.filter(m => estado.completados.has(m)).length;
  const pct = Math.round((completos / total) * 100);

  const barra = document.getElementById('barra');
  if (barra) barra.style.width = pct + '%';

  const ptxt = document.getElementById('porcentaje');
  if (ptxt) ptxt.textContent = pct + '%';

  const mAct = document.getElementById('modulo-actual');
  if (mAct) {
    const labels = ['Inicio', 'Procesos', 'Memoria', 'Archivos', 'Descanso', 'Drivers', 'Usuarios', 'Clasificación', 'Taller'];
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
        result.textContent = '✅ ¡Correcto! Android mata apps en segundo plano para ahorrar RAM y batería. ¡Volvamos!';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Casi. Android mata apps en segundo plano cuando la RAM se llena. ¡A seguir!';
      }
    });
  });
}

/* ---------- TALLER (matching + order) ---------- */
const TALLER_RESP = {
  1: { '1a': '1B', '1b': '1A', '1c': '1D', '1d': '1C' },
  3: { '3a': '3A', '3b': '3D', '3c': '3C', '3d': '3B' }
};
const TALLER_ORDER = { 2: ['2q', '2save', '2pick', '2load', '2run'] };

const seleccionMatch = {};
const parejasMatch = {};

function configurarTaller() {
  document.querySelectorAll('[data-ws-match]').forEach(block => {
    const id = block.dataset.wsMatch;
    if (id === '4') return; // el reto 4 es el diagnóstico, se maneja aparte
    parejasMatch[id] = [];
    seleccionMatch[id] = {};

    block.querySelectorAll('[data-role="left"] .ws-chip').forEach(chip => {
      chip.addEventListener('click', () => seleccionarMatchChip(id, chip, 'left'));
    });
    block.querySelectorAll('[data-role="right"] .ws-chip').forEach(chip => {
      chip.addEventListener('click', () => seleccionarMatchChip(id, chip, 'right'));
    });
  });

  configurarOrden(2);

  document.querySelectorAll('[data-check-ws]').forEach(btn => {
    if (btn.id === 'diagValidate') return; // el diagnóstico tiene su propio handler
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
  let allOk = true;

  if (TALLER_RESP[id]) {
    const block = document.querySelector(`[data-ws-match="${id}"]`);
    const correctMap = TALLER_RESP[id];
    parejasMatch[id].forEach(p => {
      const expectedRight = correctMap[p.left];
      const leftChip = block.querySelector(`[data-mid="${p.left}"]`);
      const rightChip = block.querySelector(`[data-mid="${p.right}"]`);
      leftChip.classList.remove('correct', 'wrong', 'paired-temp');
      rightChip.classList.remove('correct', 'wrong', 'paired-temp');
      leftChip.style.opacity = '';
      rightChip.style.opacity = '';
      if (expectedRight === p.right) {
        leftChip.classList.add('correct');
        rightChip.classList.add('correct');
      } else {
        leftChip.classList.add('wrong');
        rightChip.classList.add('wrong');
        allOk = false;
      }
    });
    const totalEsperado = Object.keys(correctMap).length;
    if (parejasMatch[id].length !== totalEsperado) allOk = false;
  }

  if (TALLER_ORDER[id]) {
    const cont = document.getElementById('wsOrder2');
    const items = cont.querySelectorAll('.ws-order-item');
    const expected = TALLER_ORDER[id];
    items.forEach((it, i) => {
      const oid = it.dataset.oid;
      it.classList.remove('correct', 'wrong');
      it.querySelector('.ord-num').textContent = i + 1;
      if (oid === expected[i]) it.classList.add('correct');
      else { it.classList.add('wrong'); allOk = false; }
    });
  }

  fb.classList.add('visible');
  if (allOk) {
    fb.className = 'resultado-ws visible ok';
    const msgs = {
      1: '¡Perfecto! Estados de proceso dominados: Listo (espera turno), Ejecución (usa CPU), Espera (pausado por I/O), Terminado (libera recursos).',
      2: '¡Excelente! El cambio de contexto: quantum agotado → guardar estado → sacar siguiente → cargar estado → ejecutar.',
      3: '¡Muy bien! Celular=mono/multi proceso; cajero antiguo y MS-DOS=mono/mono; servidor=multi/multi.'
    };
    const xpPorReto = { 1: 25, 2: 30, 3: 30 };
    fb.innerHTML = `✅ ${msgs[id]} <strong>+${xpPorReto[id]} XP</strong>`;
    if (!estado.talleres[id]) {
      estado.talleres[id] = true;
      addXP(xpPorReto[id]);
    }
  } else {
    fb.className = 'resultado-ws visible no';
    const hints = {
      1: 'Pista: Ejecución=usa CPU ahora; Listo=espera turno; Espera=pausado por I/O; Terminado=finalizó.',
      2: 'Pista: el orden es agotar quantum → guardar estado actual → sacar siguiente de la cola → cargar estado nuevo → ejecutar.',
      3: 'Pista: celular=mono/multi proceso; servidor=multi/multi; MS-DOS y cajero antiguo=mono/mono.'
    };
    fb.innerHTML = `❌ Algunas respuestas son incorrectas. ${hints[id]}`;
  }

  guardarProgreso();
}

/* Ordenar por drag + flechas */
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
    it.addEventListener('dragend', () => { it.classList.remove('dragging'); renumerarOrden(); });
    it.addEventListener('dragover', e => {
      e.preventDefault();
      const after = getDragAfterElement(cont, e.clientY);
      if (after == null) cont.appendChild(dragSrc);
      else cont.insertBefore(dragSrc, after);
    });
  });

  document.querySelectorAll('[data-ws-up]').forEach(btn => btn.addEventListener('click', () => moverOrden(-1)));
  document.querySelectorAll('[data-ws-down]').forEach(btn => btn.addEventListener('click', () => moverOrden(1)));
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

/* ---------- DIAGNÓSTICO TÉCNICO (Jefe Final) ---------- */
function configurarDiagnostico() {
  const validateBtn = document.getElementById('diagValidate');
  if (!validateBtn) return;

  let compSelected = null;
  const compOpts = document.querySelectorAll('#diagComp .ticket-opt');
  compOpts.forEach(o => {
    o.addEventListener('click', () => {
      compOpts.forEach(x => x.classList.remove('selected'));
      o.classList.add('selected');
      compSelected = o.dataset.dval;
    });
  });

  let actionsSelected = new Set();
  const actionOpts = document.querySelectorAll('#diagActions .ticket-opt');
  actionOpts.forEach(o => {
    o.addEventListener('click', () => {
      o.classList.toggle('selected');
      const v = o.dataset.aval;
      if (o.classList.contains('selected')) actionsSelected.add(v);
      else actionsSelected.delete(v);
    });
  });

  validateBtn.addEventListener('click', () => {
    const fb = document.getElementById('ws-fb-4');
    const correctComp = 'procesos';
    const correctActions = ['matar', 'driver'];

    let compOk = compSelected === correctComp;
    let actionsOk = actionsSelected.size === correctActions.length &&
                    correctActions.every(a => actionsSelected.has(a));
    const hasText = document.getElementById('diagText').value.trim().length >= 20;

    // Marcar visual
    compOpts.forEach(o => {
      o.classList.remove('correct', 'wrong');
      if (o.dataset.dval === correctComp) o.classList.add('correct');
      else if (o === [...compOpts].find(x => x.classList.contains('selected')) && o.dataset.dval !== correctComp) o.classList.add('wrong');
    });
    actionOpts.forEach(o => {
      o.classList.remove('correct', 'wrong');
      if (correctActions.includes(o.dataset.aval)) o.classList.add('correct');
      else if (o.classList.contains('selected') && !correctActions.includes(o.dataset.aval)) o.classList.add('wrong');
    });

    fb.classList.add('visible');
    const allOk = compOk && actionsOk && hasText;

    if (allOk) {
      fb.className = 'resultado-ws visible ok';
      fb.innerHTML = `🏆 ¡DIAGNÓSTICO PERFECTO! Identificaste la gestión de procesos como el problema, mataste el proceso anómalo, actualizaste el driver y descartaste formatear/comprar RAM (¡RAM al 40% no era el problema!). Tu ticket está listo para el cliente. <strong>+55 XP</strong>`;
      if (!estado.talleres['4']) {
        estado.talleres['4'] = true;
        addXP(55);
      }
      if (Object.keys(estado.talleres).length >= 4) {
        otorgarBadge('🛠️ Componentes Master Completado');
      }
    } else {
      fb.className = 'resultado-ws visible no';
      let hints = [];
      if (!compOk) hints.push('El problema NO es la RAM (está al 40%) ni el disco. Mira qué está al 99%.');
      if (!actionsOk) hints.push('Acciones correctas: matar el proceso + actualizar driver. Descarta formatear (excesivo) y comprar RAM (innecesario).');
      if (!hasText) hints.push('Redacta tu diagnóstico con al menos 20 caracteres explicando el "por qué".');
      fb.innerHTML = `❌ Revisa el diagnóstico. ${hints.join(' ')}`;
    }

    guardarProgreso();
  });
}

/* ---------- SIMULADOR: SCHEDULER (Módulo 1) ---------- */
function inicializarScheduler() {
  const readyEl = document.getElementById('schedReady');
  if (!readyEl) return;

  const QUANTUM = 2;
  let procs = [];
  let cycle = 0, ctxSwitches = 0, gantt = [];
  let autoTimer = null;

  const cpuProc = document.getElementById('schedCpuProc');
  const cpuName = document.getElementById('schedCpuName');
  const cpuQuantum = document.getElementById('schedQuantum');
  const doneEl = document.getElementById('schedDone');
  const cycleEl = document.getElementById('schedCycle');
  const ctxEl = document.getElementById('schedCtx');
  const ganttEl = document.getElementById('schedGantt');
  const ganttAxisEl = document.getElementById('schedGanttAxis');
  const autoBtn = document.getElementById('schedAuto');

  const colors = { P1: 'var(--cian)', P2: 'var(--verde)', P3: 'var(--morado)', P4: 'var(--ambar)', idle: 'var(--tarjeta-alt)' };

  const init = () => {
    procs = [
      { pid: 'P1', name: 'Navegador', burst: 4, state: 'ready', color: 'var(--cian)' },
      { pid: 'P2', name: 'Spotify', burst: 3, state: 'ready', color: 'var(--verde)' },
      { pid: 'P3', name: 'Word', burst: 5, state: 'ready', color: 'var(--morado)' }
    ];
    cycle = 0; ctxSwitches = 0; gantt = [];
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; autoBtn.textContent = '⏩ Auto (todo)'; }
    render();
  };

  const render = () => {
    readyEl.innerHTML = procs.filter(p => p.state === 'ready').map(p =>
      `<div class="sched-proc ready"><span class="pid">${p.pid}</span><span class="pname">${p.name}</span><span class="pticket">${p.burst} ciclos</span></div>`
    ).join('') || '<div style="color:var(--texto-suave);font-size:0.8rem;padding:0.5rem">Cola vacía</div>';

    doneEl.innerHTML = procs.filter(p => p.state === 'done').map(p =>
      `<div class="sched-proc done"><span class="pid">${p.pid}</span><span class="pname">${p.name}</span></div>`
    ).join('') || '<div style="color:var(--texto-suave);font-size:0.8rem;padding:0.5rem">Ninguno</div>';

    const r = procs.find(p => p.state === 'running');
    if (r) {
      cpuProc.textContent = `${r.pid} · ${r.name}`;
      cpuProc.className = 'sched-cpu-proc';
      cpuName.style.color = r.color;
      cpuQuantum.textContent = `quantum restante: ${QUANTUM - (cycle - r.startCycle) % QUANTUM}`;
    } else {
      cpuProc.textContent = 'idle';
      cpuProc.className = 'sched-cpu-proc sched-cpu-idle';
      cpuQuantum.textContent = '';
    }

    cycleEl.textContent = cycle;
    ctxEl.textContent = ctxSwitches;

    ganttEl.innerHTML = gantt.map(g => {
      const bg = g === 'idle' ? 'var(--tarjeta-alt)' : (colors[g] || 'var(--tarjeta-alt)');
      const fg = g === 'idle' ? 'var(--texto-suave)' : '#000';
      return `<div class="sched-gantt-cell ${g === 'idle' ? 'idle' : ''}" style="background:${bg};color:${fg}">${g}</div>`;
    }).join('') || '<div style="color:var(--texto-suave);font-size:0.8rem;padding:0.5rem">Presiona "Ejecutar un ciclo"</div>';

    ganttAxisEl.innerHTML = gantt.map((_, i) => `<span>${i}</span>`).join('');
  };

  const step = () => {
    if (!procs.find(p => p.state === 'running')) {
      const next = procs.find(p => p.state === 'ready');
      if (next) { next.state = 'running'; next.startCycle = cycle; if (cycle > 0) ctxSwitches++; }
    }

    const r = procs.find(p => p.state === 'running');
    if (!r) { gantt.push('idle'); cycle++; render(); return; }

    r.burst--; gantt.push(r.pid); cycle++;

    if (r.burst <= 0) { r.state = 'done'; ctxSwitches++; }
    else if ((cycle - r.startCycle) % QUANTUM === 0) { r.state = 'ready'; ctxSwitches++; }

    if (!procs.find(p => p.state === 'running')) {
      const next = procs.find(p => p.state === 'ready');
      if (next) { next.state = 'running'; next.startCycle = cycle; }
    }

    render();

    if (!procs.find(p => p.state !== 'done')) {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; autoBtn.textContent = '⏩ Auto (todo)'; }
      mostrarToast('🏁 ¡Todos los procesos terminaron!');
    }
  };

  document.getElementById('schedStep').addEventListener('click', () => { addXP(2); step(); });
  autoBtn.addEventListener('click', () => {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; autoBtn.textContent = '⏩ Auto (todo)'; }
    else {
      autoBtn.textContent = '⏸️ Pausar';
      autoTimer = setInterval(() => {
        if (!procs.find(p => p.state !== 'done')) {
          clearInterval(autoTimer); autoTimer = null; autoBtn.textContent = '⏩ Auto (todo)';
        } else step();
      }, 800);
    }
  });
  document.getElementById('schedReset').addEventListener('click', init);

  init();
}

/* ---------- SIMULADOR: MAPA DE MEMORIA (Módulo 2) ---------- */
function inicializarMemMap() {
  const grid = document.getElementById('memGrid');
  if (!grid) return;

  const TOTAL_FRAMES = 16;
  let frames = [];
  let swapSlots = [];

  const swapEl = document.getElementById('memSwap');

  const init = () => {
    frames = Array(TOTAL_FRAMES).fill(null).map((_, i) => ({ proc: null, frame: i }));
    swapSlots = [];
    render();
  };

  const render = () => {
    grid.innerHTML = frames.map(f =>
      `<div class="mem-frame ${f.proc ? 'alloc-' + f.proc : ''}" data-frame="${f.frame}">${f.proc ? f.proc : ''}</div>`
    ).join('');
    swapEl.innerHTML = swapSlots.length ? swapSlots.map(s => `<span class="swap-slot">${s.proc}</span>`).join('') : '<span style="color:var(--texto-suave);font-size:0.75rem">Swap vacío</span>';
  };

  const allocPages = (proc, count) => {
    for (let i = 0; i < count; i++) {
      const freeIdx = frames.findIndex(f => !f.proc);
      if (freeIdx === -1) {
        const occupied = frames.map((f, idx) => ({ ...f, idx })).filter(f => f.proc);
        if (occupied.length === 0) break;
        const victim = occupied[0];
        swapSlots.push({ proc: victim.proc });
        frames[victim.idx].proc = proc;
        setTimeout(() => {
          const el = grid.querySelector(`[data-frame="${victim.idx}"]`);
          if (el) { el.classList.add('swapped'); setTimeout(() => el.classList.remove('swapped'), 400); }
        }, 0);
      } else {
        frames[freeIdx].proc = proc;
        setTimeout(() => {
          const el = grid.querySelector(`[data-frame="${freeIdx}"]`);
          if (el) { el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 500); }
        }, 0);
      }
    }
    render();
  };

  document.getElementById('memLoad1').addEventListener('click', () => { allocPages('P1', 3); addXP(2); });
  document.getElementById('memLoad2').addEventListener('click', () => { allocPages('P2', 2); addXP(2); });
  document.getElementById('memLoad3').addEventListener('click', () => { allocPages('P3', 3); addXP(2); });
  document.getElementById('memLoad4').addEventListener('click', () => { allocPages('P4', 6); addXP(5); });
  document.getElementById('memFree').addEventListener('click', () => {
    frames.forEach(f => { if (f.proc === 'P1') f.proc = null; });
    render(); addXP(3);
  });
  document.getElementById('memReset').addEventListener('click', init);

  init();
}

/* ---------- SIMULADOR: EXPLORADOR DE ARCHIVOS (Módulo 3) ---------- */
function inicializarFsExplorer() {
  const treeEl = document.getElementById('fsTree');
  if (!treeEl) return;

  const fs = {
    name: '/', type: 'folder', children: [
      { name: 'home', type: 'folder', children: [
        { name: 'maria', type: 'folder', children: [
          { name: 'fotos', type: 'folder', children: [
            { name: 'playa.jpg', type: 'file', size: '2.4 MB' },
            { name: 'cumple.jpg', type: 'file', size: '3.1 MB' }
          ]},
          { name: 'documentos', type: 'folder', children: [
            { name: 'tareas.txt', type: 'file', size: '4 KB' },
            { name: 'notas.md', type: 'file', size: '12 KB' }
          ]},
          { name: 'musica.mp3', type: 'file', size: '5.2 MB' }
        ]}
      ]},
      { name: 'etc', type: 'folder', children: [
        { name: 'hosts', type: 'file', size: '1 KB' },
        { name: 'passwd', type: 'file', size: '2 KB' }
      ]},
      { name: 'bin', type: 'folder', children: [
        { name: 'ls', type: 'file', size: '136 KB' },
        { name: 'cp', type: 'file', size: '128 KB' }
      ]},
      { name: 'tmp', type: 'folder', children: [] }
    ]
  };

  let currentPath = [];

  const findNode = (path) => {
    let node = fs;
    for (const p of path) {
      if (!node.children) return null;
      node = node.children.find(c => c.name === p);
      if (!node) return null;
    }
    return node;
  };

  const render = () => {
    const renderNode = (node, path, depth) => {
      const icon = node.type === 'folder' ? '📁' : (node.name.endsWith('.jpg') ? '🖼️' : node.name.endsWith('.mp3') ? '🎵' : node.name.endsWith('.md') ? '📝' : '📄');
      const cls = `fs-node ${node.type}` + (JSON.stringify(currentPath) === JSON.stringify(path) ? ' selected' : '');
      let html = `<div class="${cls}" data-path='${JSON.stringify(path)}'><span class="ficon">${icon}</span><span>${node.name}</span></div>`;
      if (node.type === 'folder' && node.children && depth < 2) {
        html += '<div class="fs-children">';
        node.children.forEach(c => { html += renderNode(c, [...path, c.name], depth + 1); });
        html += '</div>';
      }
      return html;
    };
    treeEl.innerHTML = renderNode(fs, [], 0);

    const detail = document.getElementById('fsDetail');
    const sel = findNode(currentPath);
    if (!sel || currentPath.length === 0) {
      detail.innerHTML = '<h4>/</h4><p style="color:var(--texto-suave);">La raíz del sistema de archivos. Selecciona una carpeta o archivo.</p><div class="fs-path">/</div>';
    } else {
      const fullPath = '/' + currentPath.join('/');
      if (sel.type === 'folder') {
        const count = sel.children ? sel.children.length : 0;
        detail.innerHTML = `<h4>📁 ${sel.name}</h4>
          <div class="fs-row"><span class="k">Tipo</span><span class="v">carpeta</span></div>
          <div class="fs-row"><span class="k">Contenido</span><span class="v">${count} elementos</span></div>
          <div class="fs-path">${fullPath}/</div>`;
      } else {
        detail.innerHTML = `<h4>📄 ${sel.name}</h4>
          <div class="fs-row"><span class="k">Tipo</span><span class="v">archivo</span></div>
          <div class="fs-row"><span class="k">Tamaño</span><span class="v">${sel.size || '?'}</span></div>
          <div class="fs-path">${fullPath}</div>`;
      }
    }

    treeEl.querySelectorAll('.fs-node').forEach(n => {
      n.addEventListener('click', () => { currentPath = JSON.parse(n.dataset.path); render(); addXP(1); });
    });
  };

  document.getElementById('fsUp').addEventListener('click', () => { if (currentPath.length > 0) { currentPath.pop(); render(); } });
  document.getElementById('fsBack').addEventListener('click', () => { currentPath = []; render(); });
  document.getElementById('fsNewFolder').addEventListener('click', () => {
    const parent = currentPath.length === 0 ? fs : findNode(currentPath);
    if (parent && parent.type === 'folder') {
      parent.children.push({ name: 'nueva_' + (parent.children.length + 1), type: 'folder', children: [] });
      render(); addXP(2);
    }
  });
  document.getElementById('fsReset').addEventListener('click', () => { currentPath = []; render(); });

  render();
}

/* ---------- INTERACTIVO: MATRIZ DE PERMISOS (Módulo 6) ---------- */
function inicializarPermMatrix() {
  const table = document.getElementById('permTable');
  if (!table) return;

  const toggles = table.querySelectorAll('.perm-toggle');
  const result = document.getElementById('permResult');

  const render = () => {
    const perms = { owner: { r: false, w: false, x: false }, group: { r: false, w: false, x: false }, others: { r: false, w: false, x: false } };
    toggles.forEach(t => {
      const on = t.classList.contains('on') || t.classList.contains('on-r') || t.classList.contains('on-w') || t.classList.contains('on-x');
      perms[t.dataset.who][t.dataset.perm] = on;
    });

    const rwx = (w) => (perms[w].r ? 'r' : '-') + (perms[w].w ? 'w' : '-') + (perms[w].x ? 'x' : '-');
    const code = rwx('owner') + rwx('group') + rwx('others');

    let desc = `<div class="who">🔒 Permisos de "tareas.txt": <strong>${code}</strong></div>`;
    ['owner', 'group', 'others'].forEach(w => {
      const lbl = w === 'owner' ? '🧑 Dueño (María)' : w === 'group' ? '👥 Grupo (alumnos)' : '🌍 Otros';
      const can = [];
      if (perms[w].r) can.push('leer');
      if (perms[w].w) can.push('escribir');
      if (perms[w].x) can.push('ejecutar');
      const cls = perms[w].w ? 'rw' : (perms[w].r ? 'ro' : 'no');
      desc += `<div class="${cls}">${lbl}: ${can.length ? 'puede ' + can.join(', ') : 'no puede hacer nada'}</div>`;
    });
    result.innerHTML = desc;
  };

  toggles.forEach(t => {
    t.addEventListener('click', () => {
      const perm = t.dataset.perm;
      const isActive = t.classList.contains('on') || t.classList.contains('on-r') || t.classList.contains('on-w') || t.classList.contains('on-x');
      if (isActive) t.classList.remove('on', 'on-r', 'on-w', 'on-x');
      else t.classList.add('on-' + perm);
      render(); addXP(1);
    });
  });

  render();
}

/* ---------- SIMULADOR: ADMIN DE DISPOSITIVOS (Módulo 5) ---------- */
function inicializarDevManager() {
  const devList = document.getElementById('devList');
  if (!devList) return;

  const devices = [
    { id: 'd1', icon: '🖱️', name: 'Mouse Gamer RGB "PredatorX"', status: 'Función básica (mover cursor). Luces y botones extra NO.', warn: true, driver: 'dr_predatorx' },
    { id: 'd2', icon: '🖨️', name: 'Impresora HP LaserJet Pro', status: 'No responde. Sin driver.', warn: true, driver: 'dr_hp' },
    { id: 'd3', icon: '🎮', name: 'Control Xbox One USB', status: 'Vibración y gatillos analógicos no funcionan.', warn: true, driver: 'dr_xbox' },
    { id: 'd4', icon: '📷', name: 'Cámara web Logitech 4K', status: 'Video básico. Autoenfoque y micrófono NO.', warn: true, driver: 'dr_logitech' }
  ];

  const drivers = [
    { id: 'dr_predatorx', label: 'Driver PredatorX RGB' },
    { id: 'dr_hp', label: 'Driver HP LaserJet' },
    { id: 'dr_xbox', label: 'Driver Xbox Controller' },
    { id: 'dr_logitech', label: 'Driver Logitech 4K' }
  ];

  let selectedDev = null;
  let fixed = 0;
  const fb = document.getElementById('devFeedback');

  const render = () => {
    devList.innerHTML = devices.map(d => {
      const isFixed = d.fixed;
      return `<div class="dev-row ${d.warn ? 'warning' : ''} ${isFixed ? 'fixed' : ''} ${selectedDev === d.id ? 'selected' : ''}" data-dev="${d.id}">
        <span class="d-icon">${d.icon}</span>
        <div class="d-info">
          <div class="d-name">${d.name}</div>
          <div class="d-status ${isFixed ? 'ok' : 'warn'}">${isFixed ? '✓ Driver instalado — funciona al 100%' : '⚠ ' + d.status}</div>
        </div>
        <span class="d-triangle">⚠️</span>
      </div>`;
    }).join('');

    document.getElementById('driverChips').innerHTML = drivers.map(dr =>
      `<button class="driver-chip ${dr.used ? 'used' : ''}" data-driver="${dr.id}">${dr.label}</button>`
    ).join('');

    bind();
  };

  const bind = () => {
    devList.querySelectorAll('.dev-row:not(.fixed)').forEach(row => {
      row.addEventListener('click', () => {
        devList.querySelectorAll('.dev-row').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        selectedDev = row.dataset.dev;
        render();
      });
    });
    document.querySelectorAll('.driver-chip:not(.used)').forEach(chip => {
      chip.addEventListener('click', () => {
        if (!selectedDev) return;
        const dev = devices.find(d => d.id === selectedDev);
        const dr = drivers.find(x => x.id === chip.dataset.driver);
        if (dev.driver === dr.id) {
          dev.fixed = true;
          dr.used = true;
          fixed++;
          addXP(5);
          if (fixed === devices.length) {
            fb.className = 'dev-feedback visible ok';
            fb.textContent = '🏆 ¡Todos los dispositivos tienen su driver! Ahora las luces RGB prenden, la impresora responde y el control vibra.';
          }
        } else {
          const chipEl = chip;
          chipEl.classList.add('wrong');
          setTimeout(() => chipEl.classList.remove('wrong'), 600);
          fb.className = 'dev-feedback visible no';
          fb.textContent = '❌ Ese driver no corresponde a este dispositivo. Lee el nombre del dispositivo.';
          setTimeout(() => fb.classList.remove('visible'), 1800);
        }
        selectedDev = null;
        render();
      });
    });
  };

  document.getElementById('devReset').addEventListener('click', () => {
    devices.forEach(d => d.fixed = false);
    drivers.forEach(dr => dr.used = false);
    selectedDev = null; fixed = 0;
    fb.classList.remove('visible');
    render();
  });

  render();
}

/* ---------- INTERACTIVO: CLASIFICACIÓN 2x2 (Módulo 7) ---------- */
function inicializarClassMatrix() {
  const bank = document.getElementById('classBank');
  const matrix = document.getElementById('classMatrix');
  if (!bank || !matrix) return;

  const items = [
    { id: 'i1', label: '💾 MS-DOS', cell: 'mm' },
    { id: 'i2', label: '🏦 Cajero antiguo', cell: 'mm' },
    { id: 'i3', label: '📱 Tu celular', cell: 'mM' },
    { id: 'i4', label: '💻 PC con Windows', cell: 'mM' },
    { id: 'i5', label: '🖥️ Servidor Linux', cell: 'MM' },
    { id: 'i6', label: '☁️ Servidor en la nube', cell: 'MM' },
    { id: 'i7', label: '⌨️ Terminal de los 70', cell: 'Mm' },
    { id: 'i8', label: '📅 Sistema de reservas antiguo', cell: 'Mm' }
  ];

  let colocados = {};

  const render = () => {
    bank.innerHTML = items.map(it =>
      `<div class="class-item ${colocados[it.id] ? 'placed' : ''}" data-id="${it.id}" data-cell="${it.cell}" draggable="true">${colocados[it.id] ? '✓ ' : ''}${it.label}</div>`
    ).join('');

    matrix.querySelectorAll('.class-cell').forEach(cell => {
      const cid = cell.dataset.cell;
      const itemsHere = Object.entries(colocados).filter(([_, c]) => c === cid);
      cell.querySelector('.cell-items').innerHTML = itemsHere.map(([iid]) => {
        const it = items.find(x => x.id === iid);
        return `<span class="chip">${it.label} <span class="x" data-remove="${iid}">✕</span></span>`;
      }).join('');
    });

    bind();
  };

  const bind = () => {
    bank.querySelectorAll('.class-item:not(.placed)').forEach(d => {
      d.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', d.dataset.id); e.dataTransfer.effectAllowed = 'move'; });
    });
    matrix.querySelectorAll('.class-cell').forEach(cell => {
      cell.addEventListener('dragover', e => { e.preventDefault(); cell.classList.add('over'); });
      cell.addEventListener('dragleave', () => cell.classList.remove('over'));
      cell.addEventListener('drop', e => {
        e.preventDefault();
        cell.classList.remove('over');
        const id = e.dataTransfer.getData('text/plain');
        const it = items.find(x => x.id === id);
        if (!it || colocados[id]) return;
        colocados[id] = cell.dataset.cell;
        if (it.cell === cell.dataset.cell) cell.classList.add('correcta');
        render(); addXP(1);
      });
    });
    matrix.querySelectorAll('.x').forEach(x => {
      x.addEventListener('click', () => { delete colocados[x.dataset.remove]; render(); });
    });
  };

  let selected = null;
  bank.addEventListener('click', e => {
    const d = e.target.closest('.class-item:not(.placed)');
    if (!d) return;
    selected = d.dataset.id;
    bank.querySelectorAll('.class-item').forEach(x => x.style.borderColor = '');
    d.style.borderColor = 'var(--cian)';
  });
  matrix.addEventListener('click', e => {
    const cell = e.target.closest('.class-cell');
    if (!cell || !selected) return;
    const it = items.find(x => x.id === selected);
    if (!it || colocados[selected]) return;
    colocados[selected] = cell.dataset.cell;
    if (it.cell === cell.dataset.cell) cell.classList.add('correcta');
    selected = null;
    render(); addXP(1);
  });

  document.getElementById('classReset').addEventListener('click', () => {
    colocados = {};
    matrix.querySelectorAll('.class-cell').forEach(c => c.classList.remove('correcta'));
    render();
  });

  render();
}

/* ---------- INTERACTIVO: FEATURE MATCH (Módulo 7) ---------- */
function inicializarFeatureMatch() {
  const listEl = document.getElementById('featureList');
  const targetsEl = document.getElementById('featureTargets');
  const fb = document.getElementById('featureFeedback');
  const instr = document.getElementById('featureInstr');
  if (!listEl || !targetsEl) return;

  const features = [
    { id: 'f1', label: 'Sistema de archivos NTFS', so: 'win' },
    { id: 'f2', label: 'Desciende de Unix (kernel Linux)', so: 'lin' },
    { id: 'f3', label: 'Cada app es su propio usuario', so: 'and' },
    { id: 'f4', label: 'Licencia privativa (paga)', so: 'win' },
    { id: 'f5', label: 'Mata apps en segundo plano al llenar RAM', so: 'and' },
    { id: 'f6', label: 'Comandos ls, cd, cat en terminal', so: 'lin' }
  ];
  const targets = [
    { id: 'win', icon: '🪟', name: 'Windows' },
    { id: 'lin', icon: '🐧', name: 'Linux' },
    { id: 'and', icon: '📱', name: 'Android' }
  ];

  let selected = null;
  let aciertos = 0;

  const render = () => {
    listEl.innerHTML = features.map(f =>
      `<button class="feature-chip ${f.matched ? 'used' : ''} ${selected === f.id ? 'selected' : ''}" data-fid="${f.id}">${f.label}</button>`
    ).join('');
    targetsEl.innerHTML = targets.map(t =>
      `<div class="feature-target ${t.id} ${features.some(f => f.so === t.id && f.matched) ? 'matched' : ''}" data-tid="${t.id}"><span class="t-icon">${t.icon}</span><span class="t-name">${t.name}</span></div>`
    ).join('');
    if (instr) instr.textContent = selected ? `Característica seleccionada. Toca el SO al que pertenece.` : 'Toca una característica para seleccionarla.';
    bind();
  };

  const bind = () => {
    listEl.querySelectorAll('.feature-chip:not(.used)').forEach(c => {
      c.addEventListener('click', () => { selected = c.dataset.fid; render(); });
    });
    targetsEl.querySelectorAll('.feature-target:not(.matched)').forEach(t => {
      t.addEventListener('click', () => {
        if (!selected) return;
        const f = features.find(x => x.id === selected);
        if (f.so === t.dataset.tid) {
          f.matched = true;
          aciertos++;
          addXP(5);
          if (aciertos === features.length) {
            fb.className = 'feature-feedback visible ok';
            fb.textContent = '🏆 ¡Perfecto! 6/6 características emparejadas.';
          }
        } else {
          const chip = listEl.querySelector(`[data-fid="${selected}"]`);
          chip.classList.add('wrong');
          setTimeout(() => chip.classList.remove('wrong'), 600);
          fb.className = 'feature-feedback visible';
          fb.style.background = 'rgba(244, 63, 94, 0.12)';
          fb.style.color = 'var(--rosa)';
          fb.textContent = '❌ Esa característica no pertenece a ese SO. Intenta otra.';
          setTimeout(() => fb.classList.remove('visible'), 1500);
        }
        selected = null;
        render();
      });
    });
  };

  document.getElementById('featureReset').addEventListener('click', () => {
    features.forEach(f => f.matched = false);
    selected = null; aciertos = 0;
    fb.classList.remove('visible');
    render();
  });

  render();
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
    position: 'fixed', bottom: '30px', right: '30px',
    background: 'linear-gradient(135deg, #22d3ee, #00ff9d)',
    color: '#000', padding: '0.9rem 1.4rem', borderRadius: '30px',
    fontWeight: '700', boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
    zIndex: '1000', transition: 'all 0.4s ease',
    opacity: '0', transform: 'translateY(20px)',
    maxWidth: '90%', fontSize: '0.92rem'
  });
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}