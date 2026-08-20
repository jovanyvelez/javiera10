/* ============================================================
   CLASE 1 — HERRAMIENTAS DE PROGRAMACIÓN I
   (Introducción a la web y primera página HTML)
   ============================================================ */

const STORAGE_KEY = 'curso-introduccion-web-html';
const TOTAL_MODULOS = 8;
const XP_TOTAL = 640;

const LABELS_MODULOS = ['Inicio', 'Internet y la web', 'HTML, CSS y JS', 'Estructura de una página', 'Descanso', 'Etiquetas básicas', 'Tu página "Sobre mí"', 'Taller · GitHub'];
const BADGES_MODULO = {
  0: '🚀 Iniciado',
  1: '🌍 Explorador Web',
  2: '🧱 Constructor de Capas',
  3: '📄 Esqueleto',
  4: '☕ Descansado',
  5: '🏷️ Etiquetador',
  6: '👤 Sobre Mí',
  7: '🛠️ Web Builder'
};

const estado = {
  moduloActual: 0,
  completados: new Set(),
  quizzes: {},
  talleres: {},
  badges: new Set(),
  xp: 0,
  // Taller de GitHub (módulo 7)
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
  configurarTallerGithub();
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
        result.textContent = '✅ ¡Correcto! HTML = HyperText Markup Language (Lenguaje de Marcado de Hipertexto). ¡Volvamos!';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Casi. HTML = HyperText Markup Language. ¡A seguir!';
      }
    });
  });
}

/* ---------- RETOS INTERACTIVOS (módulo 3) ---------- */
const TALLER_RESP = {};
const TALLER_ORDER = {
  esqueleto: ['doctype', 'html', 'head', 'body']
};
const TALLER_INPUT = {};
const TALLER_MSGS = {
  esqueleto: '¡Excelente! DOCTYPE → html → head → body.'
};
const TALLER_HINTS = {
  esqueleto: 'Pista: DOCTYPE arriba, body abajo.'
};
const TALLER_XP = { esqueleto: 30 };

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
      otorgarBadge('🧩 Esqueleto Ordenado');
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
   TALLER DEL MÓDULO 7 — REPOSITORIO EN GITHUB + CODESPACES + PAGES
   ============================================================ */
const TOTAL_PASOS = 8;
const XP_POR_PASO = 12;
const XP_PUBLICACION = 44;
const TOTAL_AUTOEVAL = 6;
const REPO_NOMBRE = 'herramientas-programacion';

// Nombre de usuario válido en GitHub: alfanumérico y guiones (no al inicio/final)
const RE_USUARIO = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
// URL de un sitio publicado con GitHub Pages
const RE_PAGES = /^https?:\/\/([a-z\d-]+)\.github\.io(?:\/([^/\s?#]+))?\/?([^\s?#]*)$/i;

function configurarTallerGithub() {
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

  restaurarTallerGithub();
}

function restaurarTallerGithub() {
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
      fb.innerHTML = '✅ Ya validaste tu entrega en esta clase. Puedes volver a comprobarla cuando quieras.';
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
      otorgarBadge('🐙 Repositorio en Marcha');
      mostrarToast('🎉 ¡Los 8 pasos listos! Ahora verifica tu enlace.');
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
    salida.innerHTML = '<p class="url-aviso error">⚠️ Ese usuario no parece válido. En GitHub solo se usan letras, números y guiones (por ejemplo <code>ana-lopez-dev</code>).</p>';
    salida.classList.add('visible');
    return;
  }

  input.value = usuario;
  const base = `https://${usuario}.github.io/${REPO_NOMBRE}/`;
  const repo = `https://github.com/${usuario}/${REPO_NOMBRE}`;

  salida.innerHTML = `
    <div class="url-fila">
      <span class="url-etiqueta">🌐 Tu portada publicada <em>(esto entregas)</em></span>
      <a class="url-valor" href="${base}" target="_blank" rel="noopener">${base}</a>
    </div>
    <div class="url-fila">
      <span class="url-etiqueta">📄 Tu ejercicio de la clase 1</span>
      <a class="url-valor" href="${base}clase01/" target="_blank" rel="noopener">${base}clase01/</a>
    </div>
    <div class="url-fila">
      <span class="url-etiqueta">🐙 Tu repositorio, donde vive el código</span>
      <a class="url-valor" href="${repo}" target="_blank" rel="noopener">${repo}</a>
    </div>
    <div class="url-fila">
      <span class="url-etiqueta">💻 Tus Codespaces (para reabrirlo cada clase)</span>
      <a class="url-valor" href="https://github.com/codespaces" target="_blank" rel="noopener">https://github.com/codespaces</a>
    </div>
    <p class="url-aviso">📌 Guarda estos enlaces: los vas a usar en todas las clases del año.</p>
  `;
  salida.classList.add('visible');

  const final = document.getElementById('gh-url-final');
  if (final) {
    final.placeholder = base;
    if (!final.value) final.value = base;
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
    fallo(`❌ Esa es la dirección de tu <strong>código</strong> en GitHub, no la de tu <strong>página publicada</strong>. La de la página contiene <code>.github.io</code>.${sugerencia}`);
    return;
  }

  if (!/^https?:\/\//i.test(valor)) {
    fallo('❌ Le falta el inicio: la dirección debe empezar por <code>https://</code>. Cópiala tal cual desde la barra del navegador.');
    return;
  }

  const m = valor.match(RE_PAGES);
  if (!m) {
    fallo('❌ Esa dirección no parece de GitHub Pages. Debe tener la forma <code>https://tu-usuario.github.io/' + REPO_NOMBRE + '/</code>. Revísala en <strong>Settings → Pages</strong>, donde dice <em>"Your site is live at…"</em>.');
    return;
  }

  const usuario = m[1].toLowerCase();
  const repo = (m[2] || '').toLowerCase();

  let extra = '';
  if (repo && repo !== REPO_NOMBRE) {
    extra = `<br>💡 Ojo: tu repositorio se llama <code>${repo}</code> y en clase acordamos <code>${REPO_NOMBRE}</code>. Funciona igual, pero avísale a tu profesor/a para que sepa dónde buscar tus ejercicios.`;
  }

  fb.className = 'resultado-ws visible ok';
  fb.innerHTML = `✅ ¡Excelente, <strong>${usuario}</strong>! Esa sí es una dirección de GitHub Pages. Ábrela en otra pestaña y confirma que se ve tu página; si da error 404, espera 2 minutos y recarga con <code>Ctrl + F5</code>.${extra}` +
    (estado.publicado ? '' : ` <strong>+${XP_PUBLICACION} XP</strong>`);

  if (!estado.publicado) {
    estado.publicado = true;
    addXP(XP_PUBLICACION);
    otorgarBadge('🌐 Publicado en Internet');
  }
  if (!estado.pasos.has('8')) alternarPaso('8');
  if (estado.pasos.size === TOTAL_PASOS) otorgarBadge('🛠️ Web Builder Completado');

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
  inicializarClienteServidor();
  inicializarCapasDemo();
  inicializarEtiquetas();
  inicializarSobreMi();
}

function inicializarClienteServidor() {
  const pedir = document.getElementById('cs-pedir');
  if (!pedir) return;
  const clienteEl = document.getElementById('cs-cliente');
  const servidorEl = document.getElementById('cs-servidor');
  const contadorEl = document.getElementById('cs-contador');
  const fbTxt = document.getElementById('cs-feedback-txt');
  let contador = 0;
  let ocupado = false;

  pedir.addEventListener('click', () => {
    if (ocupado) return;
    ocupado = true;
    clienteEl.textContent = 'Pidiendo…';
    servidorEl.textContent = 'Esperando';
    fbTxt.textContent = '📨 El cliente (navegador) envía una petición al servidor…';
    setTimeout(() => {
      servidorEl.textContent = 'Respondiendo…';
      fbTxt.textContent = '🖥️ El servidor recibe la petición y prepara la respuesta…';
      setTimeout(() => {
        contador++;
        contadorEl.textContent = contador;
        clienteEl.textContent = 'Recibió la página ✓';
        servidorEl.textContent = 'Listo';
        fbTxt.textContent = '✅ El servidor envía la página y el cliente la muestra. ¡Conversación completa!';
        ocupado = false;
        addXP(3);
      }, 900);
    }, 900);
  });

  document.getElementById('cs-reset').addEventListener('click', () => {
    contador = 0;
    contadorEl.textContent = '0';
    clienteEl.textContent = 'Esperando';
    servidorEl.textContent = 'Esperando';
    fbTxt.textContent = 'Presiona "Pedir página" para ver la conversación.';
    ocupado = false;
  });
}

function inicializarCapasDemo() {
  const demo = document.getElementById('capasDemo');
  if (!demo) return;
  const h1 = document.getElementById('demoH1');
  const p = document.getElementById('demoP');
  const btn = document.getElementById('demoBtn');
  const valHtml = document.getElementById('capa-html-val');
  const valCss = document.getElementById('capa-css-val');
  const valJs = document.getElementById('capa-js-val');
  const expl = document.getElementById('capasExplicacionTxt');
  if (!h1 || !p || !btn) return;

  let clics = 0;
  let htmlOn = true, cssOn = true, jsOn = true;

  const estiloConCss = 'color: var(--morado-claro); font-size: 1.8rem; margin: 0 0 0.8rem; font-weight: 800;';
  const estiloSinCss = 'color: inherit; font-size: 1rem; margin: 0 2rem 0.5rem; font-weight: 400;';
  const pConCss = 'font-size: 0.95rem; color: var(--texto-suave); margin: 0 0 1rem;';
  const pSinCss = 'font-size: 0.85rem; color: inherit; margin: 0 2rem 0.5rem;';
  const btnConCss = 'background: linear-gradient(135deg, var(--morado), var(--cian)); color: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 20px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px rgba(168,85,247,0.4);';
  const btnSinCss = 'background: transparent; color: inherit; border: 1px solid #888; padding: 0.2rem 0.5rem; font-weight: 400; cursor: pointer;';

  const aplicarEstilo = () => {
    if (cssOn) {
      h1.style.cssText = estiloConCss;
      p.style.cssText = pConCss;
      btn.style.cssText = btnConCss;
    } else {
      h1.style.cssText = estiloSinCss;
      p.style.cssText = pSinCss;
      btn.style.cssText = btnSinCss;
    }
    const display = htmlOn ? '' : 'none';
    h1.style.display = display;
    p.style.display = display;
    btn.style.display = display;
  };

  const actualizarExplicacion = () => {
    let txt = '';
    if (htmlOn && cssOn && jsOn) txt = 'Las 3 capas activas. El botón cuenta clics (JS), todo se ve ordenado (CSS) y tiene estructura (HTML).';
    else if (htmlOn && cssOn && !jsOn) txt = 'HTML + CSS activos, JS OFF. La página se ve bonita pero el botón NO responde.';
    else if (htmlOn && !cssOn && jsOn) txt = 'HTML + JS activos, CSS OFF. El botón funciona pero todo se ve plano y feo.';
    else if (htmlOn && !cssOn && !jsOn) txt = 'Solo HTML. Hay estructura pero no estilo ni comportamiento.';
    else if (!htmlOn) txt = 'HTML OFF. Sin estructura no hay nada que ver: la página está vacía.';
    expl.textContent = txt;
  };

  btn.addEventListener('click', () => {
    if (!jsOn) return;
    clics++;
    btn.textContent = `🎉 Contar clics: ${clics}`;
    addXP(1);
  });

  document.getElementById('toggleHtml').addEventListener('click', () => {
    htmlOn = !htmlOn;
    valHtml.textContent = htmlOn ? 'ON' : 'OFF';
    document.getElementById('capa-html-cell').style.opacity = htmlOn ? '1' : '0.4';
    aplicarEstilo();
    actualizarExplicacion();
  });
  document.getElementById('toggleCss').addEventListener('click', () => {
    cssOn = !cssOn;
    valCss.textContent = cssOn ? 'ON' : 'OFF';
    document.getElementById('capa-css-cell').style.opacity = cssOn ? '1' : '0.4';
    aplicarEstilo();
    actualizarExplicacion();
  });
  document.getElementById('toggleJs').addEventListener('click', () => {
    jsOn = !jsOn;
    valJs.textContent = jsOn ? 'ON' : 'OFF';
    document.getElementById('capa-js-cell').style.opacity = jsOn ? '1' : '0.4';
    if (!jsOn) { btn.textContent = '🎉 Contar clics: 0 (JS desactivado)'; clics = 0; }
    else { btn.textContent = `🎉 Contar clics: ${clics}`; }
    actualizarExplicacion();
  });
  document.getElementById('demoReset').addEventListener('click', () => {
    htmlOn = cssOn = jsOn = true;
    clics = 0;
    valHtml.textContent = valCss.textContent = valJs.textContent = 'ON';
    document.getElementById('capa-html-cell').style.opacity = '1';
    document.getElementById('capa-css-cell').style.opacity = '1';
    document.getElementById('capa-js-cell').style.opacity = '1';
    btn.textContent = '🎉 Contar clics: 0';
    aplicarEstilo();
    actualizarExplicacion();
  });

  aplicarEstilo();
  actualizarExplicacion();
}

function inicializarEtiquetas() {
  const codeEl = document.getElementById('tag-code');
  const fbTxt = document.getElementById('tag-feedback-txt');
  if (!codeEl) return;
  const info = {
    h1: { code: '&lt;h1&gt;Título principal&lt;/h1&gt;', msg: 'h1 es el encabezado más grande. Úsalo para el título principal de la página.' },
    h2: { code: '&lt;h2&gt;Subtítulo&lt;/h2&gt;', msg: 'h2 es un encabezado de segundo nivel, más pequeño que h1.' },
    p: { code: '&lt;p&gt;Este es un párrafo de texto.&lt;/p&gt;', msg: 'p crea un párrafo. Es la etiqueta más usada para texto.' },
    a: { code: '&lt;a href="https://google.com"&gt;Ir a Google&lt;/a&gt;', msg: 'a crea un enlace. El atributo href indica a dónde lleva.' },
    br: { code: 'Línea 1&lt;br&gt;Línea 2', msg: 'br hace un salto de línea. No necesita etiqueta de cierre.' },
    hr: { code: '&lt;hr&gt;', msg: 'hr dibuja una línea horizontal separadora. Tampoco necesita cierre.' }
  };
  document.querySelectorAll('[data-tag]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.tag;
      codeEl.innerHTML = info[t].code;
      fbTxt.textContent = info[t].msg;
      addXP(1);
    });
  });
}

function inicializarSobreMi() {
  const codeEl = document.getElementById('sobre-code');
  if (!codeEl) return;
  const partes = {
    titulo: '&lt;title&gt;Sobre mí&lt;/title&gt;',
    h1: '&lt;h1&gt;Hola, soy [tu nombre]&lt;/h1&gt;',
    parrafo: '&lt;p&gt;Tengo [tu edad] años y estudio en grado décimo.&lt;/p&gt;',
    enlace: '&lt;a href="https://google.com"&gt;Mi sitio favorito&lt;/a&gt;'
  };
  const orden = ['titulo', 'h1', 'parrafo', 'enlace'];
  const agregados = [];
  document.querySelectorAll('[data-sobre]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.sobre;
      if (agregados.includes(key)) return;
      agregados.push(key);
      render();
      addXP(2);
    });
  });
  document.getElementById('sobre-reset').addEventListener('click', () => {
    agregados.length = 0;
    render();
  });
  function render() {
    if (agregados.length === 0) {
      codeEl.innerHTML = '<span class="cm">&lt;!-- Toca los botones para construir tu página --&gt;</span>';
      return;
    }
    const ordenado = orden.filter(k => agregados.includes(k));
    codeEl.innerHTML = '&lt;!DOCTYPE html&gt;\n&lt;html&gt;\n&lt;head&gt;\n  ' + (agregados.includes('titulo') ? partes.titulo : '') + '\n&lt;/head&gt;\n&lt;body&gt;\n  ' + ordenado.filter(k => k !== 'titulo').map(k => partes[k]).join('\n  ') + '\n&lt;/body&gt;\n&lt;/html&gt;';
  }
}
