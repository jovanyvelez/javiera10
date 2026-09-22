/* ============================================================
   CLASE 7B — HERRAMIENTAS DE PROGRAMACIÓN I
   (Viewport, imágenes y textos responsivos, unidades relativas)
   ============================================================ */

const STORAGE_KEY = 'curso-responsive-viewport-unidades';
const TOTAL_MODULOS = 8;
const XP_TOTAL = 640;

const LABELS_MODULOS = ['Inicio', 'El viewport', 'Imágenes responsivas', 'Textos fluidos', 'Descanso', 'Unidades relativas', 'Práctica integrada', 'Taller'];
const BADGES_MODULO = {
  0: '🚀 Iniciado',
  1: '📱 Ventana Real',
  2: '🖼️ Foto Fluida',
  3: '🔤 Tipógrafo',
  4: '☕ Descansado',
  5: '📏 Medidor',
  6: '🧩 Integrador',
  7: '🛠️ Maestro del Viewport'
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
        result.textContent = '✅ ¡Correcto! 1vw = el 1% del ancho de la ventana: en 1000px son 10px. ¡Volvamos!';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Casi. 1vw es el 1% del ANCHO de la ventana: en 1000px son 10px. ¡A seguir!';
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
  2: ['2a', '2b', '2c', '2d']
};
const TALLER_INPUT = { 3: '100%' };
const TALLER_MSGS = {
  1: '¡Perfecto! El viewport da el ancho real, max-width protege las imágenes y clamp() da mínimo, ideal y máximo.',
  2: '¡Excelente! Primero el viewport, luego imágenes fluidas, luego unidades relativas y al final el layout con flex/grid.',
  3: '¡Bien! max-width: 100% es la regla de oro para que la imagen nunca se salga.',
  4: '🏆 ¡JEFE FINAL VENCIDO! Sin la etiqueta viewport el celular finge 980px y muestra la página en miniatura.'
};
const TALLER_HINTS = {
  1: 'Pista: el viewport da el ancho real, max-width protege las imágenes, clamp regula el texto.',
  2: 'Pista: primero el navegador debe conocer la pantalla (viewport), después la imagen y las medidas, y al final el layout.',
  3: 'Pista: el tope del ancho es todo el contenedor… en porcentaje.',
  4: 'Pista: la página se ve diminuta en el celular. ¿Qué etiqueta le falta al head?'
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
  const block = chip.closest('.ws-block');
  const previa = parejasMatch[id].findIndex(p => p[lado] === chip.dataset.mid);
  if (previa !== -1) {
    const pareja = parejasMatch[id][previa];
    parejasMatch[id].splice(previa, 1);
    const otroMid = pareja[lado === 'left' ? 'right' : 'left'];
    const otroChip = block.querySelector(`[data-mid="${otroMid}"]`);
    if (otroChip) {
      otroChip.classList.remove('paired-temp', 'wrong', 'selected');
      otroChip.style.opacity = '';
    }
  }
  seleccionMatch[id][lado] = chip.dataset.mid;
  block.querySelectorAll(`[data-role="${lado}"] .ws-chip`).forEach(c => c.classList.remove('selected'));
  chip.classList.remove('paired-temp', 'wrong');
  chip.style.opacity = '';
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
      otorgarBadge('🛠️ Maestro del Viewport Completado');
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
const CARPETA_CLASE = 'clase07b';

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
  inicializarViewport();
  inicializarImagen();
  inicializarTexto();
  inicializarUnidades();
  inicializarHero();
}

/* Módulo 1: el celular que finge 980px */
function inicializarViewport() {
  const content = document.getElementById('vp-content');
  const estadoEl = document.getElementById('vp-estado');
  const anchoEl = document.getElementById('vp-ancho');
  const fbTxt = document.getElementById('vp-feedback-txt');
  if (!content) return;
  document.querySelectorAll('[data-vp]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modo = btn.dataset.vp;
      if (modo === 'sin') {
        content.style.transformOrigin = 'top left';
        content.style.transform = 'scale(0.28)';
        content.style.width = '980px';
        estadoEl.textContent = '❌ ausente';
        anchoEl.textContent = '980px';
        fbTxt.innerHTML = 'El navegador dibuja la página como si la pantalla midiera <strong>980px</strong> y luego la achica entera: texto hormiga y zoom obligatorio.';
      } else {
        content.style.transform = 'scale(1)';
        content.style.width = '100%';
        estadoEl.textContent = '✅ presente';
        anchoEl.textContent = 'ancho real';
        fbTxt.innerHTML = 'Con <code>width=device-width</code> el navegador usa el <strong>ancho real</strong> de la pantalla: la página se dibuja a su tamaño y tus media queries funcionan donde esperas.';
        addXP(2);
      }
    });
  });
}

/* Módulo 2: la foto que se escapa */
function inicializarImagen() {
  const img = document.getElementById('img-demo');
  const modeEl = document.getElementById('img-mode');
  const estadoEl = document.getElementById('img-estado');
  const fbTxt = document.getElementById('img-feedback-txt');
  if (!img) return;
  document.querySelectorAll('[data-img]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modo = btn.dataset.img;
      if (modo === 'sin') {
        img.style.width = '1200px';
        img.style.maxWidth = 'none';
        img.style.height = 'auto';
        img.style.objectFit = 'fill';
        modeEl.textContent = 'sin regla';
        estadoEl.textContent = 'se sale 💥';
        fbTxt.innerHTML = 'La foto mide <strong>1200px</strong> y el contenedor ~420px: se sale por la derecha y aparece el scroll horizontal. El error más visto en webs hechas a las carreras.';
      } else if (modo === 'fluida') {
        img.style.width = 'auto';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.objectFit = 'fill';
        modeEl.textContent = 'max-width: 100%';
        estadoEl.textContent = 'fluida ✅';
        fbTxt.innerHTML = '<code>max-width: 100%</code> + <code>height: auto</code>: la foto se encoge hasta caber y conserva sus proporciones. La <strong>regla de oro</strong>.';
        addXP(2);
      } else if (modo === 'cover') {
        img.style.width = '100%';
        img.style.maxWidth = '100%';
        img.style.height = '120px';
        img.style.objectFit = 'cover';
        modeEl.textContent = 'object-fit: cover';
        estadoEl.textContent = 'recortada ✅';
        fbTxt.innerHTML = 'Caja de altura fija + <code>object-fit: cover</code>: la foto se <strong>recorta</strong> para llenar la caja sin deformarse. Ideal para portadas de tarjetas.';
        addXP(2);
      }
    });
  });
}

/* Módulo 3: el título elástico */
function inicializarTexto() {
  const titulo = document.getElementById('ft-titulo');
  const parrafo = document.getElementById('ft-parrafo');
  const modeEl = document.getElementById('ft-mode');
  const fbTxt = document.getElementById('ft-feedback-txt');
  if (!titulo) return;
  document.querySelectorAll('[data-txt]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modo = btn.dataset.txt;
      if (modo === 'px') {
        titulo.style.fontSize = '48px';
        parrafo.style.fontSize = '16px';
        modeEl.textContent = 'px fijos';
        fbTxt.innerHTML = 'Con <code>48px</code> el título mide lo mismo en un celular de 380px y en un monitor de 1920px. En el celular aplasta; en el monitor se pierde. Achica la ventana y verás que <strong>no reacciona</strong>.';
      } else if (modo === 'rem') {
        titulo.style.fontSize = '3rem';
        parrafo.style.fontSize = '1rem';
        modeEl.textContent = 'rem';
        fbTxt.innerHTML = '<code>rem</code> respeta el tamaño base del navegador del usuario: accesible y consistente. Pero sigue siendo un tamaño fijo: <strong>no crece con la pantalla</strong>.';
        addXP(1);
      } else if (modo === 'clamp') {
        titulo.style.fontSize = 'clamp(1.5rem, 6vw, 3rem)';
        parrafo.style.fontSize = 'clamp(0.95rem, 1.2vw, 1.1rem)';
        modeEl.textContent = 'clamp()';
        fbTxt.innerHTML = '<code>clamp()</code> en acción: <strong>achica y agranda la ventana del navegador</strong> y mira cómo el título respira con la pantalla… sin pasar nunca del mínimo ni del máximo.';
        addXP(2);
      }
    });
  });
}

/* Módulo 5: la regla viva de unidades */
function inicializarUnidades() {
  const fbTxt = document.getElementById('unit-feedback-txt');
  const ruler = document.getElementById('unidad-ruler');
  if (!ruler) return;
  const descripciones = {
    '%': 'La caja <code>%</code> mide la mitad del contenedor: cambia si cambia su padre, no la ventana.',
    'em': 'La caja <code>em</code> escala con el tamaño de letra de su contexto: crece con el texto.',
    'rem': 'La caja <code>rem</code> depende del texto base del <code>html</code>: igual en toda la página.',
    'vw': 'La caja <code>vw</code> responde al ANCHO de la ventana: achica el navegador y mírala encoger en vivo.',
    'vh': 'La caja <code>vh</code> responde al ALTO de la ventana: cámbialo (F12 → modo dispositivo) y mírala reaccionar.'
  };
  document.querySelectorAll('[data-unit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const u = btn.dataset.unit;
      ruler.querySelectorAll('.unidad-box').forEach(box => {
        box.classList.toggle('resaltada', box.dataset.unidadBox === u);
      });
      fbTxt.innerHTML = descripciones[u] || '';
      addXP(1);
    });
  });
}

/* Módulo 6: héroe rígido vs fluido */
function inicializarHero() {
  const hero = document.getElementById('hero-practica');
  const titulo = document.getElementById('hp-titulo');
  const sub = document.getElementById('hp-sub');
  const foto = document.getElementById('hp-foto');
  const boton = document.getElementById('hp-btn');
  const modeEl = document.getElementById('hero-mode');
  const fbTxt = document.getElementById('hero-feedback-txt');
  if (!hero) return;
  document.querySelectorAll('[data-hero]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modo = btn.dataset.hero;
      if (modo === 'rigido') {
        hero.style.minHeight = '500px';
        hero.style.padding = '48px';
        titulo.style.fontSize = '48px';
        sub.style.fontSize = '20px';
        foto.style.maxWidth = 'none';
        foto.style.width = '900px';
        boton.style.fontSize = '18px';
        modeEl.textContent = 'rígido (px fijos)';
        fbTxt.innerHTML = 'El héroe rígido: <code>500px</code> de alto, título de <code>48px</code>, foto de <code>900px</code>… que se sale del contenedor. Así se ve una página que ignora el viewport. Achica la ventana y sufre con ella.';
      } else {
        hero.style.minHeight = '40vh';
        hero.style.padding = 'clamp(1rem, 4vw, 3rem)';
        titulo.style.fontSize = 'clamp(1.6rem, 5vw, 3rem)';
        sub.style.fontSize = 'clamp(0.95rem, 2vw, 1.2rem)';
        foto.style.maxWidth = '100%';
        foto.style.width = 'min(80%, 600px)';
        boton.style.fontSize = '1rem';
        modeEl.textContent = 'fluido (vh + clamp + max-width)';
        fbTxt.innerHTML = 'El héroe fluido: <code>40vh</code> de alto que se adapta a cada pantalla, título con <code>clamp()</code>, aire con <code>vw</code> y foto con la regla de oro. <strong>Achica la ventana</strong>: todo respira.';
        addXP(2);
      }
    });
  });
}