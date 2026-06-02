/* ============================================================
   CLASE 16 — MARATÓN DE ALGORITMOS
   Lógica de navegación, retos, rúbrica, FAQ y cronómetro
============================================================ */

const TOTAL_MODULOS = 6; // 0..5

/* ---------- ESTADO GLOBAL ---------- */
const estado = {
  moduloActual: 0,
  completados: new Set(),
  retos: new Set(),          // IDs de retos completados correctamente
  rubrica: {},               // {1: 4, 2: 5, ...}
  badges: new Set(),
  xp: 0
};

const XP_POR_MODULO = 30;
const XP_POR_RETO = 8;
const XP_POR_RUBRICA = 25;
const XP_TOTAL = 500;

/* ---------- INICIO ---------- */
document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarCopiarCodigo();
  configurarTodosLosRetos();
  configurarRubrica();
  configurarFAQ();
  iniciarCronometroHero();
  configurarTeclado();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
function guardarProgreso() {
  try {
    const datos = {
      moduloActual: estado.moduloActual,
      completados: [...estado.completados],
      retos: [...estado.retos],
      rubrica: estado.rubrica,
      badges: [...estado.badges],
      xp: estado.xp
    };
    localStorage.setItem('curso-maraton-algoritmos', JSON.stringify(datos));
  } catch (e) {}
}

function cargarProgreso() {
  try {
    const datos = JSON.parse(localStorage.getItem('curso-maraton-algoritmos'));
    if (!datos) return;
    estado.moduloActual = datos.moduloActual || 0;
    estado.completados = new Set(datos.completados || []);
    estado.retos = new Set(datos.retos || []);
    estado.rubrica = datos.rubrica || {};
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
    1: '🔥 Buena Forma',
    2: '⚡ Velocista',
    3: '🦾 Persistente',
    4: '🏅 Juicio Crítico',
    5: '🎓 Maratonista'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏁 Maratón Completada');
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

/* ---------- UI ---------- */
function actualizarUI() {
  const total = TOTAL_MODULOS - 1;
  const completos = [...estado.completados].filter(x => x >= 1 && x <= 5).length;
  const pct = Math.round((completos / total) * 100);

  const barra = document.getElementById('barra');
  if (barra) barra.style.width = pct + '%';

  const ptxt = document.getElementById('porcentaje');
  if (ptxt) ptxt.textContent = pct + '%';

  const mAct = document.getElementById('modulo-actual');
  if (mAct) mAct.textContent = 'Módulo ' + estado.moduloActual;

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
      const code = btn.closest('.code-wrap').querySelector('code').innerText;
      navigator.clipboard.writeText(code).then(() => {
        const original = btn.textContent;
        btn.textContent = '✅ Copiado';
        btn.classList.add('ok');
        setTimeout(() => { btn.textContent = original; btn.classList.remove('ok'); }, 1800);
      });
    });
  });
}

/* ---------- RETOS (todos) ---------- */
function configurarTodosLosRetos() {
  document.querySelectorAll('.reto').forEach(reto => {
    const idReto = parseInt(reto.dataset.reto, 10);

    // Si ya estaba completado en una sesión anterior, restaurarlo
    if (estado.retos.has(idReto)) {
      reto.classList.add('completado');
      reto.querySelectorAll('.opcion').forEach(op => {
        if (op.dataset.correcta === 'true') op.classList.add('correcta');
        op.disabled = true;
      });
      const resultado = reto.querySelector('.resultado-reto');
      if (resultado) {
        resultado.classList.add('ok');
        resultado.textContent = '✅ Ya completado en una sesión anterior. +8 XP';
      }
    }

    reto.querySelectorAll('.opcion').forEach(op => {
      op.addEventListener('click', () => {
        if (reto.dataset.respondido === 'true') return;
        reto.dataset.respondido = 'true';

        const esCorrecta = op.dataset.correcta === 'true';

        // Marcar opciones: verde la correcta, rojo la elegida incorrecta
        reto.querySelectorAll('.opcion').forEach(o => {
          o.disabled = true;
          if (o.dataset.correcta === 'true') o.classList.add('correcta');
        });
        if (!esCorrecta) op.classList.add('incorrecta');

        // Mostrar feedback
        const resultado = reto.querySelector('.resultado-reto');
        if (esCorrecta) {
          resultado.classList.add('ok');
          resultado.textContent = '✅ ¡Correcto! +8 XP';
          if (!estado.retos.has(idReto)) {
            estado.retos.add(idReto);
            addXP(XP_POR_RETO);
            reto.classList.add('completado');
          }
        } else {
          resultado.classList.add('no');
          resultado.textContent = '❌ Incorrecto. La respuesta correcta está marcada en verde. No te castigues, anota tu duda para el Módulo 5.';
        }

        actualizarStatsMaraton();
        guardarProgreso();
      });
    });
  });

  actualizarStatsMaraton();
}

function actualizarStatsMaraton() {
  // Configuración visual de los chips de la maratón
  const chips = [
    { ids: ['m1-stat-1', 'm1-stat-2', 'm1-stat-3'], icono: '⚡', desde: 6 },
    { ids: ['m2-stat-1', 'm2-stat-2', 'm2-stat-3'], icono: '🦾', desde: 9 }
  ];

  chips.forEach(grupo => {
    grupo.ids.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const retoNum = grupo.desde + i;
      if (estado.retos.has(retoNum)) {
        el.textContent = `${grupo.icono} Reto ${i + 1}: ✓ listo`;
        el.classList.add('done');   // clase CSS para el estado "completado"
      }
    });
  });
}

/* ---------- RÚBRICA (M4) ---------- */
function configurarRubrica() {
  const criterios = document.querySelectorAll('.criterio');

  criterios.forEach(criterio => {
    const num = parseInt(criterio.dataset.criterio, 10);
    const botones = criterio.querySelectorAll('.criterio-btn');
    const actualEl = criterio.querySelector('.criterio-actual');

    // Restaurar valor guardado
    if (estado.rubrica[num]) {
      botones.forEach(b => {
        if (parseInt(b.dataset.valor, 10) === estado.rubrica[num]) {
          b.classList.add('activo');
        }
      });
      actualizarTextoActual(actualEl, num);
    }

    botones.forEach(btn => {
      btn.addEventListener('click', () => {
        botones.forEach(b => b.classList.remove('activo'));
        btn.classList.add('activo');
        estado.rubrica[num] = parseInt(btn.dataset.valor, 10);
        actualizarTextoActual(actualEl, num);
        guardarProgreso();
      });
    });
  });

  document.getElementById('calcular-rubrica').addEventListener('click', calcularRubrica);
  document.getElementById('reset-rubrica').addEventListener('click', () => {
    if (confirm('¿Borrar tu autoevaluación? Tendrás que completarla de nuevo.')) {
      estado.rubrica = {};
      criterios.forEach(criterio => {
        criterio.querySelectorAll('.criterio-btn').forEach(b => b.classList.remove('activo'));
        criterio.querySelector('.criterio-actual').textContent = '';
      });
      document.getElementById('resultado-rubrica').style.display = 'none';
      guardarProgreso();
    }
  });
}

function actualizarTextoActual(el, num) {
  const textos = {
    1: ['Muy bajo', 'Bajo', 'Aceptable', 'Bueno', 'Experto'],
    2: ['Muy ineficiente', 'Ineficiente', 'Aceptable', 'Eficiente', 'Muy eficiente'],
    3: ['Confuso', 'Poco claro', 'Aceptable', 'Claro', 'Muy claro'],
    4: ['Básico', 'Mejorable', 'Aceptable', 'Elegante', 'Excelente'],
    5: ['Muy incompleto', 'Incompleto', 'Aceptable', 'Casi todo', 'Completo']
  };
  const val = estado.rubrica[num];
  if (val && el) {
    el.textContent = `Tu nivel: ${val}/5 — ${textos[num][val - 1]}`;
  }
}

function calcularRubrica() {
  const valores = Object.values(estado.rubrica);
  if (valores.length < 5) {
    alert('Por favor evalúa los 5 criterios antes de ver tu nivel general.');
    return;
  }

  const promedio = valores.reduce((s, v) => s + v, 0) / 5;
  const resultado = document.getElementById('resultado-rubrica');
  const nivelTexto = document.getElementById('nivel-texto');
  const barras = document.getElementById('barras-rubrica');
  const recs = document.getElementById('recomendaciones');

  // Determinar nivel general — usando tabla de búsqueda (más legible que if/else)
  const NIVELES = [
    { min: 4.5, nombre: 'Experto / Mentor', color: 'var(--dorado)' },
    { min: 3.8, nombre: 'Avanzado',        color: 'var(--lima)' },
    { min: 3.0, nombre: 'Competente',      color: 'var(--naranja)' },
    { min: 2.0, nombre: 'En desarrollo',  color: 'var(--coral)' },
    { min: 0.0, nombre: 'Principiante',   color: 'var(--azul-claro)' }
  ];
  const nivelObj = NIVELES.find(n => promedio >= n.min);
  nivelTexto.innerHTML = `<span style="color: ${nivelObj.color}">${nivelObj.nombre}</span> (${promedio.toFixed(1)}/5)`;

  // Barras visuales
  const labels = { 1: 'Corrección', 2: 'Eficiencia', 3: 'Claridad', 4: 'Elegancia', 5: 'Completitud' };
  barras.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const v = estado.rubrica[i];
    const pct = (v / 5) * 100;
    barras.innerHTML += `
      <div class="barra-criterio">
        <span class="label">${labels[i]}</span>
        <div class="barra"><div class="barra-fill" style="width: ${pct}%"></div></div>
        <span class="valor">${v}/5</span>
      </div>
    `;
  }

  // Recomendaciones basadas en los criterios con puntaje bajo
  const RECS = {
    1: 'Vuelve a la clase 12 (Contadores, Acumuladores, Banderas) y practica los simuladores. La base sólida hace todo lo demás más fácil.',
    2: 'Revisa la clase 14 (Validación). Aprender a evitar trabajo innecesario hace tu código más rápido y tu mente más clara.',
    3: 'Trabaja con un cuaderno al lado: antes de programar, escribe en español qué quieres hacer. La planificación esclarece.',
    4: 'Busca soluciones de otros programadores a problemas similares. Con el tiempo, irás reconociendo los "trucos" elegantes.',
    5: 'Termina los retos pendientes antes de seguir. La completitud construye confianza, y la confianza construye más completitud.'
  };
  const areasDebiles = Object.entries(estado.rubrica).filter(([, v]) => v <= 3);

  if (areasDebiles.length > 0) {
    const lista = areasDebiles
      .map(([k]) => `<li><strong>${labels[k]}:</strong> ${RECS[k]}</li>`)
      .join('');
    recs.innerHTML = `<h4>🎯 Áreas para reforzar (puntaje ≤ 3):</h4><ul>${lista}</ul>`;
  } else {
    recs.innerHTML = '<h4>🌟 ¡Excelente!</h4><p>Todos tus criterios están sobre 3. Estás listo para temas más avanzados.</p>';
  }

  // Mostrar el resultado
  resultado.style.display = 'block';

  // XP por completar la rúbrica
  if (!resultado.dataset.recompensado) {
    resultado.dataset.recompensado = 'true';
    addXP(XP_POR_RUBRICA);
    mostrarToast('🏅 ¡Rúbrica completada! +25 XP');
  }
}

/* ---------- FAQ (M5) ---------- */
function configurarFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const pregunta = item.querySelector('.faq-pregunta');
    pregunta.addEventListener('click', () => {
      item.classList.toggle('abierta');
    });
  });
}

/* ---------- CRONÓMETRO HERO (M0) ---------- */
function iniciarCronometroHero() {
  const el = document.getElementById('cronometro-hero');
  if (!el) return;

  const inicio = Date.now();
  setInterval(() => {
    const seg = Math.floor((Date.now() - inicio) / 1000);
    const h = String(Math.floor(seg / 3600)).padStart(2, '0');
    const m = String(Math.floor((seg % 3600) / 60)).padStart(2, '0');
    const s = String(seg % 60).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  }, 1000);
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
    background: 'linear-gradient(135deg, #ef4444, #facc15)',
    color: '#000',
    padding: '0.9rem 1.4rem',
    borderRadius: '30px',
    fontWeight: '700',
    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
    zIndex: '1000',
    transition: 'all 0.4s ease',
    opacity: '0',
    transform: 'translateY(20px)'
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
