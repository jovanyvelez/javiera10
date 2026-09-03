/* ============================================================
   CLASE 5 — HERRAMIENTAS DE PROGRAMACIÓN I
   (Introducción a CSS: selectores, colores y tipografía)
   ============================================================ */

const STORAGE_KEY = 'curso-introduccion-css';
const TOTAL_MODULOS = 8;
const XP_TOTAL = 640;

const LABELS_MODULOS = ['Inicio', '¿Qué es CSS?', 'Selectores', 'Colores', 'Descanso', 'Tipografía', 'Cascada y especificidad', 'Taller'];
const BADGES_MODULO = {
  0: '🚀 Iniciado',
  1: '🎨 Estilista',
  2: '🎯 Selector',
  3: '🌈 Colorista',
  4: '☕ Descansado',
  5: '🔤 Tipógrafo',
  6: '⚖️ Juez CSS',
  7: '🛠️ Estilista CSS'
};

const estado = {
  moduloActual: 0,
  completados: new Set(),
  quizzes: {},
  talleres: {},
  badges: new Set(),
  xp: 0,
  // Entrega en el repositorio (módulo 7)
  pasos: new Set(),
  autoeval: new Set(),
  usuarioGithub: '',
  publicado: false
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
  configurarEntregaRepo();
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
      xp: estado.xp,
      pasos: [...estado.pasos],
      autoeval: [...estado.autoeval],
      usuarioGithub: estado.usuarioGithub,
      publicado: estado.publicado
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
    estado.pasos = new Set(datos.pasos || []);
    estado.autoeval = new Set(datos.autoeval || []);
    estado.usuarioGithub = datos.usuarioGithub || '';
    estado.publicado = datos.publicado || false;
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
        result.textContent = '❌ Casi. La "C" es de Cascading (en cascada). ¡A seguir!';
      }
    });
  });
}

/* ---------- TALLER ---------- */
const TALLER_RESP = {
  1: { '1a': '1A', '1b': '1B', '1c': '1C' },
  4: { '4a': '4A' }
};
const TALLER_ORDER = {
  2: ['2etiqueta', '2clase', '2id']
};
const TALLER_INPUT = { 3: 'red' };
const TALLER_MSGS = {
  1: '¡Perfecto! id="app-titulo"→#app-titulo, class="tarea"→.tarea y todos los h2→h2.',
  2: '¡Correcto! De menor a mayor: h3 → .tarea h3 → #lista .tarea h3.',
  3: '¡Bien! Esa regla pinta #app-titulo de rojo en tu styles.css.',
  4: '🏆 ¡JEFE FINAL VENCIDO! #lista .tarea h3 gana: el id le da la mayor especificidad.'
};
const TALLER_HINTS = {
  1: 'Pista: id→#nombre, class→.nombre, etiqueta→el nombre tal cual.',
  2: 'Pista: etiqueta < clase < id + clase.',
  3: 'Pista: el nombre del color es "red".',
  4: 'Pista: el selector que lleva #id tiene más especificidad que los demás.'
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
      otorgarBadge('🛠️ Estilista CSS Completado');
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

/* ============================================================
   ENTREGA EN EL REPOSITORIO (módulo 7)
   Mismo repositorio creado en la clase 1: claseNN/ + proyecto/
   ============================================================ */
const TOTAL_PASOS = 5;
const XP_POR_PASO = 10;
const XP_PUBLICACION = 30;
const TOTAL_AUTOEVAL = 6;
const REPO_NOMBRE = 'herramientas-programacion';
const CARPETA_CLASE = 'clase05';

const RE_USUARIO = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
const RE_PAGES = /^https?:\/\/([a-z\d-]+)\.github\.io(?:\/([^/\s?#]+))?\/?([^\s?#]*)$/i;

function configurarEntregaRepo() {
  const pasosBtns = document.querySelectorAll('[data-paso-check]');
  if (!pasosBtns.length) return;

  pasosBtns.forEach(btn => {
    btn.addEventListener('click', () => alternarPaso(btn.dataset.pasoCheck));
  });

  const inputUsuario = document.getElementById('gh-usuario');
  const btnGenerar = document.getElementById('gh-generar');
  if (btnGenerar && inputUsuario) {
    btnGenerar.addEventListener('click', () => generarEnlaces());
    inputUsuario.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); generarEnlaces(); }
    });
  }

  const btnVerificar = document.getElementById('gh-verificar');
  const inputFinal = document.getElementById('gh-url-final');
  if (btnVerificar && inputFinal) {
    btnVerificar.addEventListener('click', () => verificarPublicacion());
    inputFinal.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); verificarPublicacion(); }
    });
  }

  document.querySelectorAll('[data-autoeval]').forEach(chk => {
    chk.addEventListener('change', () => {
      const id = chk.dataset.autoeval;
      if (chk.checked) estado.autoeval.add(id);
      else estado.autoeval.delete(id);
      if (estado.autoeval.size === TOTAL_AUTOEVAL) otorgarBadge('📋 Autoevaluado');
      guardarProgreso();
    });
  });

  restaurarEntregaRepo();
}

function restaurarEntregaRepo() {
  estado.pasos.forEach(id => pintarPaso(id, true));
  estado.autoeval.forEach(id => {
    const chk = document.querySelector(`[data-autoeval="${id}"]`);
    if (chk) chk.checked = true;
  });
  const inputUsuario = document.getElementById('gh-usuario');
  if (inputUsuario && estado.usuarioGithub) {
    inputUsuario.value = estado.usuarioGithub;
    generarEnlaces(true);
  }
  if (estado.publicado) {
    const fb = document.getElementById('ws-fb-github');
    if (fb) {
      fb.className = 'resultado-ws visible ok';
      fb.innerHTML = '✅ Ya validaste tu entrega de esta clase. Puedes volver a comprobarla cuando quieras.';
    }
  }
  actualizarProgresoPasos();
}

function alternarPaso(id) {
  if (estado.pasos.has(id)) {
    estado.pasos.delete(id);
    pintarPaso(id, false);
  } else {
    estado.pasos.add(id);
    pintarPaso(id, true);
    if (!estado.talleres['paso-' + id]) {
      estado.talleres['paso-' + id] = true;
      addXP(XP_POR_PASO);
      mostrarToast(`✅ Paso ${id} completado · +${XP_POR_PASO} XP`);
    }
    if (estado.pasos.size === TOTAL_PASOS) {
      otorgarBadge('📦 Entrega Publicada');
      mostrarToast('🎉 ¡Entrega completa! Verifica tu enlace.');
    }
  }
  actualizarProgresoPasos();
  guardarProgreso();
}

function pintarPaso(id, hecho) {
  const bloque = document.querySelector(`.paso[data-paso="${id}"]`);
  const btn = document.querySelector(`[data-paso-check="${id}"]`);
  if (bloque) bloque.classList.toggle('hecho', hecho);
  if (btn) {
    btn.classList.toggle('ok', hecho);
    if (hecho) {
      if (!btn.dataset.textoOriginal) btn.dataset.textoOriginal = btn.textContent;
      btn.textContent = '✔ Paso completado (clic para desmarcar)';
    } else if (btn.dataset.textoOriginal) {
      btn.textContent = btn.dataset.textoOriginal;
    }
  }
}

function actualizarProgresoPasos() {
  const cuenta = document.getElementById('pasos-hechos');
  const barra = document.getElementById('barra-pasos');
  const hechos = estado.pasos.size;
  if (cuenta) cuenta.textContent = hechos;
  if (barra) barra.style.width = Math.round((hechos / TOTAL_PASOS) * 100) + '%';
}

function limpiarUsuario(valor) {
  return valor
    .trim()
    .toLowerCase()
    .replace(/^@/, '')
    .replace(/^https?:\/\//, '')
    .replace(/\.github\.io.*$/, '')
    .replace(/^github\.com\//, '')
    .replace(/\/.*$/, '')
    .replace(/\s+/g, '');
}

function generarEnlaces(silencioso) {
  const input = document.getElementById('gh-usuario');
  const salida = document.getElementById('gh-urls');
  if (!input || !salida) return;

  const usuario = limpiarUsuario(input.value);
  if (!usuario) {
    salida.innerHTML = '<p class="url-aviso">✏️ Escribe tu nombre de usuario de GitHub para armar tus enlaces.</p>';
    salida.classList.add('visible');
    return;
  }
  if (!RE_USUARIO.test(usuario)) {
    salida.innerHTML = '<p class="url-aviso error">⚠️ Ese usuario no parece válido. En GitHub solo se usan letras, números y guiones.</p>';
    salida.classList.add('visible');
    return;
  }

  input.value = usuario;
  const base = `https://${usuario}.github.io/${REPO_NOMBRE}/`;

  salida.innerHTML = `
    <div class="url-fila">
      <span class="url-etiqueta">⭐ Tu aplicación (el proyecto)</span>
      <a class="url-valor" href="${base}proyecto/" target="_blank" rel="noopener">${base}proyecto/</a>
    </div>
    <div class="url-fila">
      <span class="url-etiqueta">📄 El ejercicio de hoy</span>
      <a class="url-valor" href="${base}${CARPETA_CLASE}/" target="_blank" rel="noopener">${base}${CARPETA_CLASE}/</a>
    </div>
    <div class="url-fila">
      <span class="url-etiqueta">🌐 Tu portada <em>(esto entregas)</em></span>
      <a class="url-valor" href="${base}" target="_blank" rel="noopener">${base}</a>
    </div>
    <p class="url-aviso">📌 Si alguna da error 404, espera 2 minutos y recarga con Ctrl + F5.</p>
  `;
  salida.classList.add('visible');

  const final = document.getElementById('gh-url-final');
  if (final) {
    final.placeholder = base + 'proyecto/';
    if (!final.value) final.value = base + 'proyecto/';
  }

  if (estado.usuarioGithub !== usuario) {
    estado.usuarioGithub = usuario;
    guardarProgreso();
  }
  if (!silencioso) mostrarToast('🔗 Enlaces generados. ¡Ábrelos para comprobar!');
}

function verificarPublicacion() {
  const input = document.getElementById('gh-url-final');
  const fb = document.getElementById('ws-fb-github');
  if (!input || !fb) return;

  const valor = input.value.trim();
  fb.classList.add('visible');

  const fallo = (msg) => {
    fb.className = 'resultado-ws visible no';
    fb.innerHTML = msg;
  };

  if (!valor) {
    fallo('✏️ Pega primero la dirección de tu página publicada (empieza por <code>https://</code>).');
    return;
  }
  if (/github\.com/i.test(valor)) {
    const m = valor.match(/github\.com\/([^/\s]+)\/([^/\s?#]+)/i);
    const sugerencia = m ? `<br>La tuya sería: <code>https://${m[1].toLowerCase()}.github.io/${m[2]}/</code>` : '';
    fallo(`❌ Esa es la dirección de tu <strong>código</strong>, no la de tu <strong>página publicada</strong>. La de la página contiene <code>.github.io</code>.${sugerencia}`);
    return;
  }
  if (!/^https?:\/\//i.test(valor)) {
    fallo('❌ Le falta el inicio: la dirección debe empezar por <code>https://</code>.');
    return;
  }

  const m = valor.match(RE_PAGES);
  if (!m) {
    fallo(`❌ Esa dirección no parece de GitHub Pages. Debe tener la forma <code>https://tu-usuario.github.io/${REPO_NOMBRE}/proyecto/</code>.`);
    return;
  }

  const usuario = m[1].toLowerCase();
  const repo = (m[2] || '').toLowerCase();
  const resto = (m[3] || '').toLowerCase();

  let extra = '';
  if (repo && repo !== REPO_NOMBRE) {
    extra += `<br>💡 Tu repositorio se llama <code>${repo}</code> y en clase acordamos <code>${REPO_NOMBRE}</code>. Funciona, pero avísale a tu profesor/a.`;
  }
  if (!resto.includes('proyecto') && !resto.includes(CARPETA_CLASE)) {
    extra += `<br>💡 Esa es tu portada. Comprueba también <code>${CARPETA_CLASE}/</code> y <code>proyecto/</code>, que son la entrega de hoy.`;
  }

  fb.className = 'resultado-ws visible ok';
  fb.innerHTML = `✅ ¡Bien, <strong>${usuario}</strong>! Es una dirección válida de GitHub Pages. Ábrela y confirma que se ve tu trabajo de hoy.${extra}` +
    (estado.publicado ? '' : ` <strong>+${XP_PUBLICACION} XP</strong>`);

  if (!estado.publicado) {
    estado.publicado = true;
    addXP(XP_PUBLICACION);
    otorgarBadge('🌐 Publicado en Internet');
  }
  if (!estado.pasos.has('5')) alternarPaso('5');

  const inputUsuario = document.getElementById('gh-usuario');
  if (inputUsuario && !inputUsuario.value) {
    inputUsuario.value = usuario;
    generarEnlaces(true);
  }
  guardarProgreso();
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
  inicializarFormasCSS();
  inicializarSelectores();
  inicializarColores();
  inicializarTipografia();
  inicializarMarcado();
  inicializarLabEstilos();
}

const CSS_FORMAS = {
  externo: {
    nombre: 'Externo',
    cuando: 'Reutilizable en varias páginas',
    codigo: '&lt;head&gt;\n  &lt;link rel="stylesheet" href="styles.css"&gt;\n&lt;/head&gt;'
  },
  interno: {
    nombre: 'Interno',
    cuando: 'Para una sola página pequeña',
    codigo: '&lt;head&gt;\n  &lt;style&gt;\n    p { color: red; }\n  &lt;/style&gt;\n&lt;/head&gt;'
  },
  enlinea: {
    nombre: 'En línea',
    cuando: 'Casos puntuales (evítalo)',
    codigo: '&lt;p style="color: red;"&gt;Hola&lt;/p&gt;'
  }
};

function inicializarFormasCSS() {
  const formaEl = document.getElementById('css-forma');
  const cuandoEl = document.getElementById('css-cuando');
  const ejemploEl = document.getElementById('css-ejemplo');
  const fbTxt = document.getElementById('css-feedback-txt');
  if (!formaEl) return;
  document.querySelectorAll('[data-css]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.css;
      const info = CSS_FORMAS[key];
      formaEl.textContent = info.nombre;
      cuandoEl.textContent = info.cuando;
      ejemploEl.innerHTML = info.codigo;
      fbTxt.textContent = info.nombre + ': ' + info.cuando + '.';
      addXP(1);
    });
  });
}

const SEL_INFO = {
  etiqueta: {
    nombre: 'Etiqueta',
    que: 'Todos los elementos de esa etiqueta',
    html: '&lt;!-- No hay que marcar nada: la etiqueta ES la marca --&gt;\n&lt;p&gt;Organiza lo que tienes que hacer&lt;/p&gt;\n&lt;p&gt;Categoría: estudio&lt;/p&gt;',
    codigo: 'p {\n  color: #cbd5e1;\n}'
  },
  clase: {
    nombre: 'Clase',
    que: 'Todos los elementos con class="tarea"',
    html: '&lt;article class="tarea"&gt;…&lt;/article&gt;\n&lt;article class="tarea"&gt;…&lt;/article&gt;\n&lt;span class="tarea"&gt;…&lt;/span&gt;',
    codigo: '.tarea {\n  background: #0c1626;\n  border: 1px solid #1c3252;\n}'
  },
  id: {
    nombre: 'Id',
    que: 'El único elemento con id="app-titulo"',
    html: '&lt;h1 id="app-titulo"&gt;Mi Gestor de Tareas&lt;/h1&gt;\n&lt;!-- En TODA la página solo hay un id="app-titulo" --&gt;',
    codigo: '#app-titulo {\n  color: #22d3ee;\n}'
  },
  universal: {
    nombre: 'Universal',
    que: 'Todos los elementos de la página',
    html: '&lt;body&gt;\n  &lt;header&gt;…&lt;/header&gt;\n  &lt;main&gt;…&lt;/main&gt;\n  &lt;!-- absolutamente todo --&gt;\n&lt;/body&gt;',
    codigo: '* {\n  margin: 0;\n}'
  }
};

function inicializarSelectores() {
  const nombreEl = document.getElementById('sel-nombre');
  const queEl = document.getElementById('sel-que');
  const ejemploEl = document.getElementById('sel-ejemplo');
  const htmlEl = document.getElementById('sel-html');
  const fbTxt = document.getElementById('sel-feedback-txt');
  if (!nombreEl) return;
  document.querySelectorAll('[data-sel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.sel;
      const info = SEL_INFO[key];
      nombreEl.textContent = info.nombre;
      queEl.textContent = info.que;
      if (htmlEl) htmlEl.innerHTML = info.html;
      ejemploEl.innerHTML = info.codigo;
      fbTxt.textContent = info.nombre + ': ' + info.que + '.';
      addXP(1);
    });
  });
}

const COL_INFO = {
  nombre: { formato: 'Nombre', valor: 'red' },
  hex: { formato: 'Hexadecimal', valor: '#ff0000' },
  rgb: { formato: 'RGB', valor: 'rgb(255, 0, 0)' },
  hsl: { formato: 'HSL', valor: 'hsl(0, 100%, 50%)' }
};

function inicializarColores() {
  const formatoEl = document.getElementById('col-formato');
  const valorEl = document.getElementById('col-valor');
  const muestraEl = document.getElementById('col-muestra');
  const fbTxt = document.getElementById('col-feedback-txt');
  if (!formatoEl) return;
  document.querySelectorAll('[data-col]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.col;
      const info = COL_INFO[key];
      formatoEl.textContent = info.formato;
      valorEl.textContent = info.valor;
      muestraEl.style.background = '#ff0000';
      fbTxt.textContent = 'El color rojo en ' + info.formato + ' se escribe: ' + info.valor + '.';
      addXP(1);
    });
  });
}

const TIPO_INFO = {
  familia: {
    codigo: 'p {\n  font-family: Arial;\n}',
    desc: 'font-family elige la fuente o tipo de letra.'
  },
  tamano: {
    codigo: 'p {\n  font-size: 16px;\n}',
    desc: 'font-size controla el tamaño de la letra.'
  },
  grosor: {
    codigo: 'p {\n  font-weight: bold;\n}',
    desc: 'font-weight controla el grosor (normal, bold, 100-900).'
  },
  linea: {
    codigo: 'p {\n  line-height: 1.5;\n}',
    desc: 'line-height controla el espacio entre líneas.'
  }
};

function inicializarTipografia() {
  const previewEl = document.getElementById('tipo-preview');
  const codigoEl = document.getElementById('tipo-codigo');
  const fbTxt = document.getElementById('tipo-feedback-txt');
  if (!previewEl) return;
  document.querySelectorAll('[data-tipo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.tipo;
      const info = TIPO_INFO[key];
      codigoEl.innerHTML = info.codigo;
      fbTxt.textContent = info.desc;
      if (key === 'familia') {
        previewEl.style.fontFamily = 'Georgia, serif';
      } else if (key === 'tamano') {
        previewEl.style.fontSize = '1.6rem';
      } else if (key === 'grosor') {
        previewEl.style.fontWeight = '900';
      } else if (key === 'linea') {
        previewEl.style.lineHeight = '2.2';
      }
      addXP(1);
    });
  });
}

/* ---------- MINI-LABORATORIO DE MARCADO (módulo 2) ---------- */
const MARCA_ESTADOS = {
  clase: {
    sin: '&lt;article&gt;Tarjeta 1 — sin marca&lt;/article&gt;',
    con: '&lt;article class="tarea"&gt;Tarjeta 1 — con class&lt;/article&gt;'
  },
  id: {
    sin: '&lt;h4&gt;Encabezado sin marca&lt;/h4&gt;',
    con: '&lt;h4 id="titulo"&gt;Encabezado con id&lt;/h4&gt;'
  }
};

function inicializarMarcado() {
  const htmlEl = document.getElementById('marca-html');
  const previewEl = document.getElementById('marca-preview');
  const fbTxt = document.getElementById('marca-feedback-txt');
  if (!htmlEl || !previewEl) return;

  const h = previewEl.querySelector('#marca-h');
  const tarjetas = previewEl.querySelectorAll('.marca-card');
  const conClase = estado.talleres['marca-clase'];
  const conId = estado.talleres['marca-id'];
  if (conClase) pintarMarcado(previewEl, tarjetas, h, 'clase', htmlEl, fbTxt);
  if (conId) pintarMarcado(previewEl, tarjetas, h, 'id', htmlEl, fbTxt);
  if (!conClase && !conId) {
    htmlEl.innerHTML = '&lt;h4&gt;Encabezado sin marca&lt;/h4&gt;\n&lt;article&gt;Tarjeta 1 — sin marca&lt;/article&gt;\n&lt;article&gt;Tarjeta 2 — sin marca&lt;/article&gt;';
  }

  document.querySelectorAll('[data-marca]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tipo = btn.dataset.marca;
      const ya = estado.talleres['marca-' + tipo];
      pintarMarcado(previewEl, tarjetas, h, tipo, htmlEl, fbTxt);
      if (!ya) {
        estado.talleres['marca-' + tipo] = true;
        addXP(5);
        mostrarToast(tipo === 'clase' ? '🔖 Clase asignada: .tarea se pinta' : '🆔 Id asignado: #titulo se pinta');
      }
      guardarProgreso();
    });
  });

  const reset = document.getElementById('marca-reset');
  if (reset) {
    reset.addEventListener('click', () => {
      previewEl.classList.remove('mp-clase', 'mp-id');
      tarjetas.forEach(t => { t.textContent = t.textContent.replace(' — con class', ' — sin marca'); });
      if (h) h.textContent = 'Encabezado sin marca';
      htmlEl.innerHTML = '&lt;h4&gt;Encabezado sin marca&lt;/h4&gt;\n&lt;article&gt;Tarjeta 1 — sin marca&lt;/article&gt;\n&lt;article&gt;Tarjeta 2 — sin marca&lt;/article&gt;';
      if (fbTxt) fbTxt.textContent = 'Sin marcas, el CSS de .tarea y #titulo no encuentra a nadie.';
      delete estado.talleres['marca-clase'];
      delete estado.talleres['marca-id'];
      guardarProgreso();
    });
  }
}

function pintarMarcado(previewEl, tarjetas, h, tipo, htmlEl, fbTxt) {
  if (tipo === 'clase') {
    previewEl.classList.add('mp-clase');
    tarjetas.forEach((t, i) => { t.textContent = 'Tarjeta ' + (i + 1) + ' — con class'; });
    htmlEl.innerHTML = MARCA_ESTADOS.clase.con + '\n&lt;article class="tarea"&gt;Tarjeta 2 — con class&lt;/article&gt;\n&lt;article class="tarea"&gt;Tarjeta 3 — con class&lt;/article&gt;';
    if (fbTxt) fbTxt.textContent = 'Con class="tarea", el selector .tarea encontró a las 3 tarjetas a la vez.';
  } else if (tipo === 'id') {
    previewEl.classList.add('mp-id');
    if (h) h.textContent = 'Encabezado con id';
    htmlEl.innerHTML = MARCA_ESTADOS.id.con + '\n&lt;article class="tarea"&gt;Tarjeta 1 — con class&lt;/article&gt;';
    if (fbTxt) fbTxt.textContent = 'Con id="titulo", el selector #titulo encontró solo al encabezado: es único.';
  }
}

/* ---------- LABORATORIO DE ESTILOS — EDITOR VIVO (módulo 6) ---------- */
const LAB_CSS_INICIAL =
`/* CSS de tu gestor de tareas. ¡Edítalo! */
body {
  background: #06101a;
  color: #e6f1ff;
  font-family: Arial, sans-serif;
  padding: 20px;
}

#app-titulo {
  color: #22d3ee;
}

.tarea {
  background: #0c1626;
  border: 1px solid #1c3252;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 10px;
}`;

const LAB_MISIONES = {
  titulo: {
    texto: 'Pinta el título de ámbar',
    test: (editor, preview) => getComputedStyle(preview.querySelector('#app-titulo')).color === 'rgb(250, 204, 21)',
    ok: '¡Misión 1 cumplida! #app-titulo quedó en ámbar (#facc15). Un selector de id, una regla.',
    pendiente: 'En el editor, dentro de la regla #app-titulo, cambia color por #facc15 (el ámbar).'
  },
  fuente: {
    texto: 'Cambia la fuente de la app',
    test: (editor, preview) => getComputedStyle(preview.querySelector('body')).fontFamily.toLowerCase().includes('georgia') || /verdana|courier|tahoma|impact/i.test(getComputedStyle(preview.querySelector('body')).fontFamily),
    ok: '¡Misión 2 cumplida! La propiedad font-family de body cambió toda la app de golpe: una regla, toda la página.',
    pendiente: 'En la regla body, cambia font-family por Georgia, Verdana o Tahoma (¡recuerda el módulo 5!).'
  },
  tareas: {
    texto: 'Agranda el texto de las tareas',
    test: (editor, preview) => parseFloat(getComputedStyle(preview.querySelector('.tarea h3')).fontSize) >= 19,
    ok: '¡Misión 3 cumplida! El texto de .tarea creció. Fíjate: una sola clase estilizó las 3 tarjetas.',
    pendiente: 'Añade a la regla .tarea una propiedad font-size (por ejemplo 20px), o crea la regla .tarea h3 con font-size.'
  }
};

function inicializarLabEstilos() {
  const editor = document.getElementById('lab-editor');
  const preview = document.getElementById('lab-preview');
  const fbTxt = document.getElementById('lab-feedback-txt');
  const fbCaja = document.getElementById('lab-feedback');
  if (!editor || !preview) return;

  let estilo = document.getElementById('lab-estilo-vivo');
  if (!estilo) {
    estilo = document.createElement('style');
    estilo.id = 'lab-estilo-vivo';
    document.head.appendChild(estilo);
  }

  let timer = null;
  const aplicar = () => {
    estilo.textContent = '#lab-preview { all: initial; } ' + editor.value;
    aplicarPreviewBase(preview);
    if (fbTxt) fbTxt.textContent = 'CSS aplicado en vivo. Cambia un valor y mira: si algo no responde, revisa el punto y coma y las llaves { }.';
    estado.talleres['lab-css'] = editor.value;
  };

  editor.value = LAB_CSS_INICIAL;
  aplicar();
  editor.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(aplicar, 250);
  });

  const btnReset = document.getElementById('lab-reset');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      editor.value = LAB_CSS_INICIAL;
      aplicar();
      if (fbTxt) fbTxt.textContent = 'CSS inicial restaurado. El experimento puede volver a empezar.';
      if (fbCaja) {
        fbCaja.classList.remove('lab-ok');
      }
      guardarProgreso();
    });
  }

  document.querySelectorAll('#lab-misiones [data-mision]').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = LAB_MISIONES[btn.dataset.mision];
      if (!m) return;
      aplicar();
      const cumplida = m.test(editor, preview);
      if (cumplida) {
        if (fbCaja) fbCaja.classList.add('lab-ok');
        if (fbTxt) fbTxt.textContent = '✅ ' + m.ok;
        if (!estado.talleres['lab-' + btn.dataset.mision]) {
          estado.talleres['lab-' + btn.dataset.mision] = true;
          addXP(10);
          mostrarToast('🎯 ¡Misión cumplida! +10 XP');
        }
        const todas = Object.keys(LAB_MISIONES).every(k => estado.talleres['lab-' + k]);
        if (todas && !estado.badges.has('⚡ Experimentador CSS')) otorgarBadge('⚡ Experimentador CSS');
      } else {
        if (fbCaja) fbCaja.classList.remove('lab-ok');
        if (fbTxt) fbTxt.textContent = '🤔 Todavía no. ' + m.pendiente;
      }
      guardarProgreso();
    });
  });

  restaurarLabEstilos(editor, aplicar);
}

function aplicarPreviewBase(preview) {
  preview.style.background = '#0a1220';
  preview.style.color = '#e6f1ff';
  preview.style.padding = '16px';
  preview.style.borderRadius = '10px';
  preview.style.minHeight = '100%';
  const parrafos = preview.querySelectorAll('p, h2');
  parrafos.forEach(el => {
    if (el.tagName === 'P') { el.style.margin = '0 0 6px'; el.style.opacity = '0.85'; }
    if (el.tagName === 'H2') { el.style.margin = '14px 0 8px'; }
  });
  const input = preview.querySelector('input');
  if (input) {
    input.style.display = 'block';
    input.style.width = '100%';
    input.style.padding = '8px 10px';
    input.style.borderRadius = '8px';
    input.style.border = '1px solid #1c3252';
    input.style.background = '#0c1626';
    input.style.color = '#e6f1ff';
    input.style.marginBottom = '8px';
  }
  const boton = preview.querySelector('button');
  if (boton) {
    boton.style.padding = '8px 14px';
    boton.style.borderRadius = '8px';
    boton.style.border = 'none';
    boton.style.cursor = 'pointer';
  }
}

function restaurarLabEstilos(editor, aplicar) {
  const guardado = estado.talleres['lab-css'];
  if (typeof guardado === 'string' && guardado) {
    editor.value = guardado;
    aplicar();
  }
}
