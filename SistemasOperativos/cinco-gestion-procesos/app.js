/* ============================================================
   CLASE 5 — SISTEMAS OPERATIVOS (Gestión de procesos)
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
  inicializarStatesGrid();
  inicializarProcSim();
  inicializarAlgosGrid();
  inicializarScheduler();
  inicializarIpcGrid();
  inicializarPipeSim();
  configurarTeclado();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
const STORAGE_KEY = 'curso-so-gestion-procesos';

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
    1: '🧩 Proceso Experto',
    2: '🔄 Ciclo Maestro',
    3: '☕ Descansado',
    4: '📅 Scheduler',
    5: '💬 IPC Master',
    6: '🛠️ Process Master'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 Procesos Dominados');
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
    const labels = ['Inicio', '¿Proceso?', 'Ciclo de vida', 'Descanso', 'Planificación', 'Comunicación', 'Taller'];
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
        result.textContent = '✅ ¡Correcto! Un zombi es un hijo que terminó pero el padre no recogió su estado. ¡Volvamos a la clase!';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Casi. La respuesta correcta: un hijo que terminó pero el padre no recogió su estado de salida. ¡A seguir!';
      }
    });
  });
}

/* ---------- FEATURES GRID (Módulo 1) ---------- */
function inicializarFeaturesGrid() {
  const grid = document.getElementById('featuresGrid');
  if (!grid) return;

  const features = [
    { icon: '💾', title: 'Ubicación', short: 'Programa: en disco. Proceso: en RAM.', long: 'El programa es un archivo inerte que descargaste o instalaste, vive en el disco duro. El proceso es ese programa cargado en la memoria RAM, activo, consumiendo recursos. Si cierras el proceso, el programa sigue en el disco.' },
    { icon: '🆔', title: 'Identidad', short: 'Programa: sin PID. Proceso: con PID único.', long: 'Cada proceso recibe un PID (Process ID) único al crearse. El programa, como archivo, no tiene PID. Puedes tener 5 procesos del mismo programa (ej. 5 ventanas del navegador), cada uno con su propio PID distinto.' },
    { icon: '⚡', title: 'Vida', short: 'Programa: estático. Proceso: dinámico.', long: 'El programa no cambia mientras no se ejecute: son instrucciones fijas. El proceso cambia todo el tiempo: sus variables se modifican, su estado avanza, consume CPU y memoria. El proceso es el programa "vivo".' },
    { icon: '⏱️', title: 'Duración', short: 'Programa: hasta que lo borres. Proceso: hasta que termine.', long: 'Un programa puede quedarse años en el disco sin usarse. Un proceso dura desde que el SO lo crea hasta que termina (exit) o lo matas. Cuando apagas el PC, todos los procesos mueren pero los programas siguen en disco.' },
    { icon: '🧬', title: 'Recursos', short: 'Programa: solo disco. Proceso: CPU + RAM + I/O.', long: 'El programa solo ocupa espacio en disco. El proceso, en cambio, consume CPU (ticks de procesador), RAM (su memoria privada), archivos abiertos, conexiones de red y dispositivos. El SO le asigna y vigila todos esos recursos.' }
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

/* ---------- STATES GRID (Módulo 2) ---------- */
function inicializarStatesGrid() {
  const grid = document.getElementById('statesGrid');
  if (!grid) return;

  const states = [
    { icon: '🐣', title: 'Nuevo', short: 'Recién creado, esperando admisión.', long: 'El proceso acaba de ser creado (con fork/exec). El SO lo está admitiendo en el sistema: le asigna un PID y construye su PCB. Aún no compite por la CPU.' },
    { icon: '⏳', title: 'Listo', short: 'En cola, esperando su turno de CPU.', long: 'El proceso está admitido y esperando que el scheduler le asigne la CPU. Hay una cola de listos: todos quieren la CPU pero solo uno la recibe a la vez.' },
    { icon: '⚡', title: 'En ejecución', short: 'Tiene la CPU, sus instrucciones corren.', long: 'El proceso tiene la CPU: sus instrucciones se están ejecutando. En una CPU de 1 núcleo solo hay uno en este estado a la vez. En una de N núcleos pueden haber N procesos en ejecución simultáneos.' },
    { icon: '💤', title: 'Bloqueado', short: 'Espera un recurso (I/O, teclado, red).', long: 'El proceso pidió algo que no es CPU: leer un archivo, esperar el teclado, recibir datos de la red. Mientras espera, no consume CPU. Vuelve a "Listo" cuando el recurso llega.' },
    { icon: '✅', title: 'Terminado', short: 'Finalizó: libera memoria y PCB.', long: 'El proceso llamó a exit() o fue terminado. El SO libera su memoria, cierra sus archivos y recoge su PCB. Si el padre no recoge el estado de salida, el proceso queda como zombi temporalmente.' }
  ];

  grid.innerHTML = states.map((s, i) =>
    `<div class="state-card" data-sidx="${i}">
      <span class="s-icon">${s.icon}</span>
      <div class="s-title">${s.title}</div>
      <p class="s-short">${s.short}</p>
      <div class="s-long">${s.long}</div>
    </div>`
  ).join('');

  grid.querySelectorAll('.state-card').forEach(card => {
    card.addEventListener('click', () => {
      const isOpen = card.classList.contains('expanded');
      grid.querySelectorAll('.state-card').forEach(c => c.classList.remove('expanded'));
      if (!isOpen) {
        card.classList.add('expanded');
        addXP(2);
      }
    });
  });
}

/* ---------- PROC SIM (Módulo 2) ---------- */
function inicializarProcSim() {
  const createBtn = document.getElementById('procCreate');
  if (!createBtn) return;

  const lanes = document.querySelectorAll('#stateLanes .state-lane');
  const logEl = document.getElementById('procLog');
  const pidEl = document.getElementById('procPid');
  const stateEl = document.getElementById('procState');
  const ticksEl = document.getElementById('procTicks');
  const runBtn = document.getElementById('procRun');
  const preemptBtn = document.getElementById('procPreempt');
  const blockBtn = document.getElementById('procBlock');
  const wakeBtn = document.getElementById('procWake');
  const killBtn = document.getElementById('procKill');
  const resetBtn = document.getElementById('procReset');

  let proc = null;
  let pidCounter = 100;
  let tickInterval = null;
  let killTimeout = null;

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const clearLanes = () => lanes.forEach(l => l.classList.remove('active', 'done'));

  const procLog = (cls, msg) => {
    const d = document.createElement('div');
    d.className = 'log-line';
    d.innerHTML = `<span class="t">[PROC]</span> <span class="${cls}">${msg}</span>`;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
  };

  const highlightLane = (state) => {
    clearLanes();
    const lane = document.querySelector(`.state-lane[data-state="${state}"]`);
    if (lane) lane.classList.add('active');
  };

  const updateBtns = () => {
    const s = proc ? proc.state : 'none';
    runBtn.disabled = !(s === 'listo');
    preemptBtn.disabled = !(s === 'ejecucion');
    blockBtn.disabled = !(s === 'ejecucion');
    wakeBtn.disabled = !(s === 'bloqueado');
    killBtn.disabled = !(s === 'ejecucion' || s === 'listo' || s === 'bloqueado');
  };

  const setState = (newState) => {
    if (!proc) return;
    proc.state = newState;
    const labels = {
      nuevo: 'Nuevo',
      listo: 'Listo',
      ejecucion: 'En ejecución',
      bloqueado: 'Bloqueado',
      terminado: 'Terminado'
    };
    stateEl.textContent = labels[newState] || newState;
    highlightLane(newState);
    updateBtns();
  };

  const stopTicker = () => {
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
  };

  const startTicker = () => {
    stopTicker();
    tickInterval = setInterval(() => {
      if (proc && proc.state === 'ejecucion') {
        proc.ticks++;
        ticksEl.textContent = proc.ticks;
      }
    }, 500);
  };

  createBtn.addEventListener('click', async () => {
    if (proc) return;
    if (killTimeout) { clearTimeout(killTimeout); killTimeout = null; }
    pidCounter++;
    proc = { pid: pidCounter, state: 'nuevo', ticks: 0 };
    pidEl.textContent = proc.pid;
    stateEl.textContent = 'Nuevo';
    ticksEl.textContent = '0';
    setState('nuevo');
    procLog('ok', `🐣 fork(): proceso creado con PID ${proc.pid}. Estado: Nuevo.`);

    await sleep(600);
    if (!proc || proc.state !== 'nuevo') return;
    setState('listo');
    procLog('t', `⏳ Admitido en la cola de listos. Esperando CPU.`);
    startTicker();
  });

  runBtn.addEventListener('click', () => {
    if (!proc || proc.state !== 'listo') return;
    setState('ejecucion');
    procLog('ok', `⚡ dispatch(): el scheduler le asignó la CPU. ¡Corriendo!`);
    startTicker();
  });

  preemptBtn.addEventListener('click', () => {
    if (!proc || proc.state !== 'ejecucion') return;
    stopTicker();
    setState('listo');
    procLog('warn', `⏱️ Timer: se agotó el quantum. El proceso vuelve a Listo sin terminar. CPU libre para otro.`);
  });

  blockBtn.addEventListener('click', () => {
    if (!proc || proc.state !== 'ejecucion') return;
    stopTicker();
    setState('bloqueado');
    procLog('warn', `💤 El proceso pidió I/O (lectura de disco). Pasa a Bloqueado. CPU libre para otro.`);
  });

  wakeBtn.addEventListener('click', () => {
    if (!proc || proc.state !== 'bloqueado') return;
    setState('listo');
    procLog('ok', `⏰ La I/O terminó. El proceso vuelve a Listo (espera su turno).`);
  });

  killBtn.addEventListener('click', () => {
    if (!proc) return;
    stopTicker();
    setState('terminado');
    procLog('err', `💀 exit(): proceso ${proc.pid} terminado tras ${proc.ticks} ticks de CPU. Recursos liberados.`);
    proc = null;
    if (killTimeout) clearTimeout(killTimeout);
    killTimeout = setTimeout(() => {
      killTimeout = null;
      pidEl.textContent = '—';
      stateEl.textContent = '—';
      ticksEl.textContent = '0';
      clearLanes();
      updateBtns();
    }, 1500);
  });

  resetBtn.addEventListener('click', () => {
    stopTicker();
    if (killTimeout) { clearTimeout(killTimeout); killTimeout = null; }
    proc = null;
    pidEl.textContent = '—';
    stateEl.textContent = '—';
    ticksEl.textContent = '0';
    clearLanes();
    updateBtns();
    logEl.innerHTML = '<div class="log-line"><span class="t">[PROC]</span> Esperando que crees un proceso…</div>';
  });

  updateBtns();
}

/* ---------- ALGOS GRID (Módulo 4) ---------- */
function inicializarAlgosGrid() {
  const grid = document.getElementById('algosGrid');
  if (!grid) return;

  const algos = [
    { icon: '1️⃣', title: 'FCFS', short: 'First-Come, First-Served.', long: 'El más simple: el primer proceso en llegar a la cola de listos es el primero en recibir la CPU. Como una fila del banco. No interrumpe: el proceso corre hasta terminar. Problema: si el primero es muy largo, los cortos esperan mucho (efecto convoy).' },
    { icon: '2️⃣', title: 'SJF', short: 'Shortest Job First.', long: 'El scheduler elige el proceso con menor tiempo estimado de CPU. Minimiza el tiempo de espera promedio: es óptimo en teoría. Problema: requiere saber cuánto va a durar cada proceso (¡casi nunca se sabe!) y puede generar inanición de los procesos largos.' },
    { icon: '3️⃣', title: 'Round Robin', short: 'Turnos con quantum fijo.', long: 'Cada proceso recibe la CPU por un quantum (ej. 2 ms). Si no terminó, vuelve al final de la cola de listos y le toca al siguiente. Justo y sin inanición. Usado en sistemas interactivos. El tamaño del quantum es clave: muy corto gasta en context switches, muy largo parece FCFS.' },
    { icon: '4️⃣', title: 'Prioridad', short: 'El de mayor prioridad primero.', long: 'Cada proceso tiene una prioridad (número). El scheduler elige el de mayor prioridad. Usado en sistemas de tiempo real y en SO modernos (Linux CFS). Problema: los de baja prioridad pueden padecer inanición. Solución: aging (envejecimiento): sube la prioridad conforme pasa tiempo esperando.' }
  ];

  grid.innerHTML = algos.map((a, i) =>
    `<div class="criterion-card" data-cidx="${i}">
      <span class="c-icon">${a.icon}</span>
      <div class="c-title">${a.title}</div>
      <p class="c-short">${a.short}</p>
      <div class="c-long">${a.long}</div>
    </div>`
  ).join('');

  grid.querySelectorAll('.criterion-card').forEach(card => {
    card.addEventListener('click', () => {
      const isOpen = card.classList.contains('expanded');
      grid.querySelectorAll('.criterion-card').forEach(c => c.classList.remove('expanded'));
      if (!isOpen) {
        card.classList.add('expanded');
        addXP(2);
      }
    });
  });
}

/* ---------- SCHEDULER / GANTT (Módulo 4) ---------- */
function inicializarScheduler() {
  const gantt = document.getElementById('ganttChart');
  const stats = document.getElementById('ganttStats');
  if (!gantt) return;

  const procs = [
    { pid: 'P1', burst: 6, prio: 3 },
    { pid: 'P2', burst: 8, prio: 1 },
    { pid: 'P3', burst: 3, prio: 4 },
    { pid: 'P4', burst: 4, prio: 2 }
  ];

  const colors = ['#22d3ee', '#00ff9d', '#facc15', '#a855f7'];

  const renderGantt = (schedule, algoName) => {
    gantt.innerHTML = schedule.map((slot, i) =>
      `<div class="gantt-bar" style="flex:${slot.duration};background:${colors[slot.idx]};">
        <span class="g-label">${slot.pid}</span>
        <span class="g-time">${slot.duration}ms</span>
      </div>`
    ).join('');

    // Tiempo de espera real: turnaround - burst, donde turnaround = tiempo de finalización
    // (con arrival=0 para todos los procesos).
    let t = 0;
    const completion = {};
    schedule.forEach(slot => {
      t += slot.duration;
      completion[slot.idx] = t;
    });
    const waitTimes = procs.map((p, i) => ({
      pid: p.pid,
      wait: Math.max(0, (completion[i] || 0) - p.burst),
      burst: p.burst
    }));

    const totalWait = waitTimes.reduce((s, w) => s + w.wait, 0);
    const avgWait = (totalWait / procs.length).toFixed(2);

    stats.innerHTML = `<div class="gantt-stat-line">⏱️ Orden: ${schedule.map(s => s.pid).join(' → ')}</div>
      <div class="gantt-stat-line">📊 Espera por proceso: ${waitTimes.map(w => `${w.pid}=${w.wait}ms`).join(', ')}</div>
      <div class="gantt-stat-line">📈 Espera promedio: <strong>${avgWait} ms</strong></div>`;
  };

  const fcfs = () => procs.map((p, i) => ({ pid: p.pid, idx: i, duration: p.burst }));
  const sjf = () => {
    const sorted = [...procs].map((p, i) => ({ ...p, i })).sort((a, b) => a.burst - b.burst);
    return sorted.map(p => ({ pid: p.pid, idx: p.i, duration: p.burst }));
  };
  const rr = () => {
    const queue = procs.map((p, i) => ({ pid: p.pid, idx: i, remaining: p.burst }));
    const schedule = [];
    const quantum = 2;
    let guard = 0;
    while (queue.some(p => p.remaining > 0) && guard < 100) {
      guard++;
      for (const p of queue) {
        if (p.remaining <= 0) continue;
        const run = Math.min(quantum, p.remaining);
        schedule.push({ pid: p.pid, idx: p.idx, duration: run });
        p.remaining -= run;
      }
    }
    return schedule;
  };
  const prio = () => {
    const sorted = [...procs].map((p, i) => ({ ...p, i })).sort((a, b) => a.prio - b.prio);
    return sorted.map(p => ({ pid: p.pid, idx: p.i, duration: p.burst }));
  };

  const algos = { fcfs, sjf, rr, prio };
  const names = { fcfs: 'FCFS (orden de llegada)', sjf: 'SJF (más corto primero)', rr: 'Round Robin (quantum=2)', prio: 'Prioridad' };

  document.querySelectorAll('[data-algo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.algo;
      const schedule = algos[key]();
      renderGantt(schedule, names[key]);
      addXP(5);
    });
  });

  document.getElementById('ganttReset').addEventListener('click', () => {
    gantt.innerHTML = '<div class="gantt-empty">Presiona un algoritmo para ver el diagrama</div>';
    stats.innerHTML = '';
  });

  gantt.innerHTML = '<div class="gantt-empty">Presiona un algoritmo para ver el diagrama</div>';
}

/* ---------- IPC GRID (Módulo 5) ---------- */
function inicializarIpcGrid() {
  const grid = document.getElementById('ipcGrid');
  if (!grid) return;

  const mecanismos = [
    { icon: '🔗', title: 'Pipes', short: 'Canal unidireccional entre procesos.', long: 'Un pipe es un canal de flujo de datos entre dos procesos: uno escribe en un extremo y el otro lee del otro. Puede ser anónimo (entre padre e hijo, creado con pipe()) o con nombre (named pipe/FIFO, creado con mkfifo). En la terminal lo usas con el carácter |. Es el IPC más común en Linux/UNIX.' },
    { icon: '🔔', title: 'Señales', short: 'Notificaciones cortas entre procesos.', long: 'Una señal es una notificación asíncrona muy pequeña: solo transporta un número (el tipo de señal). El proceso receptor puede capturarla, ignorarla (algunas) o morir. Ejemplos: SIGINT (Ctrl+C), SIGTERM (kill), SIGKILL (kill -9, inatratable). Sirven para detener, recargar o avisar, no para transportar datos.' },
    { icon: '🌐', title: 'Sockets', short: 'Canal bidireccional, incluso entre máquinas.', long: 'Un socket es un punto final de comunicación bidireccional. Permite que dos procesos hablen, incluso si están en computadoras distintas (por red). Es la base de Internet: cada conexión web es un socket. Los hay TCP (fiable, orientado a conexión) y UDP (rápido, sin conexión). Más pesados que los pipes pero mucho más versátiles.' },
    { icon: '🧠', title: 'Memoria compartida', short: 'Dos procesos ven la misma región de RAM.', long: 'El SO mapea una misma región de RAM en el espacio de direcciones de dos procesos. Ambos pueden leer y escribir ahí sin copiar datos: es el IPC más rápido. Pero requiere sincronización (semáforos, mutex) para no pisarse. Usado en bases de datos, motores de juegos y programas de alto rendimiento.' }
  ];

  grid.innerHTML = mecanismos.map((m, i) =>
    `<div class="state-card" data-sidx="${i}">
      <span class="s-icon">${m.icon}</span>
      <div class="s-title">${m.title}</div>
      <p class="s-short">${m.short}</p>
      <div class="s-long">${m.long}</div>
    </div>`
  ).join('');

  grid.querySelectorAll('.state-card').forEach(card => {
    card.addEventListener('click', () => {
      const isOpen = card.classList.contains('expanded');
      grid.querySelectorAll('.state-card').forEach(c => c.classList.remove('expanded'));
      if (!isOpen) {
        card.classList.add('expanded');
        addXP(2);
      }
    });
  });
}

/* ---------- PIPE SIM (Módulo 5) ---------- */
function inicializarPipeSim() {
  const sendBtn = document.getElementById('pipeSend');
  if (!sendBtn) return;

  const recvBtn = document.getElementById('pipeRecv');
  const resetBtn = document.getElementById('pipeReset');
  const prodOut = document.getElementById('prodOut');
  const consOut = document.getElementById('consOut');
  const pipeMsgs = document.getElementById('pipeMsgs');
  const pipeStatus = document.getElementById('pipeStatus');
  const pipeChannel = document.getElementById('pipeChannel');

  let buffer = [];
  const BUFFER_MAX = 3;
  let msgCounter = 0;

  const updateStatus = () => {
    if (buffer.length === 0) {
      pipeStatus.textContent = 'Pipe vacío. Presiona "Enviar mensaje".';
      pipeStatus.style.color = 'var(--texto-suave)';
    } else if (buffer.length >= BUFFER_MAX) {
      pipeStatus.textContent = `⚠️ Pipe lleno (${buffer.length}/${BUFFER_MAX}). El productor se bloquearía hasta que el consumidor lea.`;
      pipeStatus.style.color = 'var(--ambar)';
    } else {
      pipeStatus.textContent = `Pipe con ${buffer.length} mensaje(s) esperando (${buffer.length}/${BUFFER_MAX}).`;
      pipeStatus.style.color = 'var(--cian)';
    }
    pipeChannel.classList.toggle('full', buffer.length >= BUFFER_MAX);
  };

  sendBtn.addEventListener('click', () => {
    if (buffer.length >= BUFFER_MAX) {
      prodOut.textContent = '⛔ Bloqueado: pipe lleno. El consumidor debe leer.';
      prodOut.style.color = 'var(--rosa)';
      pipeStatus.textContent = 'El productor se bloquea cuando el pipe está lleno. Presiona "Consumidor lee".';
      return;
    }
    msgCounter++;
    const msg = `msg#${msgCounter}`;
    buffer.push(msg);
    prodOut.textContent = `✉️ Enviado: ${msg}`;
    prodOut.style.color = 'var(--verde)';

    const msgEl = document.createElement('div');
    msgEl.className = 'pipe-msg';
    msgEl.textContent = msg;
    pipeMsgs.appendChild(msgEl);

    updateStatus();
    addXP(2);
  });

  recvBtn.addEventListener('click', () => {
    if (buffer.length === 0) {
      consOut.textContent = '💤 Bloqueado: pipe vacío. Esperando datos.';
      consOut.style.color = 'var(--ambar)';
      return;
    }
    const msg = buffer.shift();
    consOut.textContent = `📥 Recibido: ${msg}`;
    consOut.style.color = 'var(--verde)';

    const first = pipeMsgs.querySelector('.pipe-msg');
    if (first) first.remove();

    updateStatus();
    addXP(2);
  });

  resetBtn.addEventListener('click', () => {
    buffer = [];
    msgCounter = 0;
    pipeMsgs.innerHTML = '';
    prodOut.textContent = 'Listo para enviar…';
    prodOut.style.color = 'var(--texto-suave)';
    consOut.textContent = 'Esperando datos…';
    consOut.style.color = 'var(--texto-suave)';
    updateStatus();
  });

  updateStatus();
}

/* ---------- ORDEN GENÉRICO (drag + flechas) ---------- */
function configurarOrdenGenerico(cont) {
  let dragSrc = null;
  cont.querySelectorAll('.ws-order-item').forEach(it => {
    it.addEventListener('dragstart', e => {
      dragSrc = it;
      it.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    it.addEventListener('dragend', () => it.classList.remove('dragging'));
    it.addEventListener('dragover', e => {
      e.preventDefault();
      const after = getDragAfter(cont, e.clientY);
      if (after == null) cont.appendChild(dragSrc);
      else cont.insertBefore(dragSrc, after);
    });
  });

  const scope = cont.closest('.simulador') || cont.closest('.challenge') || cont.parentElement;
  scope.querySelectorAll('[data-ws-up]').forEach(btn => {
    btn.addEventListener('click', () => moverOrdenGenerico(cont, -1));
  });
  scope.querySelectorAll('[data-ws-down]').forEach(btn => {
    btn.addEventListener('click', () => moverOrdenGenerico(cont, 1));
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
  1: { '1a': '1A', '1b': '1B', '1c': '1C', '1d': '1D' },
  3: { '3a': '3C', '3b': '3D', '3c': '3A', '3d': '3B' }
};
const TALLER_ORDER = { 2: ['2new', '2ready1', '2run', '2block', '2ready2', '2run2', '2term'] };
const TALLER_INPUT = { 4: 'bloqueado' };
const TALLER_SELECT = { 4: '4A' };
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
    let aciertos = 0;
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
        aciertos++;
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
    const items = [...cont.querySelectorAll('.ws-order-item')];
    const orden = items.map(it => it.dataset.oid);
    const expected = TALLER_ORDER[id];
    items.forEach((it, i) => {
      it.classList.remove('correct', 'wrong');
      const num = it.querySelector('.ord-num');
      num.textContent = i + 1;
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
      1: '¡Perfecto! Proceso=programa en ejecución, PCB=ficha, context switch=cambio de CPU, zombi=hijo no recogido.',
      2: '¡Excelente! El ciclo: Nuevo → Listo → Ejecución → Bloqueado → Listo → Ejecución → Terminado.',
      3: '¡Muy bien! FCFS→efecto convoy, SJF→minimiza espera, RR→quantum equitativo, Prioridad→inanición sin aging.',
      4: '🏆 ¡JEFE FINAL VENCIDO! El navegador estaba bloqueado esperando la red. La señal correcta: SIGTERM (kill) para terminarlo limpio.'
    };
    const xpPorReto = { 1: 30, 2: 35, 3: 30, 4: 45 };
    fb.innerHTML = `✅ ${msgs[id]} <strong>+${xpPorReto[id]} XP</strong>`;
    if (!estado.talleres[id]) {
      estado.talleres[id] = true;
      addXP(xpPorReto[id]);
    }
    const retosTaller = ['1', '2', '3', '4'];
    if (retosTaller.every(r => estado.talleres[r])) {
      otorgarBadge('🛠️ Process Master Completado');
    }
  } else {
    fb.className = 'resultado-ws visible no';
    const hints = {
      1: 'Pista: Proceso→programa en ejecución; PCB→ficha con PID/estado; context switch→cambio de CPU; zombi→hijo no recogido.',
      2: 'Pista: el orden es Nuevo → Listo → Ejecución → Bloqueado → Listo → Ejecución → Terminado.',
      3: 'Pista: FCFS→efecto convoy; SJF→minimiza espera promedio; RR→quantum; Prioridad→inanición sin aging.',
      4: 'Pista: la palabra es "bloqueado" (espera I/O). La señal SIGTERM permite salir limpio; SIGKILL no limpia.'
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