/* ============================================================
   CLASE 19 — HERRAMIENTAS DE PROGRAMACIÓN I
   (CRUD: crear y leer — localStorage, IDs y renderizado)
   ============================================================ */

const STORAGE_KEY = 'curso-crud-crear-leer';
const TOTAL_MODULOS = 8;
const XP_TOTAL = 640;

const LABELS_MODULOS = ['Inicio', '¿Qué es CRUD?', 'Arquitectura', 'Generar IDs', 'Descanso', 'Create: agregarTarea', 'Read: cargar y renderizar', 'Taller'];
const BADGES_MODULO = {
  0: '🚀 Iniciado',
  1: '📚 CRUD',
  2: '🏗️ Arquitecto',
  3: '🆔 Identificador',
  4: '☕ Descansado',
  5: '➕ Creador',
  6: '📖 Lector',
  7: '🛠️ Maestro CRUD'
};

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

document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarCopiarCodigo();
  configurarQuizzes();
  configurarTaller();
  configurarTrivia();
  configurarTeclado();
  inicializarSimuladores();
  actualizarUI();
});

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

function marcarCompletado(n) {
  if (estado.completados.has(n)) return;
  estado.completados.add(n);
  estado.xp = Math.min(XP_TOTAL, estado.xp + XP_POR_MODULO);
  if (BADGES_MODULO[n]) otorgarBadge(BADGES_MODULO[n]);
  if (estado.completados.size === TOTAL_MODULOS) otorgarBadge('🏆 Curso Dominado');
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

function actualizarUI() {
  const completables = [1, 2, 3, 5, 6, 7];
  const total = completables.length;
  const completos = completables.filter(m => estado.completados.has(m)).length;
  const pct = Math.round((completos / total) * 100);

  const barra = document.getElementById('barra');
  if (barra) barra.style.width = pct + '%';
  const ptxt = document.getElementById('porcentaje');
  if (ptxt) ptxt.textContent = pct + '%';
  const mAct = document.getElementById('modulo-actual');
  if (mAct) mAct.textContent = LABELS_MODULOS[estado.moduloActual] || ('Módulo ' + estado.moduloActual);
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
            opciones.forEach(o => { if (o.dataset.op === correcta) o.classList.add('correcta'); });
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
        result.textContent = '✅ ¡Correcto! localStorage = "almacenamiento local": guarda datos en tu navegador. ¡Volvamos!';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Casi. localStorage es "almacenamiento local". ¡A seguir!';
      }
    });
  });
}

/* ---------- TALLER ---------- */
const TALLER_RESP = {
  1: { '1a': '1A', '1b': '1B', '1c': '1C', '1d': '1D' },
  4: { '4A': '4A' }
};
const TALLER_ORDER = {
  2: ['2id', '2obj', '2push', '2guardar', '2render']
};
const TALLER_INPUT = { 3: 'getItem' };
const TALLER_MSGS = {
  1: '¡Perfecto! Create=Crear, Read=Leer, Update=Actualizar, Delete=Borrar.',
  2: '¡Excelente! id → objeto → push → guardar → renderizar.',
  3: '¡Bien! Se usa getItem para leer de localStorage.',
  4: '🏆 ¡JEFE FINAL VENCIDO! Sin guardarTareas(), los datos se pierden al recargar.'
};
const TALLER_HINTS = {
  1: 'Pista: Create=Crear, Read=Leer, Update=Actualizar, Delete=Borrar.',
  2: 'Pista: primero el id, luego el objeto, luego push, guardar y renderizar.',
  3: 'Pista: el método es "getItem" (obtener elemento).',
  4: 'Pista: falta una llamada a guardarTareas().'
};
const TALLER_XP = { 1: 25, 2: 30, 3: 30, 4: 55 };

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
  document.querySelectorAll('[data-ws-order]').forEach(block => {
    configurarOrden(block.dataset.wsOrder);
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
    const cont = document.querySelector(`[data-ws-order="${id}"] .ws-order`);
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
    const msgs = TALLER_MSGS[id] || '¡Correcto!';
    const xpPorReto = TALLER_XP[id] || 25;
    fb.innerHTML = `✅ ${msgs} <strong>+${xpPorReto} XP</strong>`;
    if (!estado.talleres[id]) {
      estado.talleres[id] = true;
      addXP(xpPorReto);
    }
    if (Object.keys(estado.talleres).length === Object.keys(TALLER_MSGS).length) {
      otorgarBadge('🛠️ Maestro CRUD Completado');
    }
  } else {
    fb.className = 'resultado-ws visible no';
    fb.innerHTML = `❌ Algunas respuestas son incorrectas. ${TALLER_HINTS[id] || 'Revisa y vuelve a intentar.'}`;
  }
  guardarProgreso();
}

function configurarOrden(id) {
  const cont = document.querySelector(`[data-ws-order="${id}"] .ws-order`);
  if (!cont) return;
  const items = cont.querySelectorAll('.ws-order-item');
  let dragSrc = null;
  items.forEach(it => {
    it.addEventListener('dragstart', e => {
      dragSrc = it;
      it.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    it.addEventListener('dragend', () => { it.classList.remove('dragging'); renumerarOrden(id); });
    it.addEventListener('dragover', e => {
      e.preventDefault();
      const after = getDragAfterElement(cont, e.clientY);
      if (after == null) cont.appendChild(dragSrc);
      else cont.insertBefore(dragSrc, after);
    });
  });
  const block = document.querySelector(`[data-ws-order="${id}"]`);
  block.querySelectorAll('[data-ws-up]').forEach(btn => btn.addEventListener('click', () => moverOrden(id, -1)));
  block.querySelectorAll('[data-ws-down]').forEach(btn => btn.addEventListener('click', () => moverOrden(id, 1)));
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

function moverOrden(id, dir) {
  const cont = document.querySelector(`[data-ws-order="${id}"] .ws-order`);
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
  renumerarOrden(id);
}

document.addEventListener('click', e => {
  const it = e.target.closest('.ws-order-item');
  if (it) {
    const cont = it.closest('.ws-order');
    cont.querySelectorAll('.ws-order-item').forEach(x => x.classList.remove('selected'));
    it.classList.add('selected');
  }
});

function renumerarOrden(id) {
  const cont = document.querySelector(`[data-ws-order="${id}"] .ws-order`);
  if (!cont) return;
  cont.querySelectorAll('.ws-order-item').forEach((it, i) => {
    it.querySelector('.ord-num').textContent = i + 1;
  });
}

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

function mostrarToast(mensaje) {
  const toast = document.createElement('div');
  toast.textContent = mensaje;
  Object.assign(toast.style, {
    position: 'fixed', bottom: '30px', right: '30px',
    background: 'linear-gradient(135deg, #22d3ee, #a855f7)', color: '#000',
    padding: '0.9rem 1.4rem', borderRadius: '30px', fontWeight: '700',
    boxShadow: '0 10px 30px rgba(0,0,0,0.4)', zIndex: '1000',
    transition: 'all 0.4s ease', opacity: '0', transform: 'translateY(20px)',
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

/* ---------- SIMULADORES ---------- */
function inicializarSimuladores() {
  inicializarCrud();
  inicializarGeneradorIds();
  inicializarGestorTareas();
  inicializarLectura();
}

const CRUD_MEANINGS = {
  C: 'Create (Crear): agregar una tarea nueva a la lista.',
  R: 'Read (Leer): ver la lista de tareas guardadas.',
  U: 'Update (Actualizar): editar o marcar una tarea como hecha.',
  D: 'Delete (Borrar): eliminar una tarea de la lista.'
};

function inicializarCrud() {
  const opEl = document.getElementById('crud-op');
  const meaningEl = document.getElementById('crud-meaning');
  const fbTxt = document.getElementById('crud-feedback-txt');
  if (!opEl) return;
  document.querySelectorAll('[data-crud]').forEach(btn => {
    btn.addEventListener('click', () => {
      const crud = btn.dataset.crud;
      opEl.textContent = crud;
      meaningEl.textContent = CRUD_MEANINGS[crud];
      fbTxt.textContent = CRUD_MEANINGS[crud];
      addXP(1);
    });
  });
}

function inicializarGeneradorIds() {
  const methodEl = document.getElementById('id-method');
  const valueEl = document.getElementById('id-value');
  const fbTxt = document.getElementById('id-feedback-txt');
  if (!methodEl) return;
  document.querySelectorAll('[data-genid]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tipo = btn.dataset.genid;
      let id;
      if (tipo === 'now') {
        id = Date.now();
        methodEl.textContent = 'Date.now()';
        fbTxt.textContent = 'Date.now() devuelve los milisegundos desde 1970: un número grande y casi siempre único.';
      } else {
        id = crypto.randomUUID();
        methodEl.textContent = 'crypto.randomUUID()';
        fbTxt.textContent = 'crypto.randomUUID() genera un identificador universal con letras y números.';
      }
      valueEl.textContent = id;
      addXP(1);
    });
  });
}

/* Mini gestor de tareas (Create + Read) con persistencia propia */
const SIM_STORAGE_KEY = 'curso-crud-simulador-tareas';

function inicializarGestorTareas() {
  const input = document.getElementById('sim-input');
  const btnAgregar = document.getElementById('sim-agregar');
  const btnLimpiar = document.getElementById('sim-limpiar');
  const lista = document.getElementById('sim-lista');
  const countEl = document.getElementById('sim-count');
  const lastIdEl = document.getElementById('sim-lastid');
  const fbTxt = document.getElementById('sim-feedback-txt');
  if (!input) return;

  let tareas = cargarSimTareas();

  function cargarSimTareas() {
    try {
      const datos = JSON.parse(localStorage.getItem(SIM_STORAGE_KEY));
      return datos || [];
    } catch (e) { return []; }
  }

  function guardarSimTareas() {
    try {
      localStorage.setItem(SIM_STORAGE_KEY, JSON.stringify(tareas));
    } catch (e) {}
  }

  function renderizarSimTareas() {
    lista.innerHTML = '';
    countEl.textContent = tareas.length;
    if (tareas.length === 0) {
      const vacio = document.createElement('div');
      vacio.textContent = '— No hay tareas todavía. Agrega una. —';
      vacio.style.cssText = 'color:var(--texto-suave);font-size:0.85rem;text-align:center;padding:0.5rem;';
      lista.appendChild(vacio);
      return;
    }
    tareas.forEach(tarea => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:0.5rem;padding:0.5rem 0.8rem;background:var(--fondo-claro);border:1px solid var(--tarjeta-borde);border-radius:8px;font-size:0.85rem;';
      const txt = document.createElement('span');
      txt.textContent = tarea.texto;
      const id = document.createElement('span');
      id.textContent = '#' + String(tarea.id).slice(-6);
      id.style.cssText = 'color:var(--morado-claro);font-family:monospace;font-size:0.72rem;';
      item.appendChild(txt);
      item.appendChild(id);
      lista.appendChild(item);
    });
  }

  function agregarSimTarea() {
    const texto = input.value.trim();
    if (!texto) {
      fbTxt.textContent = '⚠️ Escribe algo antes de agregar.';
      return;
    }
    const tarea = { id: Date.now(), texto: texto };
    tareas.push(tarea);
    guardarSimTareas();
    renderizarSimTareas();
    lastIdEl.textContent = tarea.id;
    input.value = '';
    fbTxt.textContent = `✅ Tarea creada con id ${tarea.id}. Se guardó en localStorage y se renderizó. ¡Recarga la página y seguirá ahí!`;
    addXP(2);
  }

  btnAgregar.addEventListener('click', agregarSimTarea);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') agregarSimTarea(); });
  btnLimpiar.addEventListener('click', () => {
    tareas = [];
    guardarSimTareas();
    renderizarSimTareas();
    lastIdEl.textContent = '—';
    fbTxt.textContent = '🗑️ Lista vaciada. Se borró todo de localStorage.';
  });

  renderizarSimTareas();
}

function inicializarLectura() {
  const btnCargar = document.getElementById('read-cargar');
  const btnRender = document.getElementById('read-render');
  const lista = document.getElementById('read-lista');
  const countEl = document.getElementById('read-count');
  const fbTxt = document.getElementById('read-feedback-txt');
  if (!btnCargar) return;

  let tareasLeidas = [];

  btnCargar.addEventListener('click', () => {
    try {
      const datos = JSON.parse(localStorage.getItem(SIM_STORAGE_KEY));
      tareasLeidas = datos || [];
      countEl.textContent = tareasLeidas.length;
      fbTxt.textContent = `📖 cargarTareas() leyó ${tareasLeidas.length} tarea(s) de localStorage. Ahora toca renderizar.`;
      addXP(1);
    } catch (e) {
      tareasLeidas = [];
      countEl.textContent = 0;
      fbTxt.textContent = '⚠️ No se pudo leer localStorage.';
    }
  });

  btnRender.addEventListener('click', () => {
    lista.innerHTML = '';
    if (tareasLeidas.length === 0) {
      const vacio = document.createElement('div');
      vacio.textContent = '— Primero toca "cargarTareas()" para leer los datos. —';
      vacio.style.cssText = 'color:var(--texto-suave);font-size:0.85rem;text-align:center;padding:0.5rem;';
      lista.appendChild(vacio);
      fbTxt.textContent = '⚠️ No hay datos cargados. Toca cargarTareas() primero.';
      return;
    }
    tareasLeidas.forEach(tarea => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:0.5rem;padding:0.5rem 0.8rem;background:var(--fondo-claro);border:1px solid var(--tarjeta-borde);border-radius:8px;font-size:0.85rem;';
      const txt = document.createElement('span');
      txt.textContent = tarea.texto;
      const id = document.createElement('span');
      id.textContent = '#' + String(tarea.id).slice(-6);
      id.style.cssText = 'color:var(--morado-claro);font-family:monospace;font-size:0.72rem;';
      item.appendChild(txt);
      item.appendChild(id);
      lista.appendChild(item);
    });
    fbTxt.textContent = `🖥️ renderizarTareas() dibujó ${tareasLeidas.length} tarea(s) en pantalla. ¡Ese es el ciclo de Read completo!`;
    addXP(1);
  });
}
