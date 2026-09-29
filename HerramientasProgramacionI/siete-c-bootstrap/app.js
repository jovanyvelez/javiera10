/* ============================================================
   CLASE 7C — HERRAMIENTAS DE PROGRAMACIÓN I
   (Bootstrap: componentes con clases)
   Nota: esta página carga Bootstrap 5 desde el CDN, por eso
   las clases internas renombradas en estilos.css:
   .btn → .boton, .badge → .insignia, .lead → .entradilla
   ============================================================ */

const STORAGE_KEY = 'curso-bootstrap';
const TOTAL_MODULOS = 8;
const XP_TOTAL = 640;

const LABELS_MODULOS = ['Inicio', 'Qué es Bootstrap', 'Contenedores y columnas', 'Botones y utilidades', 'Descanso', 'Cards y navbar', 'Formularios y tablas', 'Taller'];
const BADGES_MODULO = {
  0: '🚀 Iniciado',
  1: '⚡ Conectado',
  2: '📦 Retículo',
  3: '🔘 Utilidades',
  4: '☕ Descansado',
  5: '🗂️ Constructor',
  6: '📋 Formulario Pro',
  7: '🛠️ Constructor de Interfaces'
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
  verificarBootstrap();
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
      span.className = 'insignia';
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
        result.textContent = '✅ ¡Correcto! En Bootstrap los estilos llegan por las clases que escribes en el HTML. ¡Volvamos!';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Casi. Bootstrap aplica sus estilos a partir de las clases del HTML. ¡A seguir!';
      }
    });
  });
}

/* ---------- TALLER ---------- */
const TALLER_RESP = {
  1: { '1a': '1A', '1b': '1B', '1c': '1C', '1d': '1D' },
  4: { '4a': '4A', '4b': '4B', '4c': '4C' }
};
const TALLER_ORDER = {
  2: ['2row', '2col', '2card', '2body', '2title']
};
const TALLER_INPUT = { 3: 'primary' };
const TALLER_MSGS = {
  1: '¡Perfecto! btn btn-primary = botón azul, card-body = aire interior, container = ancho limitado y centrado, text-center = texto centrado.',
  2: '¡Excelente! row → col → card → card-body → card-title.',
  3: '¡Bien! btn aporta la forma y btn-primary le pone el color azul.',
  4: '🏆 ¡JEFE FINAL VENCIDO! card para las tarjetas, form-control para los campos y btn btn-primary en vez de copiar el CSS cuatro veces.'
};
const TALLER_HINTS = {
  1: 'Pista: btn = botón, card-body = aire interior, container = caja que centra, text-center = alinear texto.',
  2: 'Pista: de afuera hacia adentro, empezando por la fila de columnas.',
  3: 'Pista: la variante de color del botón azul es "primary".',
  4: 'Pista: una clase por problema: tarjeta → card, campo → form-control, botón → btn.'
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
    if (Object.keys(TALLER_MSGS).every(k => estado.talleres[k])) {
      otorgarBadge('🛠️ Constructor de Interfaces Completado');
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
const CARPETA_CLASE = 'clase07c';

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


/* ============================================================
   SIMULADORES DE BOOTSTRAP
   Todos ellos fabrican HTML real con las clases verdaderas de
   Bootstrap: lo que se ve en pantalla es lo que hace el
   framework, no una imitación.
   ============================================================ */
function inicializarSimuladores() {
  inicializarComprobadorCdn();
  inicializarFilaColumnas();
  inicializarTraductor();
  inicializarConstructorCard();
  inicializarDesmontarForm();
}

/* Muestra HTML como texto dentro de los bloques de código */
function escaparHtml(texto) {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* --- ¿Entró la hoja de estilos del CDN? --- */
function leerSonda() {
  const sonda = document.createElement('button');
  sonda.className = 'btn';
  sonda.textContent = 'sonda';
  sonda.setAttribute('aria-hidden', 'true');
  sonda.style.position = 'absolute';
  sonda.style.left = '-9999px';
  document.body.appendChild(sonda);
  const cs = getComputedStyle(sonda);
  const datos = {
    borderRadius: cs.borderRadius,
    padding: cs.padding,
    fontSize: cs.fontSize,
    display: cs.display
  };
  sonda.remove();
  return datos;
}

function bootstrapCargado() {
  const d = leerSonda();
  return d.borderRadius !== '0px' && d.padding !== '0px';
}

function pintarSonda() {
  const d = leerSonda();
  const ok = bootstrapCargado();
  const radio = document.getElementById('bs-sonda-radio');
  const padding = document.getElementById('bs-sonda-padding');
  const fuente = document.getElementById('bs-sonda-fuente');
  const veredicto = document.getElementById('bs-sonda-veredicto');
  const detalle = document.getElementById('bs-detalle');

  if (radio) radio.textContent = d.borderRadius;
  if (padding) padding.textContent = d.padding;
  if (fuente) fuente.textContent = d.fontSize;
  if (veredicto) {
    veredicto.textContent = ok ? '✅ Sí' : '❌ No';
    veredicto.style.color = ok ? 'var(--verde)' : 'var(--rosa)';
  }

  if (detalle) {
    detalle.innerHTML =
      '<span class="cm">/* El navegador responde por un &lt;button class="btn"&gt; */</span>\n' +
      'border-radius: <span class="num">' + d.borderRadius + '</span>\n' +
      'padding:        <span class="num">' + d.padding + '</span>\n' +
      'font-size:      <span class="num">' + d.fontSize + '</span>\n\n' +
      (ok
        ? '<span class="cm">/* .btn trae esas medidas: viene de bootstrap.min.css ✓ */</span>'
        : '<span class="cm">/* Todo a 0: la hoja de Bootstrap no llegó. Revisa el &lt;link&gt; */</span>');
  }

  const aviso = document.getElementById('bs-offline');
  if (aviso) aviso.classList.toggle('visible', !ok);
  if (ok && !estado.talleres['cdn']) {
    estado.talleres['cdn'] = true;
    addXP(5);
    mostrarToast('✅ ¡Bootstrap está cargado! +5 XP');
  }
}

function inicializarComprobadorCdn() {
  const btn = document.getElementById('bs-comprobar');
  if (!btn) return;
  btn.addEventListener('click', pintarSonda);
}

function verificarBootstrap() {
  if (!bootstrapCargado()) {
    const aviso = document.getElementById('bs-offline');
    if (aviso) aviso.classList.add('visible');
  }
}

/* --- Constructor de filas: container + row + col --- */
const ANCHOS_COL = { 12: '100%', 6: '50%', 4: '33,3%', 3: '25%' };

function inicializarFilaColumnas() {
  const vista = document.getElementById('bs-fila-vista');
  const codigo = document.getElementById('bs-fila-codigo');
  const reset = document.getElementById('bs-fila-reset');
  if (!vista || !codigo) return;

  let cols = [];

  const render = () => {
    if (cols.length === 0) {
      vista.innerHTML = '<span class="bs-nota" style="margin:0">La fila está vacía: toca un botón de arriba.</span>';
      codigo.innerHTML = '<span class="cm">/* Aquí aparecerá el HTML de tu fila */</span>';
      return;
    }

    vista.innerHTML = '<div class="container"><div class="row">' +
      cols.map(n => '<div class="col-' + n + ' bs-caja-col">col-' + n + '<br><small>' + ANCHOS_COL[n] + '</small></div>').join('') +
      '</div></div>';

    const suma = cols.reduce((acc, n) => acc + Number(n), 0);
    const comentario = suma === 12
      ? '<span class="cm">/* suma de la fila: 12 — la fila queda justa ✓ */</span>'
      : '<span class="cm">/* suma de la fila: ' + suma + (suma < 12 ? ' — sobran ' + (12 - suma) + ' partes vacías' : ' — lo que pasa de 12 baja a la fila siguiente') + ' */</span>';

    codigo.innerHTML =
      '<span class="kw">&lt;div</span> <span class="ty">class</span>=<span class="str">"container"</span><span class="kw">&gt;</span>\n' +
      '  <span class="kw">&lt;div</span> <span class="ty">class</span>=<span class="str">"row"</span><span class="kw">&gt;</span>\n' +
      cols.map(n => '    <span class="kw">&lt;div</span> <span class="ty">class</span>=<span class="str">"col-' + n + '"</span><span class="kw">&gt;</span>contenido<span class="kw">&lt;/div&gt;</span>').join('\n') +
      '\n  <span class="kw">&lt;/div&gt;</span>\n' +
      '<span class="kw">&lt;/div&gt;</span>\n' +
      comentario;
  };

  document.querySelectorAll('[data-col]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (cols.length >= 4) {
        mostrarToast('⚠️ Cuatro columnas es el máximo cómodo. Vacía la fila si quieres empezar de nuevo.');
        return;
      }
      cols.push(btn.dataset.col);
      render();
      addXP(2);
    });
  });

  if (reset) {
    reset.addEventListener('click', () => {
      cols = [];
      render();
    });
  }

  render();
}

/* --- Traductor de utilidades --- */
const UTILIDADES = {
  'p-3': { css: 'padding: 1rem;', que: 'aire interno' },
  'mt-5': { css: 'margin-top: 3rem;', que: 'separa de lo de arriba' },
  'text-center': { css: 'text-align: center;', que: 'centra el texto' },
  'bg-primary': { css: 'background-color: #0d6efd;', que: 'fondo azul' },
  'rounded-3': { css: 'border-radius: 1rem;', que: 'esquinas redondeadas' },
  'shadow': { css: 'box-shadow: 0 .5rem 1rem rgba(0,0,0,.15);', que: 'sombra' },
  'fw-bold': { css: 'font-weight: 700;', que: 'negrita' },
  'text-white': { css: 'color: #fff;', que: 'texto blanco' }
};

function inicializarTraductor() {
  const vista = document.getElementById('bs-util-vista');
  const tabla = document.getElementById('bs-util-tabla');
  const codigo = document.getElementById('bs-util-codigo');
  const reset = document.getElementById('bs-util-reset');
  if (!vista || !codigo) return;

  let activas = [];

  const render = () => {
    const clases = activas.join(' ');
    vista.innerHTML = '<div id="bs-util-demo" class="' + clases + '">Bloque con clases</div>';

    if (tabla) {
      tabla.innerHTML = activas.length === 0
        ? ''
        : activas.map(c => '<div class="trad-fila"><span class="trad-clase">' + c + '</span><span class="trad-css">' +
          UTILIDADES[c].css + '</span><span style="color:var(--texto-suave);font-size:.8rem">← ' + UTILIDADES[c].que + '</span></div>').join('');
    }

    codigo.innerHTML =
      '<span class="cm">/* HTML */</span>\n' +
      '<span class="kw">&lt;div</span> <span class="ty">class</span>=<span class="str">"' + (clases || 'sin clases todavía') + '"</span><span class="kw">&gt;</span>Bloque con clases<span class="kw">&lt;/div&gt;</span>\n\n' +
      '<span class="cm">/* El CSS que Bootstrap tiene escrito para esas clases */</span>\n' +
      (activas.length === 0
        ? '<span class="cm">/* (todavía nada) */</span>'
        : activas.map(c => '.' + c + ' { ' + UTILIDADES[c].css + ' }').join('\n'));
  };

  document.querySelectorAll('[data-util]').forEach(btn => {
    btn.addEventListener('click', () => {
      const clave = btn.dataset.util;
      if (activas.includes(clave)) {
        activas = activas.filter(c => c !== clave);
      } else {
        activas.push(clave);
        addXP(2);
      }
      render();
    });
  });

  if (reset) {
    reset.addEventListener('click', () => {
      activas = [];
      render();
    });
  }

  render();
}

/* --- Constructor de card --- */
const PARTES_CARD = {
  header: { etiqueta: 'card-header', html: '<div class="card-header">Tareas de la semana</div>' },
  badge: { etiqueta: 'badge', html: '<span class="badge text-bg-warning">Estudio</span>' },
  title: { etiqueta: 'card-title', html: '<h5 class="card-title">Repasar Bootstrap</h5>' },
  texto: { etiqueta: 'card-text', html: '<p class="card-text">Anotar las clases que ya conozco y las que no.</p>' },
  boton: { etiqueta: 'btn btn-primary', html: '<button class="btn btn-primary btn-sm" type="button">Marcar como hecha</button>' },
  footer: { etiqueta: 'card-footer', html: '<div class="card-footer"><small class="text-muted">Clase 7C</small></div>' }
};
const ORDEN_CARD = ['header', 'badge', 'title', 'texto', 'boton', 'footer'];

function inicializarConstructorCard() {
  const vista = document.getElementById('bs-card-vista');
  const codigo = document.getElementById('bs-card-codigo');
  const reset = document.getElementById('bs-card-reset');
  if (!vista || !codigo) return;

  let elegidas = [];

  const render = () => {
    if (elegidas.length === 0) {
      vista.innerHTML = '<span class="bs-nota" style="margin:0">Elige las partes de la tarjeta arriba.</span>';
      codigo.innerHTML = '<span class="cm">/* El HTML de tu tarjeta aparecerá aquí */</span>';
      return;
    }

    const dentro = elegidas.filter(p => p !== 'header' && p !== 'footer');
    const cuerpo = dentro.length > 0
      ? ['  <div class="card-body">', ...dentro.map(p => '    ' + PARTES_CARD[p].html), '  </div>']
      : [];

    const lineas = ['<div class="card">'];
    if (elegidas.includes('header')) lineas.push('  ' + PARTES_CARD.header.html);
    lineas.push(...cuerpo);
    if (elegidas.includes('footer')) lineas.push('  ' + PARTES_CARD.footer.html);
    lineas.push('</div>');

    vista.innerHTML = '<div class="card" style="max-width:340px">' +
      (elegidas.includes('header') ? PARTES_CARD.header.html : '') +
      (dentro.length > 0 ? '<div class="card-body">' + dentro.map(p => PARTES_CARD[p].html).join('') + '</div>' : '') +
      (elegidas.includes('footer') ? PARTES_CARD.footer.html : '') +
      '</div>';

    codigo.innerHTML = '<span class="cm">/* dentro de un col-4 o col-6 de tu .row */</span>\n' +
      lineas.map(l => '<span class="kw">' + escaparHtml(l) + '</span>').join('\n');
  };

  document.querySelectorAll('[data-parte]').forEach(btn => {
    btn.addEventListener('click', () => {
      const clave = btn.dataset.parte;
      if (elegidas.includes(clave)) {
        elegidas = elegidas.filter(p => p !== clave);
      } else {
        elegidas.push(clave);
        elegidas.sort((a, b) => ORDEN_CARD.indexOf(a) - ORDEN_CARD.indexOf(b));
        addXP(2);
      }
      render();
    });
  });

  if (reset) {
    reset.addEventListener('click', () => {
      elegidas = [];
      render();
    });
  }

  render();
}

/* --- Desmontar el formulario para ver el trabajo que hace Bootstrap --- */
const CLASES_TODAS = ['form-label', 'form-control', 'form-select', 'form-check', 'form-check-input', 'table', 'table-striped'];

function inicializarDesmontarForm() {
  const vista = document.getElementById('bs-form-vista');
  const codigo = document.getElementById('bs-form-codigo');
  const reset = document.getElementById('bs-form-reset');
  if (!vista || !codigo) return;

  let puestas = CLASES_TODAS.slice();

  const attr = (nombre) => puestas.includes(nombre) ? ' class="' + nombre + '"' : '';

  const render = () => {
    vista.innerHTML =
      '<form onsubmit="return false" class="row g-3">' +
        '<div class="col-6 mb-3">' +
          '<label' + attr('form-label') + ' for="demo-f-titulo">Título</label>' +
          '<input' + attr('form-control') + ' type="text" id="demo-f-titulo" placeholder="Repasar Bootstrap">' +
        '</div>' +
        '<div class="col-6 mb-3">' +
          '<label' + attr('form-label') + ' for="demo-f-cat">Categoría</label>' +
          '<select' + attr('form-select') + ' id="demo-f-cat"><option>Estudio</option><option>Proyecto</option></select>' +
        '</div>' +
        '<div class="col-12">' +
          '<div' + attr('form-check') + '>' +
            '<input' + attr('form-check-input') + ' type="checkbox" id="demo-f-hecha">' +
            '<label class="form-check-label" for="demo-f-hecha">Ya está completada</label>' +
          '</div>' +
        '</div>' +
        '<div class="col-12">' +
          '<button class="btn btn-primary" type="button">Agregar</button>' +
        '</div>' +
      '</form>' +
      '<table' + attr('table') + (puestas.includes('table-striped') ? ' table-striped' : '') + ' style="margin-top:1rem">' +
        '<thead><tr><th scope="col">Tarea</th><th scope="col">Estado</th></tr></thead>' +
        '<tbody><tr><td>Repasar Bootstrap</td><td>Pendiente</td></tr><tr><td>Subir entrega</td><td>Hecha</td></tr></tbody>' +
      '</table>';

    codigo.innerHTML =
      '<span class="cm">/* quitaste: ' + (CLASES_TODAS.filter(c => !puestas.includes(c)).join(', ') || 'nada') + ' */</span>\n' +
      '<span class="kw">&lt;label</span>' + (puestas.includes('form-label') ? ' <span class="ty">class</span>=<span class="str">"form-label"</span>' : '') + ' <span class="ty">for</span>=<span class="str">"titulo"</span><span class="kw">&gt;</span>Título<span class="kw">&lt;/label&gt;</span>\n' +
      '<span class="kw">&lt;input</span>' + (puestas.includes('form-control') ? ' <span class="ty">class</span>=<span class="str">"form-control"</span>' : '') + ' <span class="ty">type</span>=<span class="str">"text"</span><span class="kw">&gt;</span>\n' +
      '<span class="kw">&lt;select</span>' + (puestas.includes('form-select') ? ' <span class="ty">class</span>=<span class="str">"form-select"</span>' : '') + '<span class="kw">&gt;</span>…<span class="kw">&lt;/select&gt;</span>\n' +
      '<span class="kw">&lt;table</span>' + (puestas.includes('table') ? ' <span class="ty">class</span>=<span class="str">"table' + (puestas.includes('table-striped') ? ' table-striped' : '') + '"</span>' : '') + '<span class="kw">&gt;</span>…<span class="kw">&lt;/table&gt;</span>';
  };

  document.querySelectorAll('[data-clase]').forEach(btn => {
    btn.addEventListener('click', () => {
      const clave = btn.dataset.clase;
      if (puestas.includes(clave)) {
        puestas = puestas.filter(c => c !== clave);
      } else {
        puestas.push(clave);
      }
      render();
      addXP(2);
    });
  });

  if (reset) {
    reset.addEventListener('click', () => {
      puestas = CLASES_TODAS.slice();
      render();
    });
  }

  render();
}
