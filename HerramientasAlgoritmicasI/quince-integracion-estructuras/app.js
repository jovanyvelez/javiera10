/* ============================================================
   CLASE 15 — INTEGRACIÓN DE ESTRUCTURAS (La Forja del Programador)
   Lógica de navegación, simuladores, quizzes y taller
============================================================ */

const TOTAL_MODULOS = 6; // 0..5

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
const XP_POR_TALLER = 25;
const XP_TOTAL = 500;

/* ---------- INICIO ---------- */
document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarCopiarCodigo();
  configurarQuizzes();
  configurarQuizzFormativa();
  configurarTalleres();
  inicializarTienda();
  inicializarJuego();
  inicializarVotacion();
  configurarTeclado();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
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
    localStorage.setItem('curso-integracion-estructuras', JSON.stringify(datos));
  } catch (e) {}
}

function cargarProgreso() {
  try {
    const datos = JSON.parse(localStorage.getItem('curso-integracion-estructuras'));
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
    1: '🧰 Toolbox Master',
    2: '🛒 Tienda Pro',
    3: '🎲 Adivino Experto',
    4: '🗳️ Estadístico',
    5: '🏆 Maestro Integrador'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🔨 Forja Completada');
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

/* ---------- QUIZZES ESTÁNDAR ---------- */
function configurarQuizzes() {
  document.querySelectorAll('.quiz:not([data-formativa])').forEach(quiz => {
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

/* ---------- QUIZ FORMATIVA (M5) ---------- */
function configurarQuizzFormativa() {
  const quiz = document.querySelector('.quiz[data-formativa]');
  if (!quiz) return;

  const idQuiz = '5-formativa';
  const preguntas = quiz.querySelectorAll('.pregunta');

  preguntas.forEach((pregunta, idx) => {
    const correcta = pregunta.dataset.correcta;
    const opciones = pregunta.querySelectorAll('.opcion');
    const feedback = pregunta.nextElementSibling;

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

        if (feedback && feedback.classList.contains('quiz-feedback')) {
          feedback.classList.add('visible');
        }

        verificarQuizCompleto(quiz, idQuiz);
      });
    });
  });
}

/* ---------- TALLER ---------- */
function configurarTalleres() {
  document.querySelectorAll('[data-check-ws]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.checkWs;
      const inputs = document.querySelectorAll(`.ws-input[data-ws="${id}"]`);
      const fb = document.getElementById(`ws-fb-${id}`);
      let allOk = true;

      inputs.forEach(inp => {
        const got = inp.value.trim().replace(/\s+/g, ' ').toLowerCase();
        const exp = inp.dataset.ans.toLowerCase();
        const ok = got === exp || got === exp.replace(/\s+/g, '');
        inp.classList.remove('correct', 'wrong');
        inp.classList.add(ok ? 'correct' : 'wrong');
        if (!ok) allOk = false;
      });

      fb.classList.add('visible');
      if (allOk) {
        fb.className = 'resultado-ws visible ok';
        const msgs = {
          1: '¡Excelente! Búsqueda básica: <code>nombres[i] == nombre</code> compara cada elemento del arreglo con el valor buscado.',
          2: '¡Muy bien! Para contar aprobados: <code>if (nota &gt;= 60)</code> detecta, y <code>cant++</code> acumula. Doble acción dentro del ciclo.',
          3: '¡Perfecto! Filtrar pares: <code>n % 2 == 0</code> detecta los pares. El <code>k++</code> controla la posición en el arreglo destino.',
          4: '🏆 ¡FORJA COMPLETA! Has dominado las 3 estructuras: sumar (<code>suma +=</code>), contar (<code>aprobados++</code>) y buscar el máximo (<code>if (nota &gt; max)</code>). ¡Eres un Maestro Integrador!'
        };
        const xpPorReto = { 1: 15, 2: 20, 3: 20, 4: 30 };
        fb.innerHTML = `✅ ${msgs[id]} <strong>+${xpPorReto[id]} XP</strong>`;
        if (!estado.talleres[id]) {
          estado.talleres[id] = true;
          addXP(xpPorReto[id]);
        }
        if (Object.keys(estado.talleres).length === 4) {
          otorgarBadge('🏆 Gran Proyecto Completado');
        }
      } else {
        fb.className = 'resultado-ws visible no';
        const hints = {
          1: 'Pista: dentro del <code>if</code>, compara el elemento actual del arreglo (<code>nombres[i]</code>) con el valor buscado (<code>nombre</code>) usando <code>==</code>.',
          2: 'Pista: la condición es <code>nota &gt;= 60</code> y el incremento se hace con <code>cant++</code> (post-incremento).',
          3: 'Pista: el operador módulo (<code>%</code>) devuelve el resto. Si <code>n % 2 == 0</code>, es par. <code>k++</code> avanza la posición.',
          4: 'Pista: <code>suma += nota</code> acumula. <code>aprobados++</code> cuenta. <code>if (nota &gt; max)</code> detecta el nuevo máximo.'
        };
        fb.innerHTML = `❌ Algunas respuestas son incorrectas. ${hints[id]}`;
      }

      guardarProgreso();
    });
  });
}

/* ---------- SIMULADOR 1: TIENDA DE FRUTAS (M2) ---------- */
function inicializarTienda() {
  const cont = document.getElementById('fruteria');
  if (!cont) return;

  const frutas = [
    { emoji: '🍎', nombre: 'Manzana',  precio: 2.50 },
    { emoji: '🍌', nombre: 'Banana',   precio: 1.80 },
    { emoji: '🍊', nombre: 'Naranja',  precio: 3.00 },
    { emoji: '🍐', nombre: 'Pera',     precio: 2.80 },
    { emoji: '🍇', nombre: 'Uvas',     precio: 5.50 },
    { emoji: '🍓', nombre: 'Fresa',    precio: 4.20 },
    { emoji: '🥝', nombre: 'Kiwi',     precio: 6.00 },
    { emoji: '🍉', nombre: 'Sandía',   precio: 8.00 }
  ];

  const LIMITE = 50;
  const DESC = 0.10;
  let carrito = [];

  const renderFruteria = () => {
    cont.innerHTML = '';
    frutas.forEach((f, idx) => {
      const card = document.createElement('div');
      card.className = 'fruta-card';
      card.innerHTML = `
        <span class="fruta-emoji">${f.emoji}</span>
        <div class="fruta-nombre">${f.nombre}</div>
        <div class="fruta-precio">$${f.precio.toFixed(2)}</div>
      `;
      card.addEventListener('click', () => {
        carrito.push(f);
        actualizar();
        addXP(2);
      });
      cont.appendChild(card);
    });
  };

  const actualizar = () => {
    const subtotal = carrito.reduce((s, f) => s + f.precio, 0);
    const items = carrito.length;
    const descuento = subtotal > LIMITE ? subtotal * DESC : 0;
    const total = subtotal - descuento;

    document.getElementById('tienda-items').textContent = items;
    document.getElementById('tienda-subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('tienda-total').textContent = '$' + total.toFixed(2);

    if (descuento > 0) {
      document.getElementById('tienda-desc').textContent = '-$' + descuento.toFixed(2);
      document.getElementById('tienda-desc-stat').style.display = 'block';
    } else {
      document.getElementById('tienda-desc-stat').style.display = 'none';
    }

    // Ticket
    const ticket = document.getElementById('tienda-ticket');
    if (carrito.length === 0) {
      ticket.innerHTML = '<div style="text-align: center; color: var(--texto-suave); padding: 1rem;">El carrito está vacío. Haz clic en una fruta.</div>';
    } else {
      let html = '';
      const grupos = {};
      carrito.forEach(f => {
        grupos[f.nombre] = (grupos[f.nombre] || 0) + 1;
      });
      for (const [nombre, cant] in Object.entries(grupos)) {
        const f = frutas.find(x => x.nombre === nombre);
        const subtotalItem = f.precio * cant;
        html += `<div class="ticket-line"><span class="key">${f.emoji} ${nombre} × ${cant}</span><span class="val">$${subtotalItem.toFixed(2)}</span></div>`;
      }
      html += `<div class="ticket-line" style="margin-top: 0.7rem; border-top: 1px solid var(--lima); padding-top: 0.5rem;"><span class="key">Subtotal</span><span class="val">$${subtotal.toFixed(2)}</span></div>`;
      if (descuento > 0) {
        html += `<div class="ticket-line descuento"><span class="key">🎉 Descuento 10%</span><span class="val">-$${descuento.toFixed(2)}</span></div>`;
      }
      html += `<div class="ticket-line total"><span class="key">TOTAL</span><span class="val">$${total.toFixed(2)}</span></div>`;
      ticket.innerHTML = html;
    }
  };

  renderFruteria();

  document.getElementById('tienda-vaciar').addEventListener('click', () => {
    carrito = [];
    actualizar();
  });
}

/* ---------- SIMULADOR 2: ADIVINA EL NÚMERO (M3) ---------- */
function inicializarJuego() {
  const inputEl = document.getElementById('juego-input');
  if (!inputEl) return;

  let secreto = 0;
  let intentos = 0;
  let terminado = false;
  let historial = [];
  const ranking = [];

  const nuevoNumero = () => {
    secreto = Math.floor(Math.random() * 100) + 1;
    intentos = 0;
    terminado = false;
    historial = [];
    document.getElementById('juego-feedback').className = 'juego-feedback info';
    document.getElementById('juego-feedback').textContent = 'Nuevo número. ¡Adivina!';
    document.getElementById('juego-historial').innerHTML = '';
    inputEl.value = 50;
    renderRanking();
  };

  const probar = () => {
    if (terminado) return;
    const v = parseInt(inputEl.value, 10);
    if (isNaN(v) || v < 1 || v > 100) {
      const fb = document.getElementById('juego-feedback');
      fb.className = 'juego-feedback info';
      fb.textContent = '⚠️ Ingresa un número entre 1 y 100';
      return;
    }

    intentos++;
    historial.push(v);

    const fb = document.getElementById('juego-feedback');

    if (v === secreto) {
      fb.className = 'juego-feedback ganaste';
      fb.innerHTML = `🎉 ¡CORRECTO! El número era ${secreto}. Lo lograste en <strong>${intentos}</strong> intentos.`;
      terminado = true;
      // Agregar al ranking
      ranking.push({ intentos, fecha: new Date().toLocaleDateString() });
      ranking.sort((a, b) => a.intentos - b.intentos);
      if (ranking.length > 5) ranking.length = 5;
      renderRanking();
      addXP(10);
    } else if (v > secreto) {
      fb.className = 'juego-feedback alto';
      fb.innerHTML = `📉 <strong>${v}</strong> es muy ALTO. Intenta con uno más bajo.`;
      addXP(2);
    } else {
      fb.className = 'juego-feedback bajo';
      fb.innerHTML = `📈 <strong>${v}</strong> es muy BAJO. Intenta con uno más alto.`;
      addXP(2);
    }

    // Render historial
    const histEl = document.getElementById('juego-historial');
    histEl.innerHTML = historial.map(v => {
      let cls = 'juego-intento';
      if (v === secreto) cls += ' igual';
      else if (v > secreto) cls += ' alto';
      else cls += ' bajo';
      return `<div class="${cls}">${v}</div>`;
    }).join('');
  };

  const renderRanking = () => {
    const body = document.getElementById('ranking-body');
    if (ranking.length === 0) {
      body.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--texto-suave);">Aún sin puntajes. ¡Sé el primero!</td></tr>';
      return;
    }
    body.innerHTML = ranking.map((r, i) => `
      <tr>
        <td>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1)}</td>
        <td>${r.intentos} intentos</td>
        <td>${r.fecha}</td>
      </tr>
    `).join('');
  };

  document.getElementById('juego-probar').addEventListener('click', probar);
  document.getElementById('juego-nuevo').addEventListener('click', nuevoNumero);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') probar();
  });

  nuevoNumero();
}

/* ---------- SIMULADOR 3: SISTEMA DE VOTACIÓN (M4) ---------- */
function inicializarVotacion() {
  const cont = document.getElementById('candidatos-grid');
  if (!cont) return;

  const candidatos = [
    { emoji: '🤖', nombre: 'Atlas',  votos: 0 },
    { emoji: '🎨', nombre: 'Pixel',  votos: 0 },
    { emoji: '🔬', nombre: 'Nova',   votos: 0 },
    { emoji: '🌟', nombre: 'Cosmos', votos: 0 }
  ];

  let cerrado = false;

  const render = () => {
    cont.innerHTML = '';
    const total = candidatos.reduce((s, c) => s + c.votos, 0);
    const max = Math.max(...candidatos.map(c => c.votos));

    candidatos.forEach((c, idx) => {
      const card = document.createElement('div');
      card.className = 'candidato';
      if (cerrado && c.votos === max && max > 0) card.classList.add('ganador');
      const porcentaje = total > 0 ? (c.votos * 100 / total) : 0;
      card.innerHTML = `
        <span class="candidato-emoji">${c.emoji}</span>
        <div class="candidato-nombre">${c.nombre}</div>
        <div class="candidato-votos">${c.votos} votos (${porcentaje.toFixed(1)}%)</div>
        <div class="candidato-barra"><div class="candidato-barra-fill" style="width: ${porcentaje}%"></div></div>
      `;
      if (!cerrado) {
        card.addEventListener('click', () => {
          c.votos++;
          render();
          addXP(2);
        });
      }
      cont.appendChild(card);
    });

    document.getElementById('voto-total').innerHTML = `Votos totales: <strong>${total}</strong> · Candidatos: <strong>${candidatos.length}</strong>`;
  };

  render();

  document.getElementById('voto-cerrar').addEventListener('click', () => {
    if (cerrado) return;
    cerrado = true;
    const total = candidatos.reduce((s, c) => s + c.votos, 0);
    if (total === 0) {
      alert('No hay votos todavía. ¡Vota al menos una vez!');
      cerrado = false;
      return;
    }
    let maxIdx = 0;
    for (let i = 1; i < candidatos.length; i++) {
      if (candidatos[i].votos > candidatos[maxIdx].votos) maxIdx = i;
    }
    const ganador = candidatos[maxIdx];
    const hayEmpate = candidatos.filter(c => c.votos === ganador.votos).length > 1;

    render();

    const ganadorEl = document.getElementById('voto-ganador');
    const textoEl = document.getElementById('voto-ganador-texto');
    if (hayEmpate) {
      textoEl.innerHTML = `🤝 <strong>¡EMPATE!</strong> entre varios candidatos con <strong>${ganador.votos} votos</strong> cada uno.`;
    } else {
      textoEl.innerHTML = `${ganador.emoji} <strong>${ganador.nombre}</strong> con <strong>${ganador.votos} votos</strong> de ${total} (${(ganador.votos * 100 / total).toFixed(1)}%).`;
    }
    ganadorEl.style.display = 'block';
    addXP(15);
  });

  document.getElementById('voto-reiniciar').addEventListener('click', () => {
    candidatos.forEach(c => c.votos = 0);
    cerrado = false;
    document.getElementById('voto-ganador').style.display = 'none';
    render();
  });
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
    background: 'linear-gradient(135deg, #14b8a6, #84cc16)',
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
