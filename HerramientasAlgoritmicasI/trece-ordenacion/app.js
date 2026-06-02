/* ============================================================
   CLASE 13 — ORDENACIÓN (SortLab)
   Lógica de navegación, simuladores, quizzes y taller
============================================================ */

const TOTAL_MODULOS = 6; // 0..5

/* ---------- ESTADO GLOBAL ---------- */
const estado = {
  moduloActual: 0,
  completados: new Set(),
  quizzes: {},          // { quizId: { aciertos, total } }
  talleres: {},         // { retoId: true } cuando se aprobó
  badges: new Set(),
  xp: 0
};

const XP_POR_MODULO = 30;
const XP_POR_QUIZ_PERFECTO = 30;
const XP_POR_TALLER = 25;
const XP_POR_CARRERA = 20;
const XP_TOTAL = 500; // 30*5 módulos + bonuses

/* ---------- INICIO ---------- */
document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarCopiarCodigo();
  configurarQuizzes();
  configurarTalleres();
  inicializarHeroAnimacion();
  inicializarSimuladores();
  inicializarCarrera();
  configurarTeclado();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
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
    localStorage.setItem('curso-ordenacion-sortlab', JSON.stringify(datos));
  } catch (e) { /* sin localStorage: ignorar */ }
}

function cargarProgreso() {
  try {
    const datos = JSON.parse(localStorage.getItem('curso-ordenacion-sortlab'));
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
    btn.addEventListener('click', () => {
      irAModulo(parseInt(btn.dataset.modulo, 10));
    });
  });
}

function configurarBotonesInternos() {
  document.querySelectorAll('.btn-anterior, .btn-siguiente').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = parseInt(btn.dataset.ir, 10);
      if (btn.classList.contains('btn-siguiente')) {
        marcarCompletado(estado.moduloActual);
      }
      irAModulo(m);
    });
  });

  // Botón "Volver al inicio" del cierre
  document.querySelectorAll('[data-reiniciar]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('¿Quieres volver al inicio? Tu progreso se conserva.')) {
        irAModulo(0);
      }
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

  // XP por completar módulo
  estado.xp = Math.min(XP_TOTAL, estado.xp + XP_POR_MODULO);

  // Insignia por módulo
  const badgesModulo = {
    0: '🚀 Iniciado',
    1: '💧 Burbuja Maestro',
    2: '🎯 Cazador del Mínimo',
    3: '🃏 Ordenador de Cartas',
    4: '⚔️ Estratega Big O',
    5: '🛠️ Ingenier@ de Software'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  // Insignia final
  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 Algoritmos Dominados');
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
  // % módulos completados
  const total = TOTAL_MODULOS - 1; // sin contar bienvenida
  const completos = [...estado.completados].filter(x => x >= 1 && x <= 5).length;
  const pct = Math.round((completos / total) * 100);

  const barra = document.getElementById('barra');
  if (barra) barra.style.width = pct + '%';

  const ptxt = document.getElementById('porcentaje');
  if (ptxt) ptxt.textContent = pct + '%';

  const mAct = document.getElementById('modulo-actual');
  if (mAct) mAct.textContent = 'Módulo ' + estado.moduloActual;

  const xpEl = document.getElementById('xp-display');
  if (xpEl) xpEl.textContent = `${estado.xp} / ${XP_TOTAL} XP`;

  // Insignias
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

  // Marcar botones de navegación como completados
  document.querySelectorAll('.btn-modulo').forEach(btn => {
    const m = parseInt(btn.dataset.modulo, 10);
    btn.classList.toggle('completado', estado.completados.has(m));
  });
}

/* ---------- COPIAR CÓDIGO ---------- */
function configurarCopiarCodigo() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.closest('.code-wrap').querySelector('code').innerText;
      navigator.clipboard.writeText(code).then(() => {
        const original = btn.textContent;
        btn.textContent = '✅ Copiado';
        btn.classList.add('ok');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('ok');
        }, 1800);
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

  // XP solo la primera vez
  if (aciertos === total && !quiz.dataset.recompensado) {
    quiz.dataset.recompensado = 'true';
    addXP(XP_POR_QUIZ_PERFECTO);
  }

  const res = quiz.querySelector('.resultado-quiz');
  if (res) {
    res.classList.add('visible');
    if (aciertos === total) {
      res.classList.add('exito');
      res.innerHTML = `🎉 ¡Perfecto! ${aciertos}/${total}. Eres un crack 💪 (+${XP_POR_QUIZ_PERFECTO} XP)`;
      if (idQuiz === '1') otorgarBadge('🧠 Burbuja Expert');
      if (idQuiz === '2') otorgarBadge('🎯 Selección Expert');
      if (idQuiz === '3') otorgarBadge('🃏 Inserción Expert');
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

/* ---------- TALLER (workshop inputs) ---------- */
function configurarTalleres() {
  document.querySelectorAll('[data-check-ws]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.checkWs;
      const inputs = document.querySelectorAll(`.ws-input[data-ws="${id}"]`);
      const fb = document.getElementById(`ws-fb-${id}`);
      let allOk = true;

      inputs.forEach(inp => {
        const got = inp.value.trim().replace(/\s+/g, ' ').toLowerCase();
        const exp = inp.dataset.ans.toLowerCase();
        const ok = got === exp || got === exp.replace(/\s+/g, '');
        inp.classList.remove('correct', 'wrong');
        inp.classList.add(ok ? 'correct' : 'wrong');
        if (!ok) allOk = false;
      });

      fb.classList.add('visible');
      if (allOk) {
        fb.className = 'resultado-ws visible ok';
        fb.innerHTML = '✅ ¡Perfecto! Código 100% funcional. +' + XP_POR_TALLER + ' XP 🚀';
        if (!estado.talleres[id]) {
          estado.talleres[id] = true;
          addXP(XP_POR_TALLER);
        }
        if (Object.keys(estado.talleres).length === 4) {
          otorgarBadge('🛠️ Taller Completado');
        }
      } else {
        fb.className = 'resultado-ws visible no';
        fb.innerHTML = '❌ Algunas respuestas son incorrectas. Piensa en el contexto del algoritmo y vuelve a intentarlo.';
      }

      guardarProgreso();
    });
  });
}

/* ---------- ANIMACIÓN DEL HERO (SVG) ---------- */
function inicializarHeroAnimacion() {
  const svg = document.getElementById('heroBars');
  const txt = document.getElementById('heroText');
  if (!svg) return;

  const N = 18;
  let arr = Array.from({ length: N }, () => 30 + Math.random() * 100);

  const render = (a, cmp = [], swp = [], srt = []) => {
    svg.innerHTML = '';
    a.forEach((v, i) => {
      let fill = 'url(#hg1)';
      if (srt.includes(i))       fill = '#00ff9d';
      else if (swp.includes(i))  fill = '#ff7a29';
      else if (cmp.includes(i))  fill = '#ff2bd6';
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const w = 300 / N - 2;
      rect.setAttribute('x', i * (w + 2));
      rect.setAttribute('y', 150 - v);
      rect.setAttribute('width', w);
      rect.setAttribute('height', v);
      rect.setAttribute('fill', fill);
      rect.setAttribute('rx', 2);
      svg.appendChild(rect);
    });
  };

  render(arr);
  let steps = bubbleStepsGen(arr);
  let i = 0;
  setInterval(() => {
    if (i < steps.length) {
      const s = steps[i];
      render(s.array, s.comparing || [], s.swapped ? s.comparing : [], s.sorted || []);
      if (txt) txt.textContent = s.msg ? s.msg.replace(/<[^>]+>/g, '') : '';
      i++;
    } else {
      arr = Array.from({ length: N }, () => 30 + Math.random() * 100);
      steps = bubbleStepsGen(arr);
      i = 0;
    }
  }, 350);
}

/* ---------- GENERADORES DE PASOS (sin tocar DOM) ---------- */
function bubbleStepsGen(arr) {
  const a = [...arr], steps = [], n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ array: [...a], comparing: [j, j + 1], swapped: false,
        sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
        msg: `Comparando arr[${j}]=${a[j]} con arr[${j + 1}]=${a[j + 1]}` });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({ array: [...a], comparing: [j, j + 1], swapped: true,
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
          msg: `${a[j]} > ${a[j + 1]} → ¡Swap! 🫧` });
      }
    }
  }
  steps.push({ array: [...a], sorted: Array.from({ length: n }, (_, k) => k), done: true,
    msg: '🏆 ¡Arreglo completamente ordenado!' });
  return steps;
}

function selectionStepsGen(arr) {
  const a = [...arr], steps = [], n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let idxMin = i;
    steps.push({ array: [...a], current: [i], min: [i],
      sorted: Array.from({ length: i }, (_, k) => k),
      msg: `Pasada ${i + 1}: asumimos ${a[i]} como mínimo inicial.` });
    for (let j = i + 1; j < n; j++) {
      steps.push({ array: [...a], comparing: [j], min: [idxMin],
        sorted: Array.from({ length: i }, (_, k) => k),
        msg: `Comparando con arr[${j}]=${a[j]}. Mínimo actual: ${a[idxMin]}` });
      if (a[j] < a[idxMin]) {
        idxMin = j;
        steps.push({ array: [...a], min: [idxMin],
          sorted: Array.from({ length: i }, (_, k) => k),
          msg: `¡Nuevo mínimo! Ahora es ${a[idxMin]} en posición ${idxMin}.` });
      }
    }
    if (idxMin !== i) {
      [a[i], a[idxMin]] = [a[idxMin], a[i]];
      steps.push({ array: [...a], comparing: [i, idxMin], swapped: true,
        sorted: Array.from({ length: i + 1 }, (_, k) => k),
        msg: `Swap: intercambiamos ${a[idxMin]} y ${a[i]}` });
    }
  }
  steps.push({ array: [...a], sorted: Array.from({ length: n }, (_, k) => k), done: true,
    msg: '🏆 ¡Arreglo completamente ordenado!' });
  return steps;
}

function insertionStepsGen(arr) {
  const a = [...arr], steps = [], n = a.length;
  steps.push({ array: [...a], sorted: [0], msg: '🃏 El primer elemento se considera ordenado.' });
  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    steps.push({ array: [...a], key: [i],
      sorted: Array.from({ length: i }, (_, k) => k),
      msg: `Tomamos la llave 🔑 ${key} para insertarla.` });
    while (j >= 0 && a[j] > key) {
      steps.push({ array: [...a], comparing: [j], key: [j + 1],
        sorted: Array.from({ length: i }, (_, k) => k).filter(x => x < j + 1),
        msg: `${a[j]} > ${key} → desplazamos ${a[j]} a la derecha.` });
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
    steps.push({ array: [...a], key: [j + 1],
      sorted: Array.from({ length: i + 1 }, (_, k) => k),
      msg: `✅ Insertamos 🔑 ${key} en posición ${j + 1}.` });
  }
  steps.push({ array: [...a], sorted: Array.from({ length: n }, (_, k) => k), done: true,
    msg: '🏆 ¡Arreglo completamente ordenado!' });
  return steps;
}

/* ---------- SIMULADORES (factoría) ---------- */
function inicializarSimuladores() {
  crearSimulador({
    barsId: 'bub-bars', msgId: 'bub-msg', compId: 'bub-comp', swapId: 'bub-swap',
    stepId: 'bub-step', totalId: 'bub-total',
    playId: 'bub-play', pauseId: 'bub-pause', stepBtnId: 'bub-step-btn',
    resetId: 'bub-reset', newId: 'bub-new', speedId: 'bub-speed',
    generator: bubbleStepsGen, size: 15
  });
  crearSimulador({
    barsId: 'sel-bars', msgId: 'sel-msg', compId: 'sel-comp', swapId: 'sel-swap',
    stepId: 'sel-step', totalId: 'sel-total',
    playId: 'sel-play', pauseId: 'sel-pause', stepBtnId: 'sel-step-btn',
    resetId: 'sel-reset', newId: 'sel-new', speedId: 'sel-speed',
    generator: selectionStepsGen, size: 15
  });
  crearSimulador({
    barsId: 'ins-bars', msgId: 'ins-msg', compId: 'ins-comp', swapId: 'ins-swap',
    stepId: 'ins-step', totalId: 'ins-total',
    playId: 'ins-play', pauseId: 'ins-pause', stepBtnId: 'ins-step-btn',
    resetId: 'ins-reset', newId: 'ins-new', speedId: 'ins-speed',
    generator: insertionStepsGen, size: 15
  });
}

function crearSimulador(cfg) {
  const state = {
    original: [],
    steps: [],
    currentStep: 0,
    playing: false,
    timer: null
  };

  const els = {
    bars:   document.getElementById(cfg.barsId),
    msg:    document.getElementById(cfg.msgId),
    comp:   document.getElementById(cfg.compId),
    swap:   document.getElementById(cfg.swapId),
    step:   document.getElementById(cfg.stepId),
    total:  document.getElementById(cfg.totalId),
    play:   document.getElementById(cfg.playId),
    pause:  document.getElementById(cfg.pauseId),
    stepBtn:document.getElementById(cfg.stepBtnId),
    reset:  document.getElementById(cfg.resetId),
    new:    document.getElementById(cfg.newId),
    speed:  document.getElementById(cfg.speedId)
  };

  if (!els.bars) return; // módulo no presente

  const renderBars = (s) => {
    const a = s.array, max = Math.max(...a);
    els.bars.innerHTML = '';
    a.forEach((v, i) => {
      const b = document.createElement('div');
      b.className = 'bar';
      b.style.height = (v / max * 100) + '%';
      if (s.done)                                       b.classList.add('sorted');
      else if (s.sorted && s.sorted.includes(i))         b.classList.add('sorted');
      else if (s.swapped && s.comparing && s.comparing.includes(i)) b.classList.add('swap');
      else if (s.comparing && s.comparing.includes(i))   b.classList.add('compare');
      else if (s.key && s.key.includes(i))               b.classList.add('key');
      else if (s.min && s.min.includes(i))               b.classList.add('min');
      else if (s.current && s.current.includes(i))       b.classList.add('current');
      els.bars.appendChild(b);
    });
  };

  const updateStats = (s) => {
    let comps = 0, swaps = 0;
    for (let k = 0; k <= state.currentStep; k++) {
      const st = state.steps[k];
      if (st.comparing && st.comparing.length > 0) comps++;
      if (st.swapped) swaps++;
    }
    els.comp.textContent = comps;
    els.swap.textContent = swaps;
    els.step.textContent = state.currentStep;
    els.total.textContent = state.steps.length - 1;
    els.msg.innerHTML = s.msg || '';
  };

  const stepForward = () => {
    if (state.currentStep < state.steps.length - 1) {
      state.currentStep++;
      const s = state.steps[state.currentStep];
      renderBars(s);
      updateStats(s);
      if (s.done) {
        state.playing = false;
        clearInterval(state.timer);
        els.play.textContent = '▶ Play';
        addXP(5);
      }
    } else {
      state.playing = false;
      clearInterval(state.timer);
      els.play.textContent = '▶ Play';
    }
  };

  const play = () => {
    if (state.currentStep >= state.steps.length - 1) state.currentStep = 0;
    state.playing = true;
    els.play.textContent = '▶ Reproduciendo...';
    const speed = els.speed ? els.speed.value : 6;
    const delay = 900 - speed * 80;
    state.timer = setInterval(() => {
      if (!state.playing) { clearInterval(state.timer); return; }
      stepForward();
    }, delay);
  };

  const pause = () => {
    state.playing = false;
    clearInterval(state.timer);
    els.play.textContent = '▶ Play';
  };

  const generateNew = () => {
    pause();
    const n = cfg.size || 15;
    state.original = Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10);
    state.steps = cfg.generator(state.original);
    state.currentStep = 0;
    renderBars(state.steps[0]);
    updateStats(state.steps[0]);
  };

  const reset = () => {
    pause();
    state.steps = cfg.generator([...state.original]);
    state.currentStep = 0;
    renderBars(state.steps[0]);
    updateStats(state.steps[0]);
  };

  els.play.addEventListener('click', play);
  els.pause.addEventListener('click', pause);
  els.stepBtn.addEventListener('click', stepForward);
  els.reset.addEventListener('click', reset);
  els.new.addEventListener('click', generateNew);

  generateNew();
}

/* ---------- CARRERA DE ALGORITMOS ---------- */
function inicializarCarrera() {
  const goBtn = document.getElementById('race-go');
  if (!goBtn) return;

  let arr = [];
  const sizeInput = document.getElementById('race-size');
  const sizeLabel = document.getElementById('race-size-label');
  const nDisplay = document.getElementById('race-n');

  const gen = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10);
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const newRaceArr = () => {
    const n = parseInt(sizeInput.value, 10);
    arr = gen(n);
    nDisplay.textContent = n;
    renderRace('b', arr, []);
    renderRace('s', arr, []);
    renderRace('i', arr, []);
    resetRaceStats();
    document.getElementById('race-winner').classList.remove('visible');
  };

  const renderRace = (alg, a, sortedIdx) => {
    const el = document.getElementById(`race-${alg}-bars`);
    const max = Math.max(...a);
    el.innerHTML = '';
    a.forEach((v, i) => {
      const b = document.createElement('div');
      b.className = 'bar';
      b.style.height = (v / max * 100) + '%';
      if (sortedIdx.includes(i)) b.classList.add('sorted');
      el.appendChild(b);
    });
  };

  const resetRaceStats = () => {
    ['b', 's', 'i'].forEach(k => {
      document.getElementById(`race-${k}-comp`).textContent = '0';
      document.getElementById(`race-${k}-swap`).textContent = '0';
      document.getElementById(`race-${k}-status`).textContent = '⏳ Esperando';
    });
  };

  const runRace = async () => {
    const a1 = [...arr], a2 = [...arr], a3 = [...arr];
    const n = a1.length;
    const stats = { b: { c: 0, s: 0 }, s: { c: 0, s: 0 }, i: { c: 0, s: 0 } };
    const finishTimes = {};
    const startTime = performance.now();

    async function bubbleRun() {
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          stats.b.c++;
          document.getElementById('race-b-comp').textContent = stats.b.c;
          if (a1[j] > a1[j + 1]) {
            [a1[j], a1[j + 1]] = [a1[j + 1], a1[j]];
            stats.b.s++;
            document.getElementById('race-b-swap').textContent = stats.b.s;
          }
          renderRace('b', a1, Array.from({ length: i }, (_, k) => n - 1 - k));
          await sleep(10);
        }
      }
      renderRace('b', a1, Array.from({ length: n }, (_, k) => k));
      document.getElementById('race-b-status').textContent = '🏁 ¡Terminó!';
      finishTimes.b = performance.now() - startTime;
      checkWinner();
    }

    async function selRun() {
      for (let i = 0; i < n - 1; i++) {
        let idxMin = i;
        for (let j = i + 1; j < n; j++) {
          stats.s.c++;
          document.getElementById('race-s-comp').textContent = stats.s.c;
          if (a2[j] < a2[idxMin]) idxMin = j;
          renderRace('s', a2, Array.from({ length: i }, (_, k) => k));
          await sleep(10);
        }
        if (idxMin !== i) {
          [a2[i], a2[idxMin]] = [a2[idxMin], a2[i]];
          stats.s.s++;
          document.getElementById('race-s-swap').textContent = stats.s.s;
        }
      }
      renderRace('s', a2, Array.from({ length: n }, (_, k) => k));
      document.getElementById('race-s-status').textContent = '🏁 ¡Terminó!';
      finishTimes.s = performance.now() - startTime;
      checkWinner();
    }

    async function insRun() {
      for (let i = 1; i < n; i++) {
        const key = a3[i];
        let j = i - 1;
        while (j >= 0 && a3[j] > key) {
          stats.i.c++;
          document.getElementById('race-i-comp').textContent = stats.i.c;
          a3[j + 1] = a3[j];
          stats.i.s++;
          document.getElementById('race-i-swap').textContent = stats.i.s;
          j--;
          renderRace('i', a3, Array.from({ length: i + 1 }, (_, k) => k).filter(x => x < j + 2));
          await sleep(10);
        }
        stats.i.c++;
        document.getElementById('race-i-comp').textContent = stats.i.c;
        a3[j + 1] = key;
        renderRace('i', a3, Array.from({ length: i + 1 }, (_, k) => k));
        await sleep(10);
      }
      renderRace('i', a3, Array.from({ length: n }, (_, k) => k));
      document.getElementById('race-i-status').textContent = '🏁 ¡Terminó!';
      finishTimes.i = performance.now() - startTime;
      checkWinner();
    }

    function checkWinner() {
      if (Object.keys(finishTimes).length === 3) {
        const sorted = Object.entries(finishTimes).sort((a, b) => a[1] - b[1]);
        const names = { b: '💧 Burbuja', s: '🎯 Selección', i: '🃏 Inserción' };
        const w = document.getElementById('race-winner');
        w.classList.add('visible');
        w.innerHTML = `🏆 ¡Ganador: <strong>${names[sorted[0][0]]}</strong> en ${Math.round(sorted[0][1])}ms!<br>
          <small>2°: ${names[sorted[1][0]]} (${Math.round(sorted[1][1])}ms) · 3°: ${names[sorted[2][0]]} (${Math.round(sorted[2][1])}ms)</small>`;
        addXP(XP_POR_CARRERA);
        otorgarBadge('🏁 Piloto de Carrera');
      }
    }

    document.getElementById('race-b-status').textContent = '🏃 Corriendo...';
    document.getElementById('race-s-status').textContent = '🏃 Corriendo...';
    document.getElementById('race-i-status').textContent = '🏃 Corriendo...';

    bubbleRun();
    selRun();
    insRun();
  };

  sizeInput.addEventListener('input', () => {
    sizeLabel.textContent = sizeInput.value;
    nDisplay.textContent = sizeInput.value;
  });

  goBtn.addEventListener('click', runRace);
  document.getElementById('race-new').addEventListener('click', newRaceArr);

  newRaceArr();
}

/* ---------- ATAJOS DE TECLADO ---------- */
function configurarTeclado() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
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
    background: 'linear-gradient(135deg, #00f0ff, #ff2bd6)',
    color: '#000',
    padding: '0.9rem 1.4rem',
    borderRadius: '30px',
    fontWeight: '700',
    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
    zIndex: '1000',
    transition: 'all 0.4s ease',
    opacity: '0',
    transform: 'translateY(20px)'
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
