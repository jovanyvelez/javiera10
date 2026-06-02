/* ============================================================
   CLASE 14 — VALIDACIÓN DE DATOS EN ARREGLOS
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
  inicializarRompeArreglo();
  inicializarFrontera();
  inicializarValidador();
  inicializarValidadorUniversal();
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
    localStorage.setItem('curso-validacion-arreglos', JSON.stringify(datos));
  } catch (e) {}
}

function cargarProgreso() {
  try {
    const datos = JSON.parse(localStorage.getItem('curso-validacion-arreglos'));
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
    1: '🚨 Error Hunter',
    2: '🚧 Boundary Guard',
    3: '🔍 Quality Inspector',
    4: '🏰 Fortress Master',
    5: '🛡️ Shield Bearer'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 Maestro de la Validación');
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
          1: '¡Perfecto! Has dominado la validación de índices. La condición <code>i &lt; 0 || i &gt;= arr.Length</code> cubre ambos extremos.',
          2: '¡Excelente! <code>nota &gt;= 0 &amp;&amp; nota &lt;= 100</code> con <code>&amp;&amp;</code> (AND) exige que AMBAS condiciones se cumplan.',
          3: '¡Muy bien! <code>IsNullOrWhiteSpace</code> rechaza null, vacío (<code>""</code>) y solo espacios (<code>"   "</code>). Triple protección.',
          4: '🏆 ¡ESCUDO COMPLETO! Has integrado las 3 capas: validar valor, validar estado del arreglo, y try-catch como red de seguridad.'
        };
        const xpPorReto = { 1: 15, 2: 20, 3: 20, 4: 30 };
        fb.innerHTML = `✅ ${msgs[id]} <strong>+${xpPorReto[id]} XP</strong>`;
        if (!estado.talleres[id]) {
          estado.talleres[id] = true;
          addXP(xpPorReto[id]);
        }
        if (Object.keys(estado.talleres).length === 4) {
          otorgarBadge('🛡️ Taller Completado');
        }
      } else {
        fb.className = 'resultado-ws visible no';
        const hints = {
          1: 'Pista: la condición debe rechazar índices MENORES que 0 Y también índices MAYORES O IGUALES a arr.Length.',
          2: 'Pista: usa <code>&gt;=</code> y <code>&lt;=</code> con <code>&amp;&amp;</code> para incluir los extremos (0 y 100 son válidos).',
          3: 'Pista: la función <code>string.IsNullOrWhiteSpace()</code> devuelve <code>true</code> si el texto es null, vacío o solo espacios. Usa <code>!</code> para invertir el resultado.',
          4: 'Pista: valor <code>&lt; 0</code> rechaza negativos. Estado: <code>count &gt;= arr.Length</code> detecta arreglo lleno. Incremento: <code>count++</code>.'
        };
        fb.innerHTML = `❌ Algunas respuestas son incorrectas. ${hints[id]}`;
      }

      guardarProgreso();
    });
  });
}

/* ---------- SIMULADOR 1: ROMPE-ARREGLOS (M1) ---------- */
function inicializarRompeArreglo() {
  const cont = document.getElementById('rompeArreglo');
  if (!cont) return;

  const notas = [85, 90, 78, 92, 88];
  let escudoActivo = false;

  const render = (highlightIdx = -1, highlightType = '') => {
    cont.innerHTML = '';
    notas.forEach((v, i) => {
      const cell = document.createElement('div');
      cell.className = 'rompe-celda';
      if (highlightIdx === i) cell.classList.add(highlightType);
      cell.innerHTML = `<span class="idx">[${i}]</span><span>${v}</span>`;
      cont.appendChild(cell);
    });
  };

  render();

  const atacar = () => {
    const input = document.getElementById('rompeInput');
    const resultado = document.getElementById('rompeResultado');
    const i = parseInt(input.value, 10);

    if (isNaN(i)) {
      resultado.className = 'rompe-resultado error';
      resultado.innerHTML = '❌ Eso no es un número.';
      render();
      return;
    }

    if (escudoActivo) {
      // Validación previa
      if (i < 0 || i >= notas.length) {
        resultado.className = 'rompe-resultado info';
        resultado.innerHTML = `🛡️ <strong>Escudo activado</strong>: bloqueó el ataque a <code>notas[${i}]</code> porque está fuera del rango válido [0, ${notas.length - 1}]. El programa sigue vivo.`;
        render();
        return;
      } else {
        resultado.className = 'rompe-resultado exito';
        resultado.innerHTML = `✅ <strong>Acceso seguro</strong>: <code>notas[${i}] = ${notas[i]}</code> está dentro del rango.`;
        render(i, 'ataque-bloqueado');
        addXP(2);
        return;
      }
    }

    // Sin escudo
    if (i < 0 || i >= notas.length) {
      resultado.className = 'rompe-resultado error';
      resultado.innerHTML = `💥 <strong>IndexOutOfRangeException</strong>: tu programa explotó al intentar acceder a <code>notas[${i}]</code>. El arreglo solo tiene índices 0 a ${notas.length - 1}. Reinicia el simulador y prueba con el escudo.`;
      render(i, 'ataque-exitoso');
    } else {
      resultado.className = 'rompe-resultado exito';
      resultado.innerHTML = `✅ <strong>Acceso válido</strong>: <code>notas[${i}] = ${notas[i]}</code>. Este índice sí existe.`;
      render(i, 'ataque-bloqueado');
      addXP(2);
    }
  };

  const toggleEscudo = () => {
    escudoActivo = !escudoActivo;
    const btn = document.getElementById('rompeProteger');
    btn.textContent = escudoActivo ? '🛡️ Escudo activo' : '🛡️ Activar Escudo';
    btn.classList.toggle('success', escudoActivo);
    const resultado = document.getElementById('rompeResultado');
    resultado.className = 'rompe-resultado info';
    resultado.innerHTML = escudoActivo
      ? '🛡️ <strong>Escudo ACTIVADO</strong>. Ahora los ataques fuera de rango serán bloqueados. Intenta con un índice inválido.'
      : '⚠️ Escudo DESACTIVADO. Estás en modo vulnerable. Intenta atacar el arreglo.';
    render();
  };

  document.getElementById('rompeAtacar').addEventListener('click', atacar);
  document.getElementById('rompeProteger').addEventListener('click', toggleEscudo);
  document.getElementById('rompeReset').addEventListener('click', () => {
    escudoActivo = false;
    const btn = document.getElementById('rompeProteger');
    btn.textContent = '🛡️ Activar Escudo';
    btn.classList.remove('success');
    document.getElementById('rompeResultado').className = 'rompe-resultado info';
    document.getElementById('rompeResultado').innerHTML = 'Escribe un índice y presiona <strong>Atacar</strong> para ver qué pasa.';
    render();
  });

  // Permitir presionar Enter en el input
  document.getElementById('rompeInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') atacar();
  });
}

/* ---------- SIMULADOR 2: FRONTERA (M2) ---------- */
function inicializarFrontera() {
  const cont = document.getElementById('fronteraArreglo');
  if (!cont) return;

  const notas = [85, 90, 78, 92, 88];
  const LENGTH = notas.length;

  const render = (inspectedIdx) => {
    cont.innerHTML = '';
    for (let i = -3; i <= 8; i++) {
      const cell = document.createElement('div');
      cell.className = 'rompe-celda';
      if (i < 0 || i >= LENGTH) {
        cell.classList.add('intocable');
        cell.innerHTML = `<span class="idx">[${i}]</span><span>—</span>`;
      } else {
        if (i === inspectedIdx) cell.classList.add('ataque-bloqueado');
        cell.innerHTML = `<span class="idx">[${i}]</span><span>${notas[i]}</span>`;
      }
      cont.appendChild(cell);
    }
  };

  const actualizar = (idx) => {
    const valorEl = document.getElementById('fronteraValor');
    const resultado = document.getElementById('fronteraResultado');

    valorEl.textContent = idx;
    render(idx);

    if (idx >= 0 && idx < LENGTH) {
      resultado.className = 'rompe-resultado exito';
      resultado.innerHTML = `✅ <strong>Seguro</strong>: <code>arr[${idx}] = ${notas[idx]}</code>. El índice ${idx} está entre 0 y ${LENGTH - 1}.`;
    } else {
      resultado.className = 'rompe-resultado error';
      if (idx < 0) {
        resultado.innerHTML = `❌ <strong>Peligro</strong>: el índice ${idx} es <strong>negativo</strong>. No existe la posición "menos uno" en un arreglo.`;
      } else {
        resultado.innerHTML = `❌ <strong>Peligro</strong>: el índice ${idx} es <strong>mayor o igual a ${LENGTH}</strong> (el tamaño del arreglo). El último índice válido es ${LENGTH - 1}.`;
      }
    }
  };

  document.getElementById('fronteraSlider').addEventListener('input', (e) => {
    actualizar(parseInt(e.target.value, 10));
  });

  actualizar(3);
}

/* ---------- SIMULADOR 3: VALIDADOR DE VALORES (M3) ---------- */
function inicializarValidador() {
  const nombreInput = document.getElementById('val-nombre');
  if (!nombreInput) return;

  const estudiantes = [];

  const validar = () => {
    const nombre = document.getElementById('val-nombre').value.trim();
    const edadStr = document.getElementById('val-edad').value;
    const notaStr = document.getElementById('val-nota').value;
    const email = document.getElementById('val-email').value.trim();

    // Validar nombre
    const fbNombre = document.getElementById('val-nombre-fb');
    const inNombre = document.getElementById('val-nombre');
    let nombreOk = false;
    if (nombre.length === 0) {
      fbNombre.textContent = '⚠️ El nombre no puede estar vacío';
      fbNombre.className = 'form-feedback error';
      inNombre.classList.remove('ok'); inNombre.classList.add('error');
    } else if (nombre.length < 3) {
      fbNombre.textContent = '⚠️ Muy corto (mínimo 3 caracteres)';
      fbNombre.className = 'form-feedback error';
      inNombre.classList.remove('ok'); inNombre.classList.add('error');
    } else if (nombre.length > 50) {
      fbNombre.textContent = '⚠️ Muy largo (máximo 50)';
      fbNombre.className = 'form-feedback error';
      inNombre.classList.remove('ok'); inNombre.classList.add('error');
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
      fbNombre.textContent = '⚠️ Solo letras y espacios';
      fbNombre.className = 'form-feedback error';
      inNombre.classList.remove('ok'); inNombre.classList.add('error');
    } else {
      fbNombre.textContent = '✓ Nombre válido';
      fbNombre.className = 'form-feedback ok';
      inNombre.classList.remove('error'); inNombre.classList.add('ok');
      nombreOk = true;
    }

    // Validar edad
    const fbEdad = document.getElementById('val-edad-fb');
    const inEdad = document.getElementById('val-edad');
    let edadOk = false;
    const edad = parseInt(edadStr, 10);
    if (edadStr === '' || isNaN(edad)) {
      fbEdad.textContent = '⚠️ Ingresa un número';
      fbEdad.className = 'form-feedback error';
      inEdad.classList.remove('ok'); inEdad.classList.add('error');
    } else if (edad < 0 || edad > 120) {
      fbEdad.textContent = `⚠️ Edad ${edad} fuera de rango (0-120)`;
      fbEdad.className = 'form-feedback error';
      inEdad.classList.remove('ok'); inEdad.classList.add('error');
    } else {
      fbEdad.textContent = '✓ Edad válida';
      fbEdad.className = 'form-feedback ok';
      inEdad.classList.remove('error'); inEdad.classList.add('ok');
      edadOk = true;
    }

    // Validar nota
    const fbNota = document.getElementById('val-nota-fb');
    const inNota = document.getElementById('val-nota');
    let notaOk = false;
    const nota = parseFloat(notaStr);
    if (notaStr === '' || isNaN(nota)) {
      fbNota.textContent = '⚠️ Ingresa un número';
      fbNota.className = 'form-feedback error';
      inNota.classList.remove('ok'); inNota.classList.add('error');
    } else if (nota < 0 || nota > 100) {
      fbNota.textContent = `⚠️ Nota ${nota} fuera de rango (0-100)`;
      fbNota.className = 'form-feedback error';
      inNota.classList.remove('ok'); inNota.classList.add('error');
    } else {
      fbNota.textContent = '✓ Nota válida';
      fbNota.className = 'form-feedback ok';
      inNota.classList.remove('error'); inNota.classList.add('ok');
      notaOk = true;
    }

    // Validar email
    const fbEmail = document.getElementById('val-email-fb');
    const inEmail = document.getElementById('val-email');
    let emailOk = false;
    if (email.length === 0) {
      fbEmail.textContent = '⚠️ El email no puede estar vacío';
      fbEmail.className = 'form-feedback error';
      inEmail.classList.remove('ok'); inEmail.classList.add('error');
    } else if (!email.includes('@') || !email.includes('.')) {
      fbEmail.textContent = '⚠️ Email inválido (debe tener @ y .)';
      fbEmail.className = 'form-feedback error';
      inEmail.classList.remove('ok'); inEmail.classList.add('error');
    } else if (email.length > 100) {
      fbEmail.textContent = '⚠️ Email demasiado largo';
      fbEmail.className = 'form-feedback error';
      inEmail.classList.remove('ok'); inEmail.classList.add('error');
    } else {
      fbEmail.textContent = '✓ Email válido';
      fbEmail.className = 'form-feedback ok';
      inEmail.classList.remove('error'); inEmail.classList.add('ok');
      emailOk = true;
    }

    // Habilitar/deshabilitar botón
    const btn = document.getElementById('val-guardar');
    btn.disabled = !(nombreOk && edadOk && notaOk && emailOk);

    return nombreOk && edadOk && notaOk && emailOk;
  };

  ['val-nombre', 'val-edad', 'val-nota', 'val-email'].forEach(id => {
    document.getElementById(id).addEventListener('input', validar);
  });

  document.getElementById('val-guardar').addEventListener('click', () => {
    if (!validar()) return;

    const nombre = document.getElementById('val-nombre').value.trim();
    const edad = parseInt(document.getElementById('val-edad').value, 10);
    const nota = parseFloat(document.getElementById('val-nota').value);
    const email = document.getElementById('val-email').value.trim();

    estudiantes.push({ nombre, edad, nota, email });

    // Render list
    const lista = document.getElementById('val-lista');
    lista.innerHTML = estudiantes.map((e, i) =>
      `<div style="padding:.4rem .6rem;background:var(--fondo-claro);border-radius:5px;margin-bottom:.3rem;border-left:3px solid var(--verde)">
        <strong style="color:var(--verde)">${i + 1}.</strong> ${e.nombre} · ${e.edad} años · Nota: ${e.nota} · ${e.email}
      </div>`
    ).join('');

    const msg = document.getElementById('val-mensaje');
    msg.style.display = 'block';
    msg.className = 'form-mensaje ok';
    msg.innerHTML = `✅ ${nombre} guardado correctamente (Total: ${estudiantes.length})`;

    addXP(5);
  });

  validar();
}

/* ---------- SIMULADOR 4: VALIDADOR UNIVERSAL (M4) ---------- */
function inicializarValidadorUniversal() {
  const nombreInput = document.getElementById('univ-nombre');
  if (!nombreInput) return;

  const inventario = [];
  const logEl = document.getElementById('univ-log');

  const addLog = (msg, tipo = 'info') => {
    const colores = { ok: 'var(--verde)', error: 'var(--rosa)', info: 'var(--azul-claro)' };
    logEl.innerHTML = `<div style="color:${colores[tipo]}; margin-bottom: 0.3rem;">${msg}</div>` + logEl.innerHTML;
  };

  const validarEntrada = () => {
    const nombre = document.getElementById('univ-nombre').value.trim();
    const cantidad = parseInt(document.getElementById('univ-cantidad').value, 10);
    const precio = parseFloat(document.getElementById('univ-precio').value);
    const categoria = document.getElementById('univ-categoria').value.trim();

    const errores = [];

    // Capa 1: validar entrada
    if (nombre.length < 3 || nombre.length > 50) {
      errores.push(`Nombre "${nombre}" debe tener entre 3 y 50 caracteres`);
    }
    if (isNaN(cantidad) || cantidad < 0 || cantidad > 9999) {
      errores.push(`Cantidad ${cantidad} fuera de rango (0-9999)`);
    }
    if (isNaN(precio) || precio < 0 || precio > 99999) {
      errores.push(`Precio ${precio} fuera de rango (0-99999)`);
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(categoria) || categoria.length < 3 || categoria.length > 20) {
      errores.push(`Categoría "${categoria}" inválida (3-20 letras)`);
    }

    return { ok: errores.length === 0, errores, nombre, cantidad, precio, categoria };
  };

  document.getElementById('univ-guardar').addEventListener('click', () => {
    const v = validarEntrada();

    if (!v.ok) {
      addLog(`❌ RECHAZADO: ${v.errores.join(' | ')}`, 'error');
      return;
    }

    // Capa 2: validar estado (inventario lleno)
    if (inventario.length >= 100) {
      addLog('❌ Inventario lleno (máximo 100 productos)', 'error');
      return;
    }

    // Capa 3: try-catch
    try {
      inventario.push({ nombre: v.nombre, cantidad: v.cantidad, precio: v.precio, categoria: v.categoria });
      addLog(`✅ CAPA 1: datos válidos (rangos OK)`, 'ok');
      addLog(`✅ CAPA 2: estado del inventario OK (${inventario.length}/100)`, 'ok');
      addLog(`✅ CAPA 3: try-catch sin excepciones`, 'ok');
      addLog(`🎉 Registrado: ${v.nombre} · ${v.cantidad} unidades · $${v.precio} · ${v.categoria}`, 'ok');

      const lista = document.getElementById('univ-lista');
      lista.innerHTML = inventario.map((p, i) =>
        `<div style="padding:.4rem .6rem;background:var(--fondo-claro);border-radius:5px;margin-bottom:.3rem;border-left:3px solid var(--violeta)">
          <strong style="color:var(--violeta-claro)">${i + 1}.</strong> ${p.nombre} · ${p.cantidad} × $${p.precio} · <em style="color:var(--texto-suave)">${p.categoria}</em>
        </div>`
      ).join('');

      addXP(8);
    } catch (e) {
      addLog(`❌ Error inesperado en CAPA 3: ${e.message}`, 'error');
    }
  });

  document.getElementById('univ-limpiar').addEventListener('click', () => {
    document.getElementById('univ-nombre').value = '';
    document.getElementById('univ-cantidad').value = '';
    document.getElementById('univ-precio').value = '';
    document.getElementById('univ-categoria').value = '';
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
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
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
