/* ============================================================
   CLASE 12 — CONTADORES, ACUMULADORES Y BANDERAS
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
  configurarTalleres();
  iniciarHeroAnimacion();
  inicializarSimuladorContador();
  inicializarSimuladorTienda();
  inicializarSimuladorEscaner();
  inicializarSimuladorCajero();
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
    localStorage.setItem('curso-contadores-acum-banderas', JSON.stringify(datos));
  } catch (e) { /* sin localStorage: ignorar */ }
}

function cargarProgreso() {
  try {
    const datos = JSON.parse(localStorage.getItem('curso-contadores-acum-banderas'));
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
    1: '🚪 Counter Master',
    2: '🛒 Shop Keeper',
    3: '🚨 Flag Hunter',
    4: '💰 Cashier Pro',
    5: '🛠️ Code Master'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 Estado Dominado');
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

/* ---------- TALLER (workshop inputs) ---------- */
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
          1: '¡Perfecto! Has dominado el contador. Recuerda: siempre inicializa en 0 y usa ++ dentro del bucle.',
          2: '¡Excelente! Acumulador y promedio funcionan. La fórmula <code>total / Length</code> es la base de toda estadística.',
          3: '¡Muy bien! La bandera se inicializa en false, se activa con true, y se consulta al final. Patrón clásico de búsqueda.',
          4: '🏆 ¡MAESTRO TOTAL! Has integrado las 3 herramientas: contador (aprobados++), acumulador (suma += nota) y bandera (hayReprobados = true).'
        };
        const xpPorReto = { 1: 15, 2: 20, 3: 20, 4: 30 };
        fb.innerHTML = `✅ ${msgs[id]} <strong>+${xpPorReto[id]} XP</strong>`;
        if (!estado.talleres[id]) {
          estado.talleres[id] = true;
          addXP(xpPorReto[id]);
        }
        if (Object.keys(estado.talleres).length === 4) {
          otorgarBadge('🛠️ Code Master Completado');
        }
      } else {
        fb.className = 'resultado-ws visible no';
        const hints = {
          1: 'Pista: el contador siempre se inicializa en 0, usa ++ para incrementar, y el if compara con ==.',
          2: 'Pista: el acumulador inicia en 0, usa += para sumar, y .Length te da el tamaño del arreglo.',
          3: 'Pista: la bandera inicia en false, se activa con true, y se consulta directamente como if (hayNegativo).',
          4: 'Pista: inicializa la bandera en false, usa += para acumular, >= para comparar, ++ para contar, y true para activar.'
        };
        fb.innerHTML = `❌ Algunas respuestas son incorrectas (marcadas en rojo). ${hints[id]}`;
      }

      guardarProgreso();
    });
  });
}

/* ---------- HERO ANIMACIÓN ---------- */
function iniciarHeroAnimacion() {
  const hcEl = document.getElementById('hero-counter');
  const htEl = document.getElementById('hero-total');
  const hfEl = document.getElementById('hero-flag');
  if (!hcEl) return;

  let c = 0, t = 0, f = false;
  setInterval(() => {
    c = (c + 1) % 10;
    t += Math.random() * 15;
    if (c === 5) f = true;
    hcEl.textContent = c;
    htEl.textContent = '$' + t.toFixed(2);
    hfEl.textContent = f ? 'true' : 'false';
    hfEl.style.color = f ? 'var(--verde)' : 'var(--rosa)';
  }, 1200);
}

/* ---------- SIMULADOR 1: CONTADOR (Club) ---------- */
function inicializarSimuladorContador() {
  const numEl = document.getElementById('counterNum');
  if (!numEl) return;

  let count = 0;
  const AFORO = 20;
  const peopleEl = document.getElementById('counterPeople');
  const memVal = document.getElementById('mem-counter-val');
  const memCell = document.getElementById('mem-counter');
  const memEstadoVal = document.getElementById('mem-estado-val');
  const memEstadoCell = document.getElementById('mem-estado');

  const render = () => {
    numEl.textContent = count;
    memVal.textContent = count;
    numEl.classList.remove('bump');
    void numEl.offsetWidth;
    numEl.classList.add('bump');
    memCell.classList.remove('flash');
    void memCell.offsetWidth;
    memCell.classList.add('flash');

    peopleEl.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'person-icon';
      p.textContent = '🧑';
      peopleEl.appendChild(p);
    }

    if (count >= AFORO) {
      memEstadoVal.textContent = 'LLENO';
      memEstadoCell.style.color = 'var(--rosa)';
    } else if (count >= AFORO * 0.7) {
      memEstadoVal.textContent = 'Casi lleno';
      memEstadoCell.style.color = 'var(--amarillo)';
    } else {
      memEstadoVal.textContent = 'Abierto';
      memEstadoCell.style.color = 'var(--verde)';
    }
  };

  document.getElementById('counterAdd').addEventListener('click', () => {
    if (count < AFORO) { count++; render(); addXP(2); }
  });
  document.getElementById('counterSub').addEventListener('click', () => {
    if (count > 0) { count--; render(); }
  });
  document.getElementById('counterReset').addEventListener('click', () => {
    count = 0; render();
  });

  render();
}

/* ---------- SIMULADOR 2: TIENDA (Acumulador) ---------- */
function inicializarSimuladorTienda() {
  const grid = document.getElementById('shopGrid');
  if (!grid) return;

  const products = [
    { icon: '🎧', name: 'Auriculares',   price: 29.99 },
    { icon: '⌚', name: 'Smartwatch',    price: 89.50 },
    { icon: '📱', name: 'Funda móvil',   price: 12.00 },
    { icon: '🖱️', name: 'Mouse gamer',   price: 45.00 },
    { icon: '⌨️', name: 'Teclado RGB',   price: 69.99 },
    { icon: '🎮', name: 'Control',       price: 55.00 },
    { icon: '💾', name: 'USB 64GB',      price: 15.50 },
    { icon: '🔌', name: 'Cable USB-C',   price:  9.99 }
  ];

  let cart = [];
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const memTotal = document.getElementById('mem-total-val');
  const memItems = document.getElementById('mem-items-val');
  const memLast = document.getElementById('mem-last-val');
  const memTotalCell = document.getElementById('mem-total');
  const memItemsCell = document.getElementById('mem-items');
  const codePrecio = document.getElementById('codePrecio');

  const render = () => {
    const total = cart.reduce((s, p) => s + p.price, 0);
    const cnt = cart.length;

    cartTotalEl.textContent = '$' + total.toFixed(2);
    memTotal.textContent = '$' + total.toFixed(2);
    memItems.textContent = cnt;

    memTotalCell.classList.remove('flash');
    void memTotalCell.offsetWidth;
    memTotalCell.classList.add('flash');
    memItemsCell.classList.remove('flash');
    void memItemsCell.offsetWidth;
    memItemsCell.classList.add('flash');

    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<div style="color:var(--texto-suave);text-align:center;padding:1rem;font-size:.85rem">Aún no has añadido productos</div>';
    } else {
      cartItemsEl.innerHTML = cart.map((p) =>
        `<div class="cart-item"><span class="name">${p.icon} ${p.name}</span><span class="price">$${p.price.toFixed(2)}</span></div>`
      ).join('');
      cartItemsEl.scrollTop = cartItemsEl.scrollHeight;
    }
  };

  products.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <span class="product-icon">${p.icon}</span>
      <div class="product-name">${p.name}</div>
      <div class="product-price">$${p.price.toFixed(2)}</div>
    `;
    card.addEventListener('click', () => {
      cart.push(p);
      codePrecio.textContent = p.price.toFixed(2);
      memLast.textContent = '$' + p.price.toFixed(2);
      card.classList.remove('added');
      void card.offsetWidth;
      card.classList.add('added');
      render();
      addXP(2);
    });
    grid.appendChild(card);
  });

  document.getElementById('cartClear').addEventListener('click', () => {
    cart = [];
    memLast.textContent = '$0.00';
    render();
  });

  render();
}

/* ---------- SIMULADOR 3: ESCÁNER (Bandera) ---------- */
function inicializarSimuladorEscaner() {
  const conveyor = document.getElementById('conveyor');
  if (!conveyor) return;

  const allowed = [
    { icon: '💼', name: 'Maletín',     banned: false },
    { icon: '📱', name: 'Celular',     banned: false },
    { icon: '📷', name: 'Cámara',      banned: false },
    { icon: '📚', name: 'Libros',      banned: false },
    { icon: '🎧', name: 'Audífonos',   banned: false },
    { icon: '💻', name: 'Laptop',      banned: false }
  ];
  const banned = [
    { icon: '🔪', name: 'Cuchillo', banned: true },
    { icon: '✂️', name: 'Tijeras',  banned: true },
    { icon: '🔫', name: 'Arma',     banned: true }
  ];

  let items = [];
  let scanning = false;

  const generateBelt = () => {
    items = [];
    const total = 5 + Math.floor(Math.random() * 4);
    const bannedPos = Math.random() < 0.7 ? Math.floor(Math.random() * total) : -1;
    for (let i = 0; i < total; i++) {
      if (i === bannedPos) items.push(banned[Math.floor(Math.random() * banned.length)]);
      else                  items.push(allowed[Math.floor(Math.random() * allowed.length)]);
    }
  };

  const scanner = document.getElementById('scanner');
  const scannerLabel = document.getElementById('scannerLabel');
  const memFlag = document.getElementById('mem-flag');
  const memFlagVal = document.getElementById('mem-flag-val');
  const memScanned = document.getElementById('mem-scanned-val');
  const memMsg = document.getElementById('mem-msg-val');

  const renderBelt = (currentIdx = -1, detectedBanned = -1) => {
    conveyor.innerHTML = items.map((it, i) => {
      let cls = 'scan-item';
      if (i === currentIdx)         cls += ' current';
      else if (i === detectedBanned) cls += ' banned';
      else if (i < currentIdx)       cls += ' scanned';
      return `
        <div class="${cls}">
          <span class="icon">${it.icon}</span>
          <div>
            <div class="name">${it.name}</div>
            <div class="tag">${it.banned ? '⚠ Prohibido' : '✓ Permitido'}</div>
          </div>
        </div>
      `;
    }).join('');
  };

  const resetState = () => {
    scanning = false;
    scanner.classList.remove('alert');
    scannerLabel.textContent = 'Sistema operando normalmente';
    memFlag.className = 'mem-cell bool-false';
    memFlagVal.textContent = 'false';
    memScanned.textContent = '0';
    memMsg.textContent = 'OK ✓';
    memMsg.style.color = 'var(--verde)';
  };

  const startScan = async () => {
    if (scanning) return;
    scanning = true;
    resetState();

    let bannedIdx = -1;
    for (let i = 0; i < items.length; i++) {
      renderBelt(i, bannedIdx);
      memScanned.textContent = (i + 1).toString();
      await new Promise(r => setTimeout(r, 700));

      if (items[i].banned) {
        bannedIdx = i;
        memFlag.className = 'mem-cell bool-true';
        memFlagVal.textContent = 'true';
        memMsg.textContent = '🚨 ALERTA';
        memMsg.style.color = 'var(--rosa)';
        scanner.classList.add('alert');
        scannerLabel.textContent = '¡ALARMA ACTIVADA!';
        renderBelt(-1, bannedIdx);
        addXP(10);
        break;
      }
    }

    if (bannedIdx === -1) {
      memMsg.textContent = '✓ Limpio';
      memMsg.style.color = 'var(--verde)';
      scannerLabel.textContent = 'Escaneo completado — Sin alertas';
      renderBelt(items.length, -1);
      addXP(5);
    }

    scanning = false;
  };

  document.getElementById('scanStart').addEventListener('click', startScan);
  document.getElementById('scanReset').addEventListener('click', () => {
    generateBelt();
    resetState();
    renderBelt();
  });

  generateBelt();
  renderBelt();
}

/* ---------- SIMULADOR 4: CAJERO (Integración) ---------- */
function inicializarSimuladorCajero() {
  const itemsEl = document.getElementById('cashierItems');
  if (!itemsEl) return;

  let items = [];
  const counterVal = document.getElementById('c-counter-val');
  const totalVal = document.getElementById('c-total-val');
  const flagVal = document.getElementById('c-flag-val');
  const flagCell = document.getElementById('c-flag');
  const counterCell = document.getElementById('c-counter');
  const totalCell = document.getElementById('c-total');
  const receiptEl = document.getElementById('receipt');

  const render = () => {
    if (items.length === 0) {
      itemsEl.innerHTML = '<div style="color:var(--texto-suave);padding:.5rem;font-size:.8rem">Sin productos</div>';
    } else {
      itemsEl.innerHTML = items.map((it, i) =>
        `<div style="display:flex;justify-content:space-between;padding:.3rem .4rem;background:var(--tarjeta);border-radius:4px;margin-bottom:.25rem">
          <span style="color:var(--texto-suave)">${i + 1}. ${it.name}</span>
          <span style="color:var(--verde)">$${it.price.toFixed(2)}</span>
        </div>`
      ).join('');
    }
  };

  document.getElementById('addProd').addEventListener('click', () => {
    const name = document.getElementById('prodName').value.trim();
    const price = parseFloat(document.getElementById('prodPrice').value);
    if (!name || isNaN(price) || price <= 0) {
      alert('Ingresa un nombre y precio válido');
      return;
    }
    items.push({ name, price });
    document.getElementById('prodName').value = '';
    render();
    addXP(2);
  });

  document.getElementById('clearCashier').addEventListener('click', () => {
    items = [];
    counterVal.textContent = '0';
    totalVal.textContent = '$0.00';
    flagVal.textContent = 'false';
    flagCell.className = 'mem-cell bool-false';
    receiptEl.innerHTML = '<div style="text-align:center;color:var(--texto-suave);padding:2rem;font-size:.85rem">Añade productos y presiona "Procesar venta"</div>';
    render();
  });

  document.getElementById('processSale').addEventListener('click', () => {
    if (items.length === 0) {
      alert('Añade al menos un producto');
      return;
    }

    const contador = items.length;
    counterVal.textContent = contador;
    counterCell.classList.remove('flash'); void counterCell.offsetWidth; counterCell.classList.add('flash');

    let total = 0;
    items.forEach(it => total += it.price);
    totalVal.textContent = '$' + total.toFixed(2);
    totalCell.classList.remove('flash'); void totalCell.offsetWidth; totalCell.classList.add('flash');

    const LIMITE_VIP = 100;
    const esVIP = total > LIMITE_VIP;
    flagVal.textContent = esVIP ? 'true' : 'false';
    flagCell.className = 'mem-cell ' + (esVIP ? 'bool-true' : 'bool-false');

    const promedio = total / contador;
    let final = total;
    let descuento = 0;
    if (esVIP) {
      descuento = total * 0.10;
      final = total - descuento;
    }

    let html = '';
    items.forEach((it, i) => {
      html += `<div class="receipt-line"><span class="key">${i + 1}. ${it.name}</span><span class="val">$${it.price.toFixed(2)}</span></div>`;
    });
    html += `<div class="receipt-line" style="margin-top:.75rem;border-top:1px solid rgba(251,191,36,.3);padding-top:.75rem"><span class="key">Productos (contador):</span><span class="val">${contador}</span></div>`;
    html += `<div class="receipt-line"><span class="key">Subtotal (acumulador):</span><span class="val">$${total.toFixed(2)}</span></div>`;
    html += `<div class="receipt-line"><span class="key">Promedio:</span><span class="val">$${promedio.toFixed(2)}</span></div>`;

    if (esVIP) {
      html += `<div class="receipt-line vip"><span class="key">⭐ ¡COMPRA VIP! (bandera = true)</span><span class="val">-10%</span></div>`;
      html += `<div class="receipt-line"><span class="key">Descuento:</span><span class="val" style="color:var(--amarillo)">-$${descuento.toFixed(2)}</span></div>`;
      html += `<div class="receipt-line highlight"><span class="key">TOTAL FINAL:</span><span class="val" style="color:var(--amarillo)">$${final.toFixed(2)}</span></div>`;
    } else {
      html += `<div class="receipt-line highlight"><span class="key">TOTAL FINAL:</span><span class="val">$${final.toFixed(2)}</span></div>`;
    }

    receiptEl.innerHTML = html;
    addXP(15);
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
    background: 'linear-gradient(135deg, #fbbf24, #10b981)',
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
