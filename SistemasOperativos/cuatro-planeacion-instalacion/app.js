/* ============================================================
   CLASE 4 — SISTEMAS OPERATIVOS (Planeación e instalación)
   Lógica de navegación, simuladores, quizzes y taller
============================================================ */

const TOTAL_MODULOS = 8; // 0..7 (incluye módulo de descanso)

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
  configurarTrivia();
  inicializarFeaturesGrid();
  inicializarCriteriaGrid();
  inicializarMatchSO();
  inicializarParticionador();
  inicializarOrdenPrep();
  inicializarBootSim();
  inicializarInstalador();
  configurarTeclado();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
const STORAGE_KEY = 'curso-so-planeacion-instalacion';

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
  } catch (e) { /* sin localStorage: ignorar */ }
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
  } catch (e) { /* datos corruptos: ignorar */ }
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
    1: '🧭 Planificador',
    2: '⚖️ Juez de SO',
    3: '🧱 Preparador',
    4: '☕ Descansado',
    5: '🚀 Boot Master',
    6: '⚙️ Instalador',
    7: '🛠️ Install Master'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 Instalación Dominada');
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
  const completables = [1, 2, 3, 5, 6, 7];
  const total = completables.length;
  const completos = completables.filter(m => estado.completados.has(m)).length;
  const pct = Math.round((completos / total) * 100);

  const barra = document.getElementById('barra');
  if (barra) barra.style.width = pct + '%';

  const ptxt = document.getElementById('porcentaje');
  if (ptxt) ptxt.textContent = pct + '%';

  const mAct = document.getElementById('modulo-actual');
  if (mAct) {
    const labels = ['Inicio', 'Planificación', 'Elección', 'Preparación', 'Descanso', 'Arranque', 'Instalación', 'Taller'];
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

  // La respuesta correcta se define en el botón que tenga data-tcorrecta
  const correcta = opts.length ? (opts[0].closest('#triviaOpts').querySelector('[data-tcorrecta]')?.dataset.tcorrecta) : null;

  opts.forEach(op => {
    op.addEventListener('click', () => {
      const elegida = op.dataset.top;
      opts.forEach(o => { o.disabled = true; if (o.dataset.top === correcta) o.classList.add('correcta'); });
      if (elegida === correcta) {
        result.className = 'trivia-result visible ok';
        result.textContent = '✅ ¡Correcto! Una ISO es una imagen de disco: contiene todo lo necesario para instalar el SO. ¡Volvamos a la clase!';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Casi. La respuesta correcta: una ISO es una imagen de disco con todo lo necesario para instalar el SO. ¡A seguir!';
      }
    });
  });
}

/* ---------- FEATURES GRID (Módulo 1) ---------- */
function inicializarFeaturesGrid() {
  const grid = document.getElementById('featuresGrid');
  if (!grid) return;

  const features = [
    { icon: '🔍', title: 'Anticipada', short: 'Se hace ANTES de instalar, no durante.', long: 'Planificar es prevenir. Si descubres los problemas durante la instalación, ya es tarde: el disco puede estar a medio particionar. La planificación se hace con tiempo, antes de tocar el equipo.' },
    { icon: '📋', title: 'Sistemática', short: 'Sigue un checklist, no la memoria.', long: 'Una buena planificación tiene una lista de verificación: requisitos, espacio, respaldo, medio, BIOS. Seguir el checklist evita olvidos como "no respaldé mis fotos".' },
    { icon: '🎯', title: 'Específica', short: 'Pensada para TU hardware y TU uso.', long: 'No es lo mismo planificar para una PC gamer nueva que para una laptop vieja de 2 GB de RAM. Cada caso tiene su SO ideal, sus particiones ideales y su medio ideal.' },
    { icon: '💾', title: 'Reversible', short: 'Permite volver atrás sin perder datos.', long: 'Una buena planificación incluye un punto de retorno: respaldo de datos, imagen del disco, o instalación en virtual primero. Si algo falla, vuelves al punto de partida sin pérdida.' },
    { icon: '📝', title: 'Documentada', short: 'Se anotan decisiones y particiones.', long: 'En entornos profesionales, la planificación se documenta: qué SO, qué version, qué particiones con qué tamaños, qué bootloader. Sirve para repetir el proceso o auditarlo después.' }
  ];

  grid.innerHTML = features.map((f, i) =>
    `<div class="feature-card" data-fidx="${i}">
      <span class="f-icon">${f.icon}</span>
      <div class="f-title">${f.title}</div>
      <p class="f-short">${f.short}</p>
      <div class="f-long">${f.long}</div>
    </div>`
  ).join('');

  grid.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('click', () => {
      const isOpen = card.classList.contains('expanded');
      grid.querySelectorAll('.feature-card').forEach(c => c.classList.remove('expanded'));
      if (!isOpen) {
        card.classList.add('expanded');
        addXP(2);
      }
    });
  });
}

/* ---------- CRITERIA GRID (Módulo 2) ---------- */
function inicializarCriteriaGrid() {
  const grid = document.getElementById('criteriaGrid');
  if (!grid) return;

  const criteria = [
    { icon: '💻', title: 'Hardware', short: '¿Corre en mi CPU/RAM/disco?', long: 'El primer filtro: el SO debe soportar tu procesador (x86, ARM…), tu cantidad de RAM (Windows 11 pide 4 GB mínimo) y tu tipo de disco. Un SO que no corre en tu hardware no es una opción.' },
    { icon: '🎯', title: 'Uso', short: '¿Para qué lo necesito?', long: 'No es lo mismo un SO para ofimática, para gaming, para programar, para un servidor o para un abuelo que solo quiere navegar. El uso define las prioridades: gráficos, estabilidad, seguridad, aplicaciones.' },
    { icon: '💲', title: 'Costo', short: '¿Es gratis, de pago o freemium?', long: 'Linux es gratis y libre. Windows y macOS son de pago (o vienen "incluidos"). Pero el costo total incluye también soporte, apps y curva de aprendizaje. A veces lo "gratis" sale caro si no corre tu app clave.' },
    { icon: '🛡️', title: 'Soporte y seguridad', short: '¿Tiene actualizaciones y parches?', long: 'Un SO sin actualizaciones es un riesgo. Windows y macOS tienen soporte oficial por años. Las distros Linux tienen ciclos LTS (Long Term Support) de 5 años o más. Un SO abandonado (como Windows XP hoy) es un agujero de seguridad.' },
    { icon: '🎨', title: 'Personalización', short: '¿Puedo adaptarlo a mi gusto?', long: 'Linux es el rey de la personalización: entornos de escritorio (GNOME, KDE, XFCE), temas, paquetes. Windows y macOS son más cerrados. Si te importa "hacerlo tuyo", Linux gana por goleada.' },
    { icon: '📦', title: 'Software disponible', short: '¿Tiene las apps que necesito?', long: 'Si trabajas con Adobe Photoshop o juegos AAA, Windows/macOS son más fuertes. Si programas, Linux tiene herramientas nativas excelentes. Si solo ofimática, cualquiera sirve. La disponibilidad de tu app clave puede ser el factor decisivo.' }
  ];

  grid.innerHTML = criteria.map((c, i) =>
    `<div class="criterion-card" data-cidx="${i}">
      <span class="c-icon">${c.icon}</span>
      <div class="c-title">${c.title}</div>
      <p class="c-short">${c.short}</p>
      <div class="c-long">${c.long}</div>
    </div>`
  ).join('');

  grid.querySelectorAll('.criterion-card').forEach(card => {
    card.addEventListener('click', () => {
      const isOpen = card.classList.contains('expanded');
      grid.querySelectorAll('.criterion-card').forEach(c => c.classList.remove('expanded'));
      if (!isOpen) {
        card.classList.add('expanded');
        addXP(2);
      }
    });
  });
}

/* ---------- MATCH SO (Módulo 2) ---------- */
function inicializarMatchSO() {
  const grid = document.getElementById('matchGrid');
  const optsEl = document.getElementById('matchOptions');
  const fb = document.getElementById('matchFeedback');
  const instr = document.getElementById('matchInstr');
  if (!grid || !optsEl) return;

  const casos = [
    { id: 'd1', icon: '🖥️', name: 'Servidor web 24/7', so: 'Linux (Ubuntu Server / Debian)', recomend: 'o1' },
    { id: 'd2', icon: '🧓', name: 'Laptop vieja 2GB RAM', so: 'Linux ligero (Lubuntu/Xubuntu)', recomend: 'o2' },
    { id: 'd3', icon: '🎮', name: 'PC gamer nueva', so: 'Windows 11', recomend: 'o3' },
    { id: 'd4', icon: '🎨', name: 'Diseñador/a gráfico', so: 'macOS', recomend: 'o4' },
    { id: 'd5', icon: '🏫', name: 'Aula sin presupuesto', so: 'Linux (Edubuntu)', recomend: 'o5' }
  ];

  const opcionesSO = [
    { id: 'o1', label: 'Linux (Ubuntu Server / Debian)' },
    { id: 'o2', label: 'Linux ligero (Lubuntu/Xubuntu)' },
    { id: 'o3', label: 'Windows 11' },
    { id: 'o4', label: 'macOS' },
    { id: 'o5', label: 'Linux (Edubuntu)' }
  ];

  let selectedDev = null;
  let aciertos = 0;

  const render = () => {
    grid.innerHTML = casos.map(d => {
      const matched = d.matched;
      return `<div class="match-device ${selectedDev === d.id ? 'selected' : ''} ${matched ? 'matched' : ''}" data-dev="${d.id}">
        <span class="d-icon">${d.icon}</span>
        <span class="d-name">${matched ? d.so : d.name}</span>
      </div>`;
    }).join('');
    optsEl.innerHTML = opcionesSO.map(o =>
      `<button class="match-opt ${o.used ? 'used' : ''}" data-opt="${o.id}">${o.label}</button>`
    ).join('');
    if (instr) instr.textContent = selectedDev
      ? `Caso seleccionado: ${casos.find(d => d.id === selectedDev).name}. Ahora toca el SO correcto.`
      : 'Toca un caso de uso de la izquierda para seleccionarlo.';

    bind();
  };

  const bind = () => {
    grid.querySelectorAll('.match-device:not(.matched)').forEach(d => {
      d.addEventListener('click', () => {
        selectedDev = d.dataset.dev;
        render();
      });
    });
    optsEl.querySelectorAll('.match-opt:not(.used)').forEach(o => {
      o.addEventListener('click', () => {
        if (!selectedDev) return;
        const dev = casos.find(d => d.id === selectedDev);
        const opt = opcionesSO.find(x => x.id === o.dataset.opt);
        if (dev.recomend === opt.id) {
          dev.matched = true;
          opt.used = true;
          aciertos++;
          addXP(5);
          if (aciertos === casos.length) {
            fb.className = 'match-feedback visible ok';
            fb.textContent = '🏆 ¡Perfecto! 5/5 casos emparejados. ¡Sabes elegir SO!';
          }
        } else {
          fb.className = 'match-feedback visible';
          fb.style.background = 'rgba(244, 63, 94, 0.12)';
          fb.style.color = 'var(--rosa)';
          fb.textContent = '❌ Ese SO no es el ideal para ese caso. Intenta otra vez.';
          setTimeout(() => fb.classList.remove('visible'), 1500);
        }
        selectedDev = null;
        render();
      });
    });
  };

  document.getElementById('matchReset').addEventListener('click', () => {
    casos.forEach(d => d.matched = false);
    opcionesSO.forEach(o => o.used = false);
    selectedDev = null; aciertos = 0;
    fb.classList.remove('visible');
    render();
  });

  render();
}

/* ---------- PARTICIONADOR (Módulo 3) ---------- */
function inicializarParticionador() {
  const controls = document.getElementById('partControls');
  const disk = document.getElementById('partDisk');
  if (!controls || !disk) return;

  const TOTAL = 100;
  const parts = {
    system: { val: 0, min: 15, max: 50, label: 'Sistema /', color: 's-system' },
    data: { val: 0, min: 10, max: 70, label: 'Datos /home', color: 's-data' },
    boot: { val: 0, min: 1, max: 5, label: 'Boot EFI', color: 's-boot' },
    swap: { val: 0, min: 2, max: 16, label: 'Swap', color: 's-swap' }
  };

  const renderControls = () => {
    controls.innerHTML = Object.entries(parts).map(([key, p]) =>
      `<div class="part-control ${key}">
        <div class="pc-head"><span class="pc-dot"></span> ${p.label}</div>
        <div class="pc-row">
          <span class="pc-label">Tamaño (GB)</span>
          <input type="range" min="0" max="${p.max}" step="1" data-part="${key}" value="${p.val}">
          <span class="pc-val" id="pcval-${key}">${p.val} GB</span>
        </div>
        <div class="pc-row" style="font-size:0.76rem;color:var(--texto-suave);">
          Mín: ${p.min} · Máx: ${p.max}
        </div>
      </div>`
    ).join('');

    controls.querySelectorAll('input[type="range"]').forEach(inp => {
      inp.addEventListener('input', () => {
        const key = inp.dataset.part;
        parts[key].val = parseInt(inp.value, 10);
        document.getElementById(`pcval-${key}`).textContent = parts[key].val + ' GB';
        renderDisk();
      });
    });
  };

  const renderDisk = () => {
    const total = Object.values(parts).reduce((s, p) => s + p.val, 0);
    const free = TOTAL - total;

    let html = Object.entries(parts).filter(([_, p]) => p.val > 0).map(([key, p]) =>
      `<div class="part-segment ${p.color}" style="flex:${p.val};" title="${p.label}">
        <span class="ps-name">${p.label}</span>
        <span class="ps-size">${p.val}GB</span>
      </div>`
    ).join('');

    if (free > 0) {
      html += `<div class="part-segment empty" style="flex:${free};">
        <span class="ps-name">Libre</span>
        <span class="ps-size">${free}GB</span>
      </div>`;
    }

    disk.innerHTML = html;

    document.getElementById('partTotal').textContent = total;
    document.getElementById('partFree').textContent = free;

    // ¿Arranca? Necesita boot >= 1 y system >= min
    const bootOk = parts.boot.val >= parts.boot.min;
    const sysOk = parts.system.val >= parts.system.min;
    const bootEl = document.getElementById('partBoot');
    bootEl.textContent = (bootOk && sysOk) ? '✅' : '❌';
    bootEl.style.color = (bootOk && sysOk) ? 'var(--verde)' : 'var(--rosa)';
  };

  document.getElementById('partCheck').addEventListener('click', () => {
    const total = Object.values(parts).reduce((s, p) => s + p.val, 0);
    const fb = document.getElementById('partFb');
    fb.classList.add('visible');

    const allFilled = Object.values(parts).every(p => p.val >= p.min && p.val <= p.max);
    const totalOk = total === TOTAL;
    const bootOk = parts.boot.val >= parts.boot.min;
    const sysOk = parts.system.val >= parts.system.min;

    if (allFilled && totalOk && bootOk && sysOk) {
      fb.className = 'resultado-ws visible ok';
      fb.innerHTML = `✅ ¡Particionamiento perfecto! ${total} GB distribuidos. Boot: ${parts.boot.val} GB, Sistema: ${parts.system.val} GB, Datos: ${parts.data.val} GB, Swap: ${parts.swap.val} GB. <strong>+30 XP</strong>`;
      if (!estado.talleres['part']) {
        estado.talleres['part'] = true;
        addXP(30);
      }
    } else {
      fb.className = 'resultado-ws visible no';
      const problemas = [];
      if (!totalOk) problemas.push(`Suma ${total} GB (debe ser ${TOTAL})`);
      if (!bootOk) problemas.push(`Boot necesita ≥ ${parts.boot.min} GB`);
      if (!sysOk) problemas.push(`Sistema necesita ≥ ${parts.system.min} GB`);
      Object.entries(parts).forEach(([k, p]) => {
        if (p.val < p.min) problemas.push(`${p.label} está en ${p.val} GB (mín ${p.min})`);
        if (p.val > p.max) problemas.push(`${p.label} está en ${p.val} GB (máx ${p.max})`);
      });
      fb.innerHTML = `❌ Ajusta las particiones. ${problemas.join(' · ')}`;
    }
    guardarProgreso();
  });

  document.getElementById('partReset').addEventListener('click', () => {
    Object.values(parts).forEach(p => p.val = 0);
    renderControls();
    renderDisk();
    const fb = document.getElementById('partFb');
    fb.classList.remove('visible');
  });

  renderControls();
  renderDisk();
}

/* ---------- ORDEN DE PREPARACIÓN (Módulo 3) ---------- */
const ORDEN_PREP_CORRECTO = ['prep-requisitos', 'prep-respaldo', 'prep-iso', 'prep-usb', 'prep-bios'];

function inicializarOrdenPrep() {
  const cont = document.getElementById('wsOrderPrep');
  if (!cont) return;
  configurarOrdenGenerico(cont);

  const checkBtn = document.querySelector('[data-check-ws="prep"]');
  if (checkBtn) {
    checkBtn.addEventListener('click', () => {
      const items = [...cont.querySelectorAll('.ws-order-item')];
      const orden = items.map(it => it.dataset.oid);
      const fb = document.getElementById('ws-fb-prep');
      fb.classList.add('visible');

      let allOk = true;
      items.forEach((it, i) => {
        it.classList.remove('correct', 'wrong');
        const num = it.querySelector('.ord-num');
        num.textContent = i + 1;
        if (orden[i] === ORDEN_PREP_CORRECTO[i]) {
          it.classList.add('correct');
        } else {
          it.classList.add('wrong');
          allOk = false;
        }
      });

      if (allOk) {
        fb.className = 'resultado-ws visible ok';
        fb.innerHTML = `✅ ¡Orden correcto! Requisitos → Respaldo → ISO → USB → BIOS. <strong>+30 XP</strong>`;
        if (!estado.talleres['prep']) {
          estado.talleres['prep'] = true;
          addXP(30);
        }
      } else {
        fb.className = 'resultado-ws visible no';
        fb.innerHTML = `❌ Orden incorrecto. Pista: primero revisas requisitos, luego respaldas, descargas ISO, creas USB y configuras BIOS al final.`;
      }
      guardarProgreso();
    });
  }
}

function configurarOrdenGenerico(cont) {
  let dragSrc = null;
  cont.querySelectorAll('.ws-order-item').forEach(it => {
    it.addEventListener('dragstart', e => {
      dragSrc = it;
      it.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    it.addEventListener('dragend', () => it.classList.remove('dragging'));
    it.addEventListener('dragover', e => {
      e.preventDefault();
      const after = getDragAfter(cont, e.clientY);
      if (after == null) cont.appendChild(dragSrc);
      else cont.insertBefore(dragSrc, after);
    });
  });

  // Botones up/down: buscar dentro del bloque contenedor más cercano (.simulador o .challenge o .ws-block)
  const scope = cont.closest('.simulador') || cont.closest('.challenge') || cont.parentElement;
  scope.querySelectorAll('[data-ws-up]').forEach(btn => {
    btn.addEventListener('click', () => moverOrdenGenerico(cont, -1));
  });
  scope.querySelectorAll('[data-ws-down]').forEach(btn => {
    btn.addEventListener('click', () => moverOrdenGenerico(cont, 1));
  });
}

function getDragAfter(container, y) {
  const els = [...container.querySelectorAll('.ws-order-item:not(.dragging)')];
  return els.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: -Infinity }).element;
}

function moverOrdenGenerico(cont, dir) {
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
}

// click para seleccionar item (delegado)
document.addEventListener('click', e => {
  const it = e.target.closest('.ws-order-item');
  if (!it) return;
  const cont = it.parentElement;
  cont.querySelectorAll('.ws-order-item').forEach(x => x.classList.remove('selected'));
  it.classList.add('selected');
});

/* ---------- TALLER (matching + order + input) ---------- */
const TALLER_RESP = {
  1: { '1a': '1A', '1b': '1B', '1c': '1C' },
  3: { '3a': '3A', '3b': '3D', '3c': '3B', '3d': '3C' }
};
const TALLER_ORDER = { 2: ['2power', '2firmware', '2bootloader', '2kernel', '2init'] };
const TALLER_INPUT = { 4: 'booteable' };
const TALLER_SELECT = { 4: '4A' }; // respuesta correcta de la segunda parte del reto 4
let reto4Seleccion = null;

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

  // Reto 2: order con drag + flechas
  const cont2 = document.getElementById('wsOrder2');
  if (cont2) configurarOrdenGenerico(cont2);

  // Reto 4: selección simple (segunda parte)
  document.querySelectorAll('[data-r4]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-r4]').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      reto4Seleccion = chip.dataset.r4;
    });
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
  // Defensa: si este id no corresponde a ningún reto del taller, salir sin tocar XP
  if (!TALLER_RESP[id] && !TALLER_ORDER[id] && !TALLER_INPUT[id] && !TALLER_SELECT[id]) return;
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
    const items = [...cont.querySelectorAll('.ws-order-item')];
    const orden = items.map(it => it.dataset.oid);
    const expected = TALLER_ORDER[id];
    items.forEach((it, i) => {
      it.classList.remove('correct', 'wrong');
      const num = it.querySelector('.ord-num');
      num.textContent = i + 1;
      if (orden[i] === expected[i]) {
        it.classList.add('correct');
      } else {
        it.classList.add('wrong');
        allOk = false;
      }
    });
  }

  if (TALLER_INPUT[id]) {
    document.querySelectorAll(`.ws-input[data-ws="${id}"]`).forEach(inp => {
      const got = inp.value.trim().toLowerCase();
      const exp = TALLER_INPUT[id].toLowerCase();
      inp.classList.remove('correct', 'wrong');
      if (got === exp) {
        inp.classList.add('correct');
      } else {
        inp.classList.add('wrong');
        allOk = false;
      }
    });
  }

  // Selección simple (reto 4, segunda parte)
  if (TALLER_SELECT[id]) {
    const chips = document.querySelectorAll('[data-r4]');
    chips.forEach(c => c.classList.remove('correct', 'wrong'));
    if (!reto4Seleccion) {
      allOk = false;
    } else if (reto4Seleccion === TALLER_SELECT[id]) {
      const okChip = document.querySelector(`[data-r4="${TALLER_SELECT[id]}"]`);
      if (okChip) okChip.classList.add('correct');
    } else {
      const badChip = document.querySelector(`[data-r4="${reto4Seleccion}"]`);
      if (badChip) badChip.classList.add('wrong');
      const okChip = document.querySelector(`[data-r4="${TALLER_SELECT[id]}"]`);
      if (okChip) okChip.classList.add('correct');
      allOk = false;
    }
  }

  fb.classList.add('visible');
  if (allOk) {
    fb.className = 'resultado-ws visible ok';
    const msgs = {
      1: '¡Perfecto! Los 3 objetivos de la planificación: elegir bien, no perder datos, que arranque.',
      2: '¡Excelente! La secuencia correcta: Power → Firmware/POST → Bootloader → Kernel → Init.',
      3: '¡Muy bien! Servidor→Estabilidad, Laptop vieja→Liviano, Gamer→Compatibilidad, Aula→Costo cero.',
      4: '🏆 ¡JEFE FINAL VENCIDO! El bootloader no encontró dispositivo booteable porque la BIOS no tenía la USB en el boot order.'
    };
    const xpPorReto = { 1: 25, 2: 30, 3: 30, 4: 55 };
    fb.innerHTML = `✅ ${msgs[id]} <strong>+${xpPorReto[id]} XP</strong>`;
    if (!estado.talleres[id]) {
      estado.talleres[id] = true;
      addXP(xpPorReto[id]);
    }
    const retosTaller = ['1', '2', '3', '4'];
    if (retosTaller.every(r => estado.talleres[r])) {
      otorgarBadge('🛠️ Install Master Completado');
    }
  } else {
    fb.className = 'resultado-ws visible no';
    const hints = {
      1: 'Pista: Elegir bien → SO correcto; No perder datos → respaldo/particiones; Que arranque → medio + BIOS + bootloader.',
      2: 'Pista: el orden es Power → Firmware → Bootloader → Kernel → Init.',
      3: 'Pista: Servidor→Estabilidad, Laptop vieja→Liviano, Gamer→Juegos, Aula→Costo cero.',
      4: 'Pista: la palabra es "booteable" (arrancable). Y el descuido fue no configurar la BIOS/UEFI para poner la USB primero.'
    };
    fb.innerHTML = `❌ Algunas respuestas son incorrectas. ${hints[id]}`;
  }

  guardarProgreso();
}

/* ---------- BOOT SIM (Módulo 5) ---------- */
function inicializarBootSim() {
  const startBtn = document.getElementById('bootStart');
  if (!startBtn) return;

  const layers = document.querySelectorAll('#bootLayers .trace-layer');
  const logEl = document.getElementById('bootLog');
  const stepEl = document.getElementById('bootStep');
  const timeEl = document.getElementById('bootTime');
  const bootedEl = document.getElementById('bootBooted');
  let running = false;
  let booted = false;

  const layerNames = ['Firmware', 'Boot order', 'Bootloader', 'Kernel', 'Init/Systemd'];

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const clearActive = () => layers.forEach(l => l.classList.remove('active', 'done'));

  const bootLog = (cls, msg) => {
    const d = document.createElement('div');
    d.className = 'log-line';
    d.innerHTML = `<span class="t">[BOOT]</span> <span class="${cls}">${msg}</span>`;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
  };

  const runBoot = async (failAt = -1) => {
    if (running) return;
    running = true;
    booted = false;
    clearActive();
    logEl.innerHTML = '';
    bootedEl.textContent = '❌';
    bootedEl.style.color = 'var(--rosa)';
    stepEl.textContent = 'Inicio';
    timeEl.textContent = '0';

    for (let i = 0; i < layers.length; i++) {
      layers[i].classList.add('active');
      stepEl.textContent = layerNames[i];
      timeEl.textContent = (i + 1) * 350;

      if (failAt === i) {
        bootLog('err', `💥 Fallo en ${layerNames[i]}. El equipo no arranca.`);
        layers[i].classList.add('incorrecta');
        layers[i].style.borderColor = 'var(--rosa)';
        stepEl.textContent = '✗ Falló';
        await sleep(800);
        layers[i].classList.remove('active');
        running = false;
        return;
      }

      bootLog(i === 0 ? 'ok' : 't', `${layerNames[i]}: ${[
        'POST OK, RAM y CPU verificados',
        'buscando dispositivo booteable en el boot order…',
        'GRUB cargado, leyendo kernel del disco',
        'kernel inicializado, detectando hardware',
        'servicios arrancando, entorno gráfico listo'
      ][i]}`);
      await sleep(700);
      layers[i].classList.remove('active');
      layers[i].classList.add('done');
    }

    bootLog('ok', `✓ SO arrancado. Tiempo total: ${layers.length * 350} ms. ¡Bienvenido al escritorio!`);
    booted = true;
    bootedEl.textContent = '✅';
    bootedEl.style.color = 'var(--verde)';
    stepEl.textContent = '✓ Arrancado';
    clearActive();
    running = false;
    addXP(5);
  };

  startBtn.addEventListener('click', () => {
    // limpia estilos de error previos
    layers.forEach(l => { l.classList.remove('incorrecta'); l.style.borderColor = ''; });
    runBoot(-1);
  });

  document.getElementById('bootFail').addEventListener('click', () => {
    layers.forEach(l => { l.classList.remove('incorrecta'); l.style.borderColor = ''; });
    runBoot(2); // falla en bootloader
  });

  document.getElementById('bootReset').addEventListener('click', () => {
    clearActive();
    layers.forEach(l => { l.classList.remove('incorrecta'); l.style.borderColor = ''; });
    logEl.innerHTML = '<div class="log-line"><span class="t">[BOOT]</span> Esperando encendido…</div>';
    stepEl.textContent = '—';
    timeEl.textContent = '0';
    bootedEl.textContent = '❌';
    bootedEl.style.color = 'var(--rosa)';
    booted = false;
  });
}

/* ---------- INSTALADOR INTERACTIVO (Módulo 6) ---------- */
function inicializarInstalador() {
  const panel = document.getElementById('installPanel');
  if (!panel) return;

  const stepLabels = ['Idioma', 'Teclado', 'Red', 'Disco', 'Usuario', 'Copiar', 'Fin'];
  const stepsEl = document.getElementById('installSteps');
  const logEl = document.getElementById('installLog');

  let currentStep = 0;
  let elecciones = {};

  const renderSteps = () => {
    stepsEl.innerHTML = stepLabels.map((label, i) => {
      let cls = '';
      if (i < currentStep) cls = 'done';
      else if (i === currentStep) cls = 'active';
      return `<div class="install-step-dot ${cls}">${i + 1}. ${label}</div>`;
    }).join('');
  };

  const showStep = (n) => {
    panel.querySelectorAll('.install-screen').forEach(s => s.style.display = 'none');
    const screen = panel.querySelector(`.install-screen[data-step="${n}"]`);
    if (screen) screen.style.display = 'block';
    currentStep = n;
    renderSteps();
  };

  const instLog = (cls, msg) => {
    const d = document.createElement('div');
    d.className = 'log-line';
    d.innerHTML = `<span class="t">[INST]</span> <span class="${cls}">${msg}</span>`;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
  };

  // Botones de opciones (pasos 0-3)
  panel.querySelectorAll('.install-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.dataset.step, 10);
      const val = btn.dataset.val;
      elecciones[step] = val;
      const stepNames = ['Idioma', 'Teclado', 'Red', 'Tipo de instalación'];
      instLog('ok', `✓ ${stepNames[step]}: ${btn.textContent.trim()}`);
      addXP(3);
      showStep(step + 1);
    });
  });

  // Paso 4: usuario
  const userNext = document.getElementById('instUserNext');
  if (userNext) {
    userNext.addEventListener('click', () => {
      const name = document.getElementById('instName').value.trim();
      const user = document.getElementById('instUser').value.trim();
      const pass = document.getElementById('instPass').value;
      if (!name || !user || pass.length < 6) {
        instLog('err', '⚠ Faltan datos o la contraseña tiene menos de 6 caracteres.');
        return;
      }
      elecciones.user = { name, user };
      instLog('ok', `✓ Usuario creado: ${user} (${name})`);
      addXP(5);
      showStep(5);

      // Simular copia con barra
      const bar = document.getElementById('installCopyBar');
      const pct = document.getElementById('installCopyPct');
      let p = 0;
      const interval = setInterval(() => {
        p += 2 + Math.floor(Math.random() * 5);
        if (p >= 100) { p = 100; clearInterval(interval); instLog('ok', '✓ Archivos copiados. Instalación lista.'); addXP(10); setTimeout(() => showStep(6), 400); }
        if (bar) bar.style.width = p + '%';
        if (pct) pct.textContent = p + '%';
      }, 120);
    });
  }

  // Paso 6: finish
  const finish = document.getElementById('instFinish');
  if (finish) {
    finish.addEventListener('click', () => {
      instLog('ok', '🔁 Reiniciando… ¡Quita la USB! El bootloader cargará el nuevo SO.');
      addXP(15);
    });
  }

  showStep(0);
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