/* ============================================================
   CLASE 10 — HERRAMIENTAS DE PROGRAMACIÓN I
   (Componentes, animaciones y checkpoint CSS)
   ============================================================ */

const STORAGE_KEY = 'curso-componentes-animaciones';
const TOTAL_MODULOS = 8;
const XP_TOTAL = 640;

const LABELS_MODULOS = ['Inicio', 'Pseudo-clases', 'Transiciones', 'Transformaciones', 'Descanso', 'Animaciones', 'UX y buenas prácticas', 'Taller'];
const BADGES_MODULO = {
  0: '🚀 Iniciado',
  1: '🖱️ Pseudo-clases',
  2: '⏳ Transiciones',
  3: '🔄 Transformador',
  4: '☕ Descansado',
  5: '🎬 Animador',
  6: '🧭 Diseñador UX',
  7: '🛠️ Diseñador de Interfaces'
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
        result.textContent = '✅ ¡Correcto! CSS = Cascading Style Sheets (Hojas de Estilo en Cascada). ¡Volvamos!';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Casi. CSS significa Cascading Style Sheets. ¡A seguir!';
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
  2: ['2a', '2b', '2c', '2d']
};
const TALLER_INPUT = { 3: 'scale(1.2)' };
const TALLER_MSGS = {
  1: '¡Perfecto! hover=mouse encima, focus=foco, active=presionando, disabled=deshabilitado.',
  2: '¡Correcto! Primero defines @keyframes, luego aplicas animation con duración y easing, y pruebas.',
  3: '¡Bien! scale(1.2) agranda el elemento un 20%.',
  4: '🏆 ¡JEFE FINAL VENCIDO! Un botón sin estados no da feedback visual.'
};
const TALLER_HINTS = {
  1: 'Pista: hover=mouse, focus=teclado, active=presionar, disabled=deshabilitado.',
  2: 'Pista: primero defines los fotogramas, luego los aplicas.',
  3: 'Pista: la función es "scale" con el factor 1.2.',
  4: 'Pista: el botón no reacciona a nada.'
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
      otorgarBadge('🛠️ Diseñador de Interfaces Completado');
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
  inicializarPseudoClases();
  inicializarTransiciones();
  inicializarTransformaciones();
  inicializarAnimaciones();
  inicializarUX();
}

const PC_MEANINGS = {
  hover: 'El mouse está encima del elemento.',
  focus: 'El elemento tiene el foco del teclado.',
  active: 'El elemento se está presionando.',
  disabled: 'El elemento está deshabilitado.'
};

function inicializarPseudoClases() {
  const tagEl = document.getElementById('pc-tag');
  const meaningEl = document.getElementById('pc-meaning');
  const demo = document.getElementById('pc-demo');
  const fbTxt = document.getElementById('pc-feedback-txt');
  if (!tagEl) return;
  const reset = () => {
    demo.style.background = 'var(--tarjeta-alt)';
    demo.style.borderColor = 'var(--tarjeta-borde)';
    demo.style.color = 'var(--texto)';
    demo.style.transform = 'none';
    demo.style.opacity = '1';
    demo.style.boxShadow = 'none';
  };
  document.querySelectorAll('[data-pc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pc = btn.dataset.pc;
      tagEl.textContent = ':' + pc;
      meaningEl.textContent = PC_MEANINGS[pc];
      fbTxt.textContent = PC_MEANINGS[pc];
      reset();
      if (pc === 'hover') {
        demo.style.background = 'var(--morado)';
        demo.style.borderColor = 'var(--morado-claro)';
        demo.style.transform = 'translateY(-4px)';
        demo.style.boxShadow = '0 8px 20px rgba(168,85,247,0.5)';
      } else if (pc === 'focus') {
        demo.style.borderColor = 'var(--cian)';
        demo.style.boxShadow = '0 0 0 3px rgba(34,211,238,0.3)';
      } else if (pc === 'active') {
        demo.style.background = 'var(--rosa)';
        demo.style.transform = 'scale(0.95)';
      } else if (pc === 'disabled') {
        demo.style.opacity = '0.4';
        demo.style.color = 'var(--texto-suave)';
      }
      addXP(1);
    });
  });
  document.getElementById('pc-reset').addEventListener('click', () => {
    reset();
    tagEl.textContent = '—';
    meaningEl.textContent = '—';
    fbTxt.textContent = 'Toca una pseudo-clase para ver cómo cambia el botón demo.';
  });
}

function inicializarTransiciones() {
  const demo = document.getElementById('tr-demo');
  const fbTxt = document.getElementById('tr-feedback-txt');
  if (!demo) return;
  let duracion = 0.3;
  const reset = () => {
    demo.style.background = 'var(--cian)';
    demo.style.width = '120px';
    demo.style.height = '120px';
    demo.style.borderRadius = '12px';
  };
  document.querySelectorAll('[data-tr]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tr = btn.dataset.tr;
      demo.style.transition = `all ${duracion}s ease`;
      if (tr === 'color') {
        demo.style.background = 'var(--morado)';
        fbTxt.textContent = 'Cambio de color suave con transition.';
      } else if (tr === 'size') {
        demo.style.width = '180px';
        demo.style.height = '180px';
        fbTxt.textContent = 'Cambio de tamaño suave con transition.';
      } else if (tr === 'radius') {
        demo.style.borderRadius = '50%';
        fbTxt.textContent = 'Borde redondeado suave con transition.';
      }
      addXP(1);
    });
  });
  document.querySelectorAll('[data-dur]').forEach(btn => {
    btn.addEventListener('click', () => {
      duracion = parseFloat(btn.dataset.dur);
      fbTxt.textContent = `Duración cambiada a ${duracion}s. Ahora prueba una transformación.`;
    });
  });
  document.getElementById('tr-reset').addEventListener('click', () => {
    reset();
    fbTxt.textContent = 'Cambia la duración y nota la diferencia entre un cambio rápido y uno lento.';
  });
}

function inicializarTransformaciones() {
  const demo = document.getElementById('tf-demo');
  const valEl = document.getElementById('tf-value');
  const fbTxt = document.getElementById('tf-feedback-txt');
  if (!demo) return;
  const reset = () => {
    demo.style.transform = 'none';
    valEl.textContent = 'none';
  };
  document.querySelectorAll('[data-tf]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tf = btn.dataset.tf;
      if (tf === 'translate') {
        demo.style.transform = 'translate(40px, -20px)';
        valEl.textContent = 'translate(40px, -20px)';
        fbTxt.textContent = 'translate() mueve el elemento sin afectar el flujo.';
      } else if (tf === 'scale') {
        demo.style.transform = 'scale(1.4)';
        valEl.textContent = 'scale(1.4)';
        fbTxt.textContent = 'scale() agranda o encoge el elemento.';
      } else if (tf === 'rotate') {
        demo.style.transform = 'rotate(45deg)';
        valEl.textContent = 'rotate(45deg)';
        fbTxt.textContent = 'rotate() gira el elemento.';
      } else if (tf === 'combo') {
        demo.style.transform = 'translate(20px, 0) scale(1.2) rotate(15deg)';
        valEl.textContent = 'translate(20px,0) scale(1.2) rotate(15deg)';
        fbTxt.textContent = 'Puedes combinar varias transformaciones en una sola línea.';
      }
      addXP(1);
    });
  });
  document.getElementById('tf-reset').addEventListener('click', () => {
    reset();
    fbTxt.textContent = 'Toca un botón para transformar la caja.';
  });
}

function inicializarAnimaciones() {
  const demo = document.getElementById('an-demo');
  const fbTxt = document.getElementById('an-feedback-txt');
  if (!demo) return;
  const reset = () => {
    demo.style.animation = 'none';
    demo.style.transform = 'none';
    demo.style.opacity = '1';
  };
  document.querySelectorAll('[data-an]').forEach(btn => {
    btn.addEventListener('click', () => {
      const an = btn.dataset.an;
      reset();
      if (an === 'bounce') {
        demo.style.animation = 'bounce 0.8s ease 3';
        fbTxt.textContent = 'Rebote: la animación se repite 3 veces.';
      } else if (an === 'pulse') {
        demo.style.animation = 'pulse 1s ease infinite';
        fbTxt.textContent = 'Latido: animación infinita con @keyframes.';
      } else if (an === 'spin') {
        demo.style.animation = 'spin 1.2s linear infinite';
        fbTxt.textContent = 'Giro: rotación continua.';
      } else if (an === 'fade') {
        demo.style.animation = 'fade 1s ease';
        fbTxt.textContent = 'Aparecer: de opaco a visible.';
      }
      addXP(1);
    });
  });
  document.getElementById('an-reset').addEventListener('click', () => {
    reset();
    fbTxt.textContent = 'Cada animación se define con @keyframes y se aplica con animation.';
  });
}

function inicializarUX() {
  const codeEl = document.getElementById('ux-code');
  const fb = document.getElementById('ux-feedback');
  const fbTxt = document.getElementById('ux-feedback-txt');
  if (!codeEl) return;
  const casos = [
    { code: '&lt;button&gt;Enviar&lt;/button&gt;', bien: false, msg: '❌ Problema: el botón no tiene estados (:hover, :active). No da feedback visual.' },
    { code: '&lt;button class="btn"&gt;Enviar&lt;/button&gt;\n.btn:hover { background: #a855f7; }', bien: true, msg: '✅ Correcto: el botón reacciona al hover, comunicando que es clicable.' },
    { code: '&lt;div onclick="..."&gt;Haz clic&lt;/div&gt;', bien: false, msg: '❌ Problema: usa un &lt;div&gt; como botón, sin estados ni accesibilidad. Mejor un &lt;button&gt;.' }
  ];
  let idx = 0;
  const mostrar = () => {
    codeEl.innerHTML = casos[idx].code;
    fb.style.display = 'none';
  };
  document.getElementById('ux-bien').addEventListener('click', () => {
    fb.style.display = 'block';
    fbTxt.textContent = casos[idx].bien ? '✅ ¡Correcto! Detectaste bien.' : '❌ Te equivocaste: este diseño SÍ tiene un problema. ' + casos[idx].msg;
    addXP(1);
    idx = (idx + 1) % casos.length;
    setTimeout(mostrar, 2500);
  });
  document.getElementById('ux-mal').addEventListener('click', () => {
    fb.style.display = 'block';
    fbTxt.textContent = !casos[idx].bien ? '✅ ¡Correcto! Detectaste el problema. ' + casos[idx].msg : '❌ Te equivocaste: este diseño está bien. ' + casos[idx].msg;
    addXP(1);
    idx = (idx + 1) % casos.length;
    setTimeout(mostrar, 2500);
  });
  mostrar();
}
