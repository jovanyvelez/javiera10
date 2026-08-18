/* ============================================================
   CLASE 6 — HERRAMIENTAS DE PROGRAMACIÓN I
   (Box model, display y posicionamiento)
   ============================================================ */

const STORAGE_KEY = 'curso-box-model';
const TOTAL_MODULOS = 8;
const XP_TOTAL = 640;

const LABELS_MODULOS = ['Inicio', 'Box model', 'Display', 'Posicionamiento', 'Descanso', 'z-index y sombras', 'Card y botón', 'Taller'];
const BADGES_MODULO = {
  0: '🚀 Iniciado',
  1: '📦 Box model',
  2: '🧱 Display',
  3: '🧭 Posicionador',
  4: '☕ Descansado',
  5: '🎨 Sombras',
  6: '🧩 Constructor',
  7: '🛠️ Maestro del Diseño'
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
        result.textContent = '❌ Casi. CSS es "Cascading Style Sheets". ¡A seguir!';
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
  2: ['2content', '2padding', '2border', '2margin']
};
const TALLER_INPUT = { 3: 'border-box' };
const TALLER_MSGS = {
  1: '¡Perfecto! padding=interno, margin=externo, border=línea, box-sizing=medida.',
  2: '¡Excelente! content → padding → border → margin.',
  3: '¡Bien! box-sizing: border-box hace que width incluya padding y border.',
  4: '🏆 ¡JEFE FINAL VENCIDO! El contenedor necesita position: relative para que el menú absolute se posicione respecto a él.'
};
const TALLER_HINTS = {
  1: 'Pista: padding=interno, margin=externo, border=línea, box-sizing=medida.',
  2: 'Pista: de adentro hacia afuera: contenido, relleno, borde, margen.',
  3: 'Pista: el valor es "border-box".',
  4: 'Pista: el ancestro posicionado más cercano necesita position: relative.'
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
      otorgarBadge('🛠️ Maestro del Diseño Completado');
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
  inicializarBoxModel();
  inicializarDisplay();
  inicializarPosicionamiento();
  inicializarSombras();
  inicializarCard();
}

/* --- Simulador del box model --- */
function inicializarBoxModel() {
  const preview = document.getElementById('bm-preview');
  const codeEl = document.getElementById('bm-code');
  if (!preview) return;
  const valores = { padding: 0, border: 0, margin: 0 };
  const width = 200;

  const render = () => {
    const p = valores.padding, b = valores.border, m = valores.margin;
    document.getElementById('bm-padding').textContent = p + 'px';
    document.getElementById('bm-border').textContent = b + 'px';
    document.getElementById('bm-margin').textContent = m + 'px';
    document.getElementById('bm-width').textContent = width + 'px';

    preview.innerHTML = '';
    const marginBox = document.createElement('div');
    marginBox.style.background = 'rgba(250, 204, 21, 0.15)';
    marginBox.style.padding = m + 'px';
    marginBox.style.display = 'inline-block';
    const borderBox = document.createElement('div');
    borderBox.style.background = 'rgba(244, 63, 94, 0.25)';
    borderBox.style.padding = b + 'px';
    const paddingBox = document.createElement('div');
    paddingBox.style.background = 'rgba(0, 255, 157, 0.25)';
    paddingBox.style.padding = p + 'px';
    const contentBox = document.createElement('div');
    contentBox.style.width = width + 'px';
    contentBox.style.height = '60px';
    contentBox.style.background = '#22d3ee';
    contentBox.style.color = '#000';
    contentBox.style.display = 'flex';
    contentBox.style.alignItems = 'center';
    contentBox.style.justifyContent = 'center';
    contentBox.style.fontWeight = '700';
    contentBox.style.fontSize = '0.8rem';
    contentBox.textContent = 'content';
    paddingBox.appendChild(contentBox);
    borderBox.appendChild(paddingBox);
    marginBox.appendChild(borderBox);
    preview.appendChild(marginBox);

    codeEl.innerHTML =
      '.caja {\n' +
      '  width: ' + width + 'px;\n' +
      '  padding: ' + p + 'px;\n' +
      '  border: ' + b + 'px solid #f43f5e;\n' +
      '  margin: ' + m + 'px;\n' +
      '}';
  };

  document.querySelectorAll('[data-bm]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.bm;
      const dir = parseInt(btn.dataset.dir, 10);
      valores[key] = Math.max(0, Math.min(60, valores[key] + dir * 10));
      render();
      addXP(1);
    });
  });

  render();
}

/* --- Simulador de display --- */
function inicializarDisplay() {
  const stage = document.getElementById('display-stage');
  const fbTxt = document.getElementById('display-feedback-txt');
  if (!stage) return;
  const items = stage.querySelectorAll('.display-item');
  const descripciones = {
    block: 'block: cada caja ocupa todo el ancho y empieza en una línea nueva.',
    inline: 'inline: las cajas fluyen en línea y solo ocupan su contenido (ignoran width/height).',
    'inline-block': 'inline-block: fluyen en línea pero respetan su tamaño y padding.',
    none: 'none: las cajas desaparecen por completo del flujo.'
  };
  document.querySelectorAll('[data-display]').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = btn.dataset.display;
      items.forEach(it => { it.style.display = d; });
      fbTxt.textContent = descripciones[d];
      addXP(1);
    });
  });
}

/* --- Simulador de posicionamiento --- */
function inicializarPosicionamiento() {
  const box = document.getElementById('pos-box');
  const fbTxt = document.getElementById('pos-feedback-txt');
  if (!box) return;
  const descripciones = {
    static: 'static: posición normal, en el flujo. Ignora top/left.',
    relative: 'relative: se mueve 20px desde su posición original (top/left).',
    absolute: 'absolute: se coloca en la esquina inferior derecha del contenedor.',
    fixed: 'fixed: se fija a la ventana (esquina superior derecha) y no se mueve al hacer scroll.',
    sticky: 'sticky: se comporta normal hasta que "se pega" al hacer scroll.'
  };
  document.querySelectorAll('[data-pos]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.pos;
      box.style.position = p;
      box.style.top = '';
      box.style.right = '';
      box.style.bottom = '';
      box.style.left = '';
      if (p === 'relative') { box.style.top = '20px'; box.style.left = '20px'; }
      if (p === 'absolute') { box.style.bottom = '10px'; box.style.right = '10px'; }
      if (p === 'fixed') { box.style.top = '10px'; box.style.right = '10px'; }
      if (p === 'sticky') { box.style.top = '0'; }
      fbTxt.textContent = descripciones[p];
      addXP(1);
    });
  });
}

/* --- Simulador de sombras --- */
function inicializarSombras() {
  const box = document.getElementById('shadow-box');
  const codeEl = document.getElementById('shadow-code');
  if (!box) return;
  const sombras = {
    none: 'none',
    suave: '0 4px 12px rgba(0, 0, 0, 0.3)',
    media: '0 10px 30px rgba(0, 0, 0, 0.4)',
    glow: '0 0 20px rgba(34, 211, 238, 0.6)'
  };
  document.querySelectorAll('[data-shadow]').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = btn.dataset.shadow;
      box.style.boxShadow = sombras[s];
      codeEl.innerHTML = '.caja {\n  box-shadow: ' + sombras[s] + ';\n}';
      addXP(1);
    });
  });
}

/* --- Constructor de card --- */
function inicializarCard() {
  const codeEl = document.getElementById('card-code');
  if (!codeEl) return;
  const partes = {
    padding: '  padding: 20px;',
    border: '  border: 1px solid #1c3252;',
    radius: '  border-radius: 14px;',
    shadow: '  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);'
  };
  const orden = ['padding', 'border', 'radius', 'shadow'];
  const agregados = [];
  document.querySelectorAll('[data-card]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.card;
      if (agregados.includes(key)) return;
      agregados.push(key);
      renderCard();
      addXP(2);
    });
  });
  document.getElementById('card-reset').addEventListener('click', () => {
    agregados.length = 0;
    renderCard();
  });
  function renderCard() {
    if (agregados.length === 0) {
      codeEl.innerHTML = '<span class="cm">/* Toca los botones para construir la card */</span>';
      return;
    }
    const ordenado = orden.filter(k => agregados.includes(k));
    codeEl.innerHTML = '.card {\n  width: 300px;\n' + ordenado.map(k => partes[k]).join('\n') + '\n}';
  }
}
