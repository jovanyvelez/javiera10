/* ============================================================
   CLASE 3 — SISTEMAS OPERATIVOS (Tipos de SO)
   Lógica de navegación, simuladores, quizzes y taller
   Tema: Escritorio · Móviles · Embebidos · Red · Tiempo real
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
  inicializarEscritorioMatch();
  inicializarMovilMatch();
  inicializarEmbebidoBank();
  inicializarRedClients();
  inicializarRtosTimeline();
  inicializarAmbitosMatrix();
  configurarTeclado();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
const STORAGE_KEY = 'curso-so-tipos-sistemas-operativos';

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
    1: '🖥️ Escritorio Pro',
    2: '📱 Móvil Expert',
    3: '🔧 Embebido Master',
    4: '☕ Descansado',
    5: '🌐 Network Admin',
    6: '⏱️ RTOS Specialist',
    7: '🧭 Clasificador',
    8: '🛠️ Tipos de SO Dominado'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 Tipos de SO Completado');
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
    const labels = ['Inicio', 'Escritorio', 'Móviles', 'Embebidos', 'Descanso', 'En red', 'Tiempo real', 'Ámbitos', 'Taller'];
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
        result.textContent = '✅ ¡Correcto! Un marcapasos usa un SO de tiempo real: debe responder en milisegundos o la vida del paciente está en riesgo. ¡Volvamos!';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Casi. La respuesta correcta: marcapasos → SO de tiempo real (RTOS), porque debe responder en milisegundos exactos. ¡A seguir!';
      }
    });
  });
}

/* ---------- TALLER (matching + order) ---------- */
const TALLER_RESP = {
  1: { '1a': '1C', '1b': '1A', '1c': '1D', '1d': '1B' },   // tipo SO ↔ característica
  3: { '3a': '3A', '3b': '3D', '3c': '3C', '3d': '3B' }    // dispositivo ↔ tipo
};
const TALLER_ORDER = { 2: ['2recursos', '2movil', '2escritorio', '2red'] };

const seleccionMatch = {};
const parejasMatch = {};

function configurarTaller() {
  document.querySelectorAll('[data-ws-match]').forEach(block => {
    const id = block.dataset.wsMatch;
    if (id === '4') return;
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
    if (btn.id === 'diagValidate') return;
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

  fb.classList.add('visible');
  if (allOk) {
    fb.className = 'resultado-ws visible ok';
    const msgs = {
      1: '¡Perfecto! Escritorio = multitarea + GUI · Móvil = batería + táctil · Embebido = recursos mínimos · Red = multiusuario.',
      2: '¡Excelente! Ordenaste por recursos: embebido (KB-MB) → móvil (GB) → escritorio (GB-TB) → servidor (TB+) para muchos usuarios.',
      3: '¡Muy bien! Laptop=escritorio; dron=RTOS; servidor nube=en red; cajero viejo=embebido.'
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
      1: 'Pista: Escritorio = multitarea + GUI; Móvil = batería + táctil + sensores; Embebido = recursos mínimos sin GUI; Red = muchos usuarios a la vez.',
      2: 'Pista: ordena de menos a más recursos: embebido (KB) → móvil (GB) → escritorio (GB-TB) → servidor/red (TB+ para miles de usuarios).',
      3: 'Pista: laptop → escritorio; dron → tiempo real (RTOS); servidor nube → en red; cajero antiguo → embebido.'
    };
    fb.innerHTML = `❌ Algunas respuestas son incorrectas. ${hints[id]}`;
  }

  guardarProgreso();
}

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

/* ---------- DIAGNÓSTICO (Jefe Final): el dron se cae ---------- */
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
    const correctComp = 'rtos';
    const correctActions = ['rtos', 'dedicated'];

    let compOk = compSelected === correctComp;
    let actionsOk = actionsSelected.size === correctActions.length &&
                    correctActions.every(a => actionsSelected.has(a));
    const hasText = document.getElementById('diagText').value.trim().length >= 20;

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
      fb.innerHTML = `🏆 ¡DIAGNÓSTICO PERFECTO! Identificaste el SO de tiempo real como el problema (un dron necesita respuesta en milisegundos exactos), recomendaste migrar a un RTOS con procesos dedicados para el control de vuelo, y descartaste opciones que no resuelven la latencia. Tu ticket está listo para el cliente. <strong>+55 XP</strong>`;
      if (!estado.talleres['4']) {
        estado.talleres['4'] = true;
        addXP(55);
      }
      if (Object.keys(estado.talleres).length >= 4) {
        otorgarBadge('🛠️ Tipos de SO Master');
      }
    } else {
      fb.className = 'resultado-ws visible no';
      let hints = [];
      if (!compOk) hints.push('El problema NO es memoria ni drivers ni escritorio. ¿Qué necesita un dron? Respuesta en milisegundos exactos → RTOS.');
      if (!actionsOk) hints.push('Acciones correctas: migrar a un RTOS + procesos dedicados para el control de vuelo. Descarta "agregar RAM" (no es problema de memoria) y "cambiar interfaz" (no es problema de UX).');
      if (!hasText) hints.push('Redacta tu diagnóstico con al menos 20 caracteres explicando el "por qué".');
      fb.innerHTML = `❌ Revisa el diagnóstico. ${hints.join(' ')}`;
    }

    guardarProgreso();
  });
}

/* ---------- SIMULADOR: ESCRITORIO MATCH (Módulo 1) ---------- */
function inicializarEscritorioMatch() {
  const grid = document.getElementById('escritorioGrid');
  const optsEl = document.getElementById('escritorioOptions');
  const fb = document.getElementById('escritorioFeedback');
  if (!grid || !optsEl) return;

  const devices = [
    { id: 'd1', icon: '💻', name: 'Laptop de oficina', so: 'win' },
    { id: 'd2', icon: '🖥️', name: 'Workstation de diseño', so: 'mac' },
    { id: 'd3', icon: '💻', name: 'PC de desarrollador', so: 'lin' },
    { id: 'd4', icon: '🖥️', name: 'All-in-one de oficina', so: 'win' },
    { id: 'd5', icon: '💻', name: 'Laptop de programador', so: 'mac' },
    { id: 'd6', icon: '🖥️', name: 'PC de un colegio', so: 'lin' }
  ];

  const options = [
    { id: 'win', label: '🪟 Windows' },
    { id: 'mac', label: '🍎 macOS' },
    { id: 'lin', label: '🐧 Linux' }
  ];

  let selectedDev = null;
  let aciertos = 0;

  const render = () => {
    grid.innerHTML = devices.map(d => {
      const matched = d.matched;
      return `<div class="match-device ${selectedDev === d.id ? 'selected' : ''} ${matched ? 'matched' : ''}" data-dev="${d.id}">
        <span class="d-icon">${d.icon}</span>
        <span class="d-name">${matched ? d.soLabel : d.name}</span>
      </div>`;
    }).join('');
    optsEl.innerHTML = options.map(o =>
      `<button class="match-opt ${o.used ? 'used' : ''}" data-opt="${o.id}">${o.label}</button>`
    ).join('');
    bind();
  };

  const bind = () => {
    grid.querySelectorAll('.match-device:not(.matched)').forEach(d => {
      d.addEventListener('click', () => { selectedDev = d.dataset.dev; render(); });
    });
    optsEl.querySelectorAll('.match-opt:not(.used)').forEach(o => {
      o.addEventListener('click', () => {
        if (!selectedDev) return;
        const dev = devices.find(d => d.id === selectedDev);
        const opt = options.find(x => x.id === o.dataset.opt);
        if (dev.so === opt.id) {
          dev.matched = true;
          opt.used = true;
          dev.soLabel = opt.label;
          aciertos++;
          addXP(5);
          if (aciertos === devices.length) {
            fb.className = 'match-feedback visible ok';
            fb.textContent = '🏆 ¡Perfecto! 6/6 dispositivos de escritorio emparejados.';
          }
        } else {
          fb.className = 'match-feedback visible';
          fb.style.background = 'rgba(244, 63, 94, 0.12)';
          fb.style.color = 'var(--rosa)';
          fb.textContent = '❌ Ese SO no es típico de escritorio para ese dispositivo. Intenta otra vez.';
          setTimeout(() => fb.classList.remove('visible'), 1500);
        }
        selectedDev = null;
        render();
      });
    });
  };

  document.getElementById('escritorioReset').addEventListener('click', () => {
    devices.forEach(d => { d.matched = false; delete d.soLabel; });
    options.forEach(o => o.used = false);
    selectedDev = null; aciertos = 0;
    fb.classList.remove('visible');
    render();
  });

  render();
}

/* ---------- SIMULADOR: MÓVIL MATCH (Módulo 2) ---------- */
function inicializarMovilMatch() {
  const grid = document.getElementById('movilGrid');
  const optsEl = document.getElementById('movilOptions');
  const fb = document.getElementById('movilFeedback');
  if (!grid || !optsEl) return;

  const devices = [
    { id: 'm1', icon: '📱', name: 'Celular Android gama alta', so: 'and' },
    { id: 'm2', icon: '📱', name: 'iPhone', so: 'ios' },
    { id: 'm3', icon: '⌚', name: 'Reloj inteligente (Wear OS)', so: 'and' },
    { id: 'm4', name: 'iPad', icon: '📱', so: 'ios' },
    { id: 'm5', icon: '📱', name: 'Tablet Android Samsung', so: 'and' },
    { id: 'm6', icon: '🎮', name: 'Apple Watch', so: 'ios' }
  ];

  const options = [
    { id: 'and', label: '🤖 Android (Linux)' },
    { id: 'ios', label: '🍎 iOS / iPadOS / watchOS (Unix)' }
  ];

  let selectedDev = null;
  let aciertos = 0;

  const render = () => {
    grid.innerHTML = devices.map(d => {
      const matched = d.matched;
      return `<div class="match-device ${selectedDev === d.id ? 'selected' : ''} ${matched ? 'matched' : ''}" data-dev="${d.id}">
        <span class="d-icon">${d.icon}</span>
        <span class="d-name">${matched ? d.soLabel : d.name}</span>
      </div>`;
    }).join('');
    optsEl.innerHTML = options.map(o =>
      `<button class="match-opt ${o.used ? 'used' : ''}" data-opt="${o.id}">${o.label}</button>`
    ).join('');
    bind();
  };

  const bind = () => {
    grid.querySelectorAll('.match-device:not(.matched)').forEach(d => {
      d.addEventListener('click', () => { selectedDev = d.dataset.dev; render(); });
    });
    optsEl.querySelectorAll('.match-opt:not(.used)').forEach(o => {
      o.addEventListener('click', () => {
        if (!selectedDev) return;
        const dev = devices.find(d => d.id === selectedDev);
        const opt = options.find(x => x.id === o.dataset.opt);
        if (dev.so === opt.id) {
          dev.matched = true;
          opt.used = true;
          dev.soLabel = opt.label;
          aciertos++;
          addXP(5);
          if (aciertos === devices.length) {
            fb.className = 'match-feedback visible ok';
            fb.textContent = '🏆 ¡Perfecto! 6/6 dispositivos móviles clasificados. Android domina por volumen, iOS por ecosistema.';
          }
        } else {
          fb.className = 'match-feedback visible';
          fb.style.background = 'rgba(244, 63, 94, 0.12)';
          fb.style.color = 'var(--rosa)';
          fb.textContent = '❌ Ese SO no es. ¿Es Android (Linux) o iOS (Unix)?';
          setTimeout(() => fb.classList.remove('visible'), 1500);
        }
        selectedDev = null;
        render();
      });
    });
  };

  document.getElementById('movilReset').addEventListener('click', () => {
    devices.forEach(d => { d.matched = false; delete d.soLabel; });
    options.forEach(o => o.used = false);
    selectedDev = null; aciertos = 0;
    fb.classList.remove('visible');
    render();
  });

  render();
}

/* ---------- SIMULADOR: EMBEBIDO BANK (Módulo 3) ---------- */
function inicializarEmbebidoBank() {
  const bank = document.getElementById('embebidoBank');
  const wrap = document.getElementById('embebidoWrap');
  if (!bank || !wrap) return;

  const items = [
    { id: 'e1', label: '🖥️ Pantalla táctil del auto', recurso: 'medio' },
    { id: 'e2', label: '📡 Chip del router WiFi', recurso: 'minimo' },
    { id: 'e3', label: '🧠 Placa del marcapasos', recurso: 'minimo' },
    { id: 'e4', label: '📺 Sistema de la Smart TV', recurso: 'medio' },
    { id: 'e5', label: '🎮 Control remoto infrarrojo', recurso: 'minimo' },
    { id: 'e6', label: '🚗 Computadora del coche (ECU)', recurso: 'medio' },
    { id: 'e7', label: '🔌 Microondas', recurso: 'minimo' },
    { id: 'e8', label: '📷 Cámara de seguridad IP', recurso: 'medio' }
  ];

  let colocados = {};

  const render = () => {
    bank.innerHTML = items.map(it =>
      `<div class="drag-item ${colocados[it.id] ? 'placed' : ''}" data-id="${it.id}" data-recurso="${it.recurso}" draggable="true">${colocados[it.id] ? '✓ ' : ''}${it.label}</div>`
    ).join('');

    wrap.querySelectorAll('.emb-capa').forEach(capa => {
      const cid = capa.dataset.recurso;
      const drops = capa.querySelector('[data-drops]');
      const itemsHere = Object.entries(colocados).filter(([_, c]) => c === cid);
      drops.innerHTML = itemsHere.map(([iid]) => {
        const it = items.find(x => x.id === iid);
        return `<span class="chip-layer">${it.label} <span class="x" data-remove="${iid}">✕</span></span>`;
      }).join('');
    });

    const ok = Object.keys(colocados).length;
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
      capa.addEventListener('dragover', e => { e.preventDefault(); capa.classList.add('over'); });
      capa.addEventListener('dragleave', () => capa.classList.remove('over'));
      capa.addEventListener('drop', e => {
        e.preventDefault();
        capa.classList.remove('over');
        const id = e.dataTransfer.getData('text/plain');
        const it = items.find(x => x.id === id);
        if (!it || colocados[id]) return;
        const ok = it.recurso === capa.dataset.recurso;
        if (ok) {
          colocados[id] = capa.dataset.recurso;
          capa.classList.add('correcta');
          addXP(2);
        } else {
          capa.classList.add('incorrecta');
          setTimeout(() => capa.classList.remove('incorrecta'), 500);
        }
        render();
      });
    });
    wrap.querySelectorAll('.x').forEach(x => {
      x.addEventListener('click', () => {
        const iid = x.dataset.remove;
        delete colocados[iid];
        render();
      });
    });
  };

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
    const ok = it.recurso === capa.dataset.recurso;
    if (ok) {
      colocados[selected] = capa.dataset.recurso;
      capa.classList.add('correcta');
      addXP(2);
    } else {
      capa.classList.add('incorrecta');
      setTimeout(() => capa.classList.remove('incorrecta'), 500);
    }
    selected = null;
    render();
  });

  document.getElementById('embebidoReset').addEventListener('click', () => {
    colocados = {};
    wrap.querySelectorAll('.capa').forEach(c => c.classList.remove('correcta', 'incorrecta'));
    render();
  });

  render();
}

/* ---------- SIMULADOR: RED CLIENTES (Módulo 5) ---------- */
function inicializarRedClients() {
  const clientsEl = document.getElementById('redClients');
  const serverLoadEl = document.getElementById('redServerLoad');
  const latencyEl = document.getElementById('redLatency');
  const logEl = document.getElementById('redLog');
  const addBtn = document.getElementById('redAddClient');
  const spikeBtn = document.getElementById('redSpike');
  const resetBtn = document.getElementById('redReset');
  if (!clientsEl || !serverLoadEl) return;

  let clients = 0;
  let serverLoad = 0;
  let latency = 12;

  const log = (cls, msg) => {
    const d = document.createElement('div');
    d.className = 'log-line';
    d.innerHTML = `<span class="t">[SO]</span> <span class="${cls}">${msg}</span>`;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
  };

  const render = () => {
    clientsEl.textContent = clients;
    serverLoadEl.textContent = serverLoad + '%';
    latencyEl.textContent = latency + ' ms';
  };

  addBtn.addEventListener('click', () => {
    clients++;
    serverLoad = Math.min(100, serverLoad + Math.floor(Math.random() * 12) + 4);
    latency = Math.max(8, Math.round(12 + clients * 1.4 + (serverLoad / 4)));
    log('ok', `👤 Cliente #${clients} conectado. Carga: ${serverLoad}%. Latencia: ${latency} ms.`);
    render();
    addXP(2);
  });

  spikeBtn.addEventListener('click', () => {
    const before = clients;
    for (let i = 0; i < 20; i++) {
      clients++;
    }
    serverLoad = Math.min(100, serverLoad + 50);
    latency = Math.round(latency * 1.7);
    log('warn', `⚡ PICO: 20 clientes nuevos de golpe. Carga: ${serverLoad}%. Latencia: ${latency} ms.`);
    log('t', `🖥️ El SO servidor reparte CPU entre ${clients} procesos usando un scheduler multiusuario.`);
    render();
    addXP(8);
  });

  resetBtn.addEventListener('click', () => {
    clients = 0; serverLoad = 0; latency = 12;
    logEl.innerHTML = '<div class="log-line"><span class="t">[SO]</span> Servidor reiniciado. Esperando conexiones…</div>';
    render();
  });

  render();
}

/* ---------- SIMULADOR: RTOS DEADLINES (Módulo 6) ---------- */
function inicializarRtosTimeline() {
  const logEl = document.getElementById('rtosLog');
  const cycleEl = document.getElementById('rtosCycle');
  const metEl = document.getElementById('rtosMet');
  const missedEl = document.getElementById('rtosMissed');
  const runBtn = document.getElementById('rtosStep');
  const resetBtn = document.getElementById('rtosReset');
  const allBtn = document.getElementById('rtosAll');
  if (!runBtn) return;

  // 5 tareas con deadlines (en ms) y duración
  const tasks = [
    { id: 'T1', name: '🚗 Freno ABS', deadline: 50, duration: 30, priority: 'alta' },
    { id: 'T2', name: '🎵 Audio Bluetooth', deadline: 150, duration: 20, priority: 'media' },
    { id: 'T3', name: '📊 Display tablero', deadline: 100, duration: 25, priority: 'alta' },
    { id: 'T4', name: '🌡️ Sensor temperatura', deadline: 200, duration: 15, priority: 'baja' },
    { id: 'T5', name: '📡 GPS update', deadline: 1000, duration: 40, priority: 'baja' }
  ];

  let cycle = 0;
  let met = 0;
  let missed = 0;
  let current = 0;
  let autoTimer = null;

  const log = (cls, msg) => {
    const d = document.createElement('div');
    d.className = 'log-line';
    d.innerHTML = `<span class="t">[RTOS]</span> <span class="${cls}">${msg}</span>`;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
  };

  const render = () => {
    cycleEl.textContent = cycle;
    metEl.textContent = met;
    missedEl.textContent = missed;
  };

  const step = () => {
    if (current >= tasks.length) {
      log('ok', '🏁 Todas las tareas ejecutadas. El RTOS cumple el ciclo.');
      render();
      return;
    }
    const t = tasks[current];
    cycle++;
    if (t.duration <= t.deadline) {
      met++;
      log('ok', `✓ ${t.name} (${t.duration}ms) — dentro del deadline ${t.deadline}ms.`);
      addXP(3);
    } else {
      missed++;
      log('err', `✗ ${t.name} (${t.duration}ms) — EXCEDIÓ deadline ${t.deadline}ms. ¡Frenos tardíos!`);
      addXP(1);
    }
    current++;
    render();
  };

  runBtn.addEventListener('click', step);
  allBtn.addEventListener('click', () => {
    if (autoTimer) {
      clearInterval(autoTimer); autoTimer = null;
      allBtn.textContent = '▶️ Ejecutar todas';
      return;
    }
    allBtn.textContent = '⏸️ Pausar';
    autoTimer = setInterval(() => {
      if (current >= tasks.length) {
        clearInterval(autoTimer); autoTimer = null;
        allBtn.textContent = '▶️ Ejecutar todas';
        return;
      }
      step();
    }, 700);
  });
  resetBtn.addEventListener('click', () => {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; allBtn.textContent = '▶️ Ejecutar todas'; }
    current = 0; cycle = 0; met = 0; missed = 0;
    logEl.innerHTML = '<div class="log-line"><span class="t">[RTOS]</span> Planificador de tiempo real reiniciado. Listo.</div>';
    render();
  });

  logEl.innerHTML = '<div class="log-line"><span class="t">[RTOS]</span> Planificador de tiempo real listo. Pulsa "Ejecutar ciclo".</div>';
  render();
}

/* ---------- SIMULADOR: ÁMBITOS × TIPOS (Módulo 7) ---------- */
function inicializarAmbitosMatrix() {
  const bank = document.getElementById('ambitosBank');
  const matrix = document.getElementById('ambitosMatrix');
  if (!bank || !matrix) return;

  // 6 dispositivos a clasificar por tipo de SO (no por celda 2x2 como clase 2)
  const items = [
    { id: 'a1', label: '🖥️ Servidor de Google', tipo: 'red' },
    { id: 'a2', label: '🚗 ECU del coche', tipo: 'embebido' },
    { id: 'a3', label: '📱 Tu celular', tipo: 'movil' },
    { id: 'a4', label: '💻 Laptop del salón', tipo: 'escritorio' },
    { id: 'a5', label: '🚁 Dron de fumigación', tipo: 'rtos' },
    { id: 'a6', label: '📺 Smart TV del hogar', tipo: 'embebido' },
    { id: 'a7', label: '☁️ Servidor de YouTube', tipo: 'red' },
    { id: 'a8', label: '⌚ Apple Watch', tipo: 'movil' }
  ];

  let colocados = {};

  const render = () => {
    bank.innerHTML = items.map(it =>
      `<div class="drag-item ${colocados[it.id] ? 'placed' : ''}" data-id="${it.id}" data-tipo="${it.tipo}" draggable="true">${colocados[it.id] ? '✓ ' : ''}${it.label}</div>`
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
    bank.querySelectorAll('.drag-item:not(.placed)').forEach(d => {
      d.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', d.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
      });
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
        if (it.tipo === cell.dataset.cell) cell.classList.add('correcta');
        render(); addXP(1);
      });
    });
    matrix.querySelectorAll('.x').forEach(x => {
      x.addEventListener('click', () => { delete colocados[x.dataset.remove]; render(); });
    });
  };

  let selected = null;
  bank.addEventListener('click', e => {
    const d = e.target.closest('.drag-item:not(.placed)');
    if (!d) return;
    selected = d.dataset.id;
    bank.querySelectorAll('.drag-item').forEach(x => x.style.borderColor = '');
    d.style.borderColor = 'var(--cian)';
  });
  matrix.addEventListener('click', e => {
    const cell = e.target.closest('.class-cell');
    if (!cell || !selected) return;
    const it = items.find(x => x.id === selected);
    if (!it || colocados[selected]) return;
    colocados[selected] = cell.dataset.cell;
    if (it.tipo === cell.dataset.cell) cell.classList.add('correcta');
    selected = null;
    render(); addXP(1);
  });

  document.getElementById('ambitosReset').addEventListener('click', () => {
    colocados = {};
    matrix.querySelectorAll('.class-cell').forEach(c => c.classList.remove('correcta'));
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