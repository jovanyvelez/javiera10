/* ============================================================
   CLASE 21 — HERRAMIENTAS DE PROGRAMACIÓN I
   (Proyecto final: filtros, validaciones, UX y despliegue)
   ============================================================ */

const STORAGE_KEY = 'curso-proyecto-final';
const TOTAL_MODULOS = 8;
const XP_TOTAL = 640;

const LABELS_MODULOS = ['Inicio', 'Filtros', 'Buscador', 'Contador y mensajes', 'Descanso', 'Validaciones y accesibilidad', 'Despliegue', 'Taller'];
const BADGES_MODULO = {
  0: '🚀 Iniciado',
  1: '🔍 Filtrador',
  2: '🔎 Buscador',
  3: '🔢 Contador',
  4: '☕ Descansado',
  5: '✅ Validador',
  6: '🌍 Desplegador',
  7: '🛠️ Desarrollador Full-Stack'
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
        result.textContent = '✅ ¡Correcto! MVP = Producto Mínimo Viable. ¡Volvamos!';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Casi. MVP es "Producto Mínimo Viable". ¡A seguir!';
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
  2: ['2escribir', '2validar', '2guardar', '2mostrar']
};
const TALLER_INPUT = { 3: 'filter' };
const TALLER_MSGS = {
  1: '¡Perfecto! Filtro=pendientes, buscador=texto, contador=cuenta, validación=no vacío.',
  2: '¡Correcto! Escribir → validar → guardar → mostrar.',
  3: '¡Bien! El método es filter().',
  4: '🏆 ¡JEFE FINAL VENCIDO! Falta validar que el texto no esté vacío y usar trim().'
};
const TALLER_HINTS = {
  1: 'Pista: filtro=pendientes, buscador=texto, contador=cuenta, validación=no vacío.',
  2: 'Pista: primero se escribe, luego se valida, se guarda y se muestra.',
  3: 'Pista: el método es "filter".',
  4: 'Pista: no valida el texto vacío ni usa trim().'
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
      otorgarBadge('🛠️ Desarrollador Full-Stack Completado');
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
  inicializarGestorTareas();
  inicializarBuscador();
  inicializarContador();
}

/* --- Simulador 1: gestor de tareas con filtros (Módulo 1) --- */
const GESTOR_KEY = 'curso-proyecto-final-simulador';

function inicializarGestorTareas() {
  const cont = document.getElementById('gestor-tareas');
  if (!cont) return;

  let tareas = [];
  try { tareas = JSON.parse(localStorage.getItem(GESTOR_KEY)) || []; } catch (e) {}
  let filtro = 'todas';

  cont.innerHTML = `
    <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem;">
      <button class="btn primary" data-filtro="todas">📋 Todas</button>
      <button class="btn" data-filtro="pendientes">⏳ Pendientes</button>
      <button class="btn" data-filtro="completadas">✅ Completadas</button>
    </div>
    <div style="display:flex;gap:.5rem;margin-bottom:1rem;">
      <input id="gestor-input" type="text" placeholder="Nueva tarea..." style="flex:1;background:var(--fondo-claro);border:1px solid var(--tarjeta-borde);color:var(--texto);padding:.5rem .8rem;border-radius:8px;font-family:inherit;">
      <button class="btn primary" id="gestor-agregar">➕ Agregar</button>
    </div>
    <div id="gestor-lista" style="display:flex;flex-direction:column;gap:.4rem;"></div>
    <div id="gestor-msg" style="margin-top:.8rem;font-size:.85rem;color:var(--texto-suave);"></div>
  `;

  const lista = cont.querySelector('#gestor-lista');
  const msg = cont.querySelector('#gestor-msg');
  const input = cont.querySelector('#gestor-input');

  function guardar() {
    try { localStorage.setItem(GESTOR_KEY, JSON.stringify(tareas)); } catch (e) {}
  }

  function render() {
    const visibles = tareas.filter(t => {
      if (filtro === 'pendientes') return !t.completada;
      if (filtro === 'completadas') return t.completada;
      return true;
    });
    lista.innerHTML = '';
    if (visibles.length === 0) {
      lista.innerHTML = '<div style="color:var(--texto-suave);font-style:italic;">No hay tareas.</div>';
    }
    visibles.forEach((t, i) => {
      const idx = tareas.indexOf(t);
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;align-items:center;gap:.6rem;padding:.5rem .8rem;background:var(--fondo-claro);border:1px solid var(--tarjeta-borde);border-radius:8px;';
      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.checked = t.completada;
      chk.addEventListener('change', () => {
        t.completada = chk.checked;
        guardar();
        render();
        addXP(1);
      });
      const txt = document.createElement('span');
      txt.textContent = t.texto;
      txt.style.cssText = 'flex:1;' + (t.completada ? 'text-decoration:line-through;color:var(--texto-suave);' : '');
      const del = document.createElement('button');
      del.textContent = '🗑️';
      del.className = 'btn';
      del.addEventListener('click', () => {
        tareas.splice(idx, 1);
        guardar();
        render();
        addXP(1);
      });
      item.appendChild(chk);
      item.appendChild(txt);
      item.appendChild(del);
      lista.appendChild(item);
    });
  }

  cont.querySelectorAll('[data-filtro]').forEach(btn => {
    btn.addEventListener('click', () => {
      filtro = btn.dataset.filtro;
      cont.querySelectorAll('[data-filtro]').forEach(b => b.classList.remove('primary'));
      btn.classList.add('primary');
      render();
      addXP(1);
    });
  });

  cont.querySelector('#gestor-agregar').addEventListener('click', () => {
    const texto = input.value.trim();
    if (!texto) {
      msg.textContent = '⚠️ Escribe un texto para la tarea.';
      msg.style.color = 'var(--rosa)';
      return;
    }
    tareas.push({ texto, completada: false });
    input.value = '';
    guardar();
    render();
    msg.textContent = '✅ Tarea agregada.';
    msg.style.color = 'var(--verde)';
    addXP(2);
  });

  render();
}

/* --- Simulador 2: buscador en vivo (Módulo 2) --- */
function inicializarBuscador() {
  const cont = document.getElementById('buscador-tareas');
  if (!cont) return;

  const base = ['Comprar pan', 'Estudiar matemáticas', 'Hacer la tarea de inglés', 'Llamar a la abuela', 'Ordenar el cuarto', 'Leer un capítulo'];
  let busqueda = '';

  cont.innerHTML = `
    <input id="buscador-input" type="text" placeholder="Escribe para buscar..." style="width:100%;background:var(--fondo-claro);border:1px solid var(--tarjeta-borde);color:var(--texto);padding:.5rem .8rem;border-radius:8px;font-family:inherit;margin-bottom:1rem;">
    <div id="buscador-lista" style="display:flex;flex-direction:column;gap:.4rem;"></div>
  `;

  const lista = cont.querySelector('#buscador-lista');
  const input = cont.querySelector('#buscador-input');

  function render() {
    const q = busqueda.toLowerCase();
    const visibles = base.filter(t => t.toLowerCase().includes(q));
    lista.innerHTML = '';
    if (visibles.length === 0) {
      lista.innerHTML = '<div style="color:var(--texto-suave);font-style:italic;">No hay coincidencias.</div>';
    }
    visibles.forEach(t => {
      const div = document.createElement('div');
      div.textContent = t;
      div.style.cssText = 'padding:.5rem .8rem;background:var(--fondo-claro);border:1px solid var(--tarjeta-borde);border-radius:8px;';
      lista.appendChild(div);
    });
  }

  input.addEventListener('input', () => {
    busqueda = input.value;
    render();
    addXP(1);
  });

  render();
}

/* --- Simulador 3: contador y mensajes (Módulo 3) --- */
function inicializarContador() {
  const cont = document.getElementById('contador-tareas');
  if (!cont) return;

  let tareas = [];

  cont.innerHTML = `
    <div style="display:flex;gap:.5rem;margin-bottom:1rem;">
      <input id="contador-input" type="text" placeholder="Nueva tarea..." style="flex:1;background:var(--fondo-claro);border:1px solid var(--tarjeta-borde);color:var(--texto);padding:.5rem .8rem;border-radius:8px;font-family:inherit;">
      <button class="btn primary" id="contador-agregar">➕ Agregar</button>
    </div>
    <div class="state-panel">
      <div class="state-title">Estado de la app</div>
      <div class="state-grid">
        <div class="state-cell"><div class="label">Total</div><span class="sval" id="cont-total">0</span></div>
        <div class="state-cell"><div class="label">Pendientes</div><span class="sval" id="cont-pend">0</span></div>
        <div class="state-cell"><div class="label">Completadas</div><span class="sval" id="cont-comp">0</span></div>
      </div>
    </div>
    <div id="contador-lista" style="display:flex;flex-direction:column;gap:.4rem;"></div>
    <div id="contador-msg" style="margin-top:.8rem;font-size:.85rem;color:var(--texto-suave);"></div>
  `;

  const lista = cont.querySelector('#contador-lista');
  const msg = cont.querySelector('#contador-msg');
  const input = cont.querySelector('#contador-input');

  function render() {
    const total = tareas.length;
    const pend = tareas.filter(t => !t.completada).length;
    const comp = tareas.filter(t => t.completada).length;
    cont.querySelector('#cont-total').textContent = total;
    cont.querySelector('#cont-pend').textContent = pend;
    cont.querySelector('#cont-comp').textContent = comp;

    lista.innerHTML = '';
    if (total === 0) {
      lista.innerHTML = '<div style="color:var(--texto-suave);font-style:italic;">No hay tareas.</div>';
    }
    tareas.forEach((t, i) => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;align-items:center;gap:.6rem;padding:.5rem .8rem;background:var(--fondo-claro);border:1px solid var(--tarjeta-borde);border-radius:8px;';
      const txt = document.createElement('span');
      txt.textContent = t.texto;
      txt.style.cssText = 'flex:1;' + (t.completada ? 'text-decoration:line-through;color:var(--texto-suave);' : '');
      const del = document.createElement('button');
      del.textContent = '🗑️';
      del.className = 'btn';
      del.addEventListener('click', () => {
        tareas.splice(i, 1);
        render();
        msg.textContent = '🗑️ Tarea eliminada.';
        msg.style.color = 'var(--rosa)';
        addXP(1);
      });
      item.appendChild(txt);
      item.appendChild(del);
      lista.appendChild(item);
    });
  }

  cont.querySelector('#contador-agregar').addEventListener('click', () => {
    const texto = input.value.trim();
    if (!texto) {
      msg.textContent = '⚠️ No puedes agregar una tarea vacía.';
      msg.style.color = 'var(--rosa)';
      return;
    }
    tareas.push({ texto, completada: false });
    input.value = '';
    render();
    msg.textContent = '✅ Tarea agregada.';
    msg.style.color = 'var(--verde)';
    addXP(2);
  });

  render();
}
