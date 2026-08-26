/* ============================================================
   PÁGINA PRINCIPAL — GRADO DÉCIMO
   Lee progreso de cada clase desde localStorage y lo muestra
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  mostrarFecha();
  cargarProgresoPorClase();
  animarStats();
  configurarAcordeon();
});

/* ---------- FECHA EN HEADER ---------- */
function mostrarFecha() {
  const el = document.getElementById('fecha-hub');
  if (!el) return;

  const hoy = new Date();
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  const d = dias[hoy.getDay()];
  const dia = hoy.getDate();
  const m = meses[hoy.getMonth()];
  const a = hoy.getFullYear();

  el.textContent = `${d}, ${dia} de ${m} de ${a}`;
}

/* ---------- LEER PROGRESO DE CADA CLASE ---------- */
function cargarProgresoPorClase() {
  // Total de módulos por clase (lo que se puede marcar como completado)
  // Para cada clase: 6 módulos totales (0..5), pero el módulo 5 (taller) no se marca
  // automáticamente, así que se cuentan los 5 primeros
  const TOTALES_MODULOS = {
    'curso-contadores-acum-banderas': 5,
    'curso-ordenacion-sortlab': 5,
    'curso-validacion-arreglos': 5,
    'curso-integracion-estructuras': 5,
    'curso-maraton-algoritmos': 5,
    'curso-so-que-es-sistema-operativo': 6,
    'curso-so-funciones-componentes': 7,
    'curso-so-tipos-sistemas-operativos': 7,
    'curso-so-planeacion-instalacion': 6,
    'curso-so-gestion-procesos': 5,
    'curso-so-gestion-memoria': 5,
    'curso-so-gestion-almacenamiento': 5,
    'curso-so-interfaz-linea-comandos-cli': 5,
    'curso-introduccion-programacion-web': 6,
    'curso-introduccion-web-html': 6,
    'curso-html-semantico': 6,
    'curso-imagenes-tablas': 6,
    'curso-formularios-html': 6,
    'curso-introduccion-css': 6,
    'curso-box-model': 6,
    'curso-flexbox': 6,
    'curso-css-grid': 6,
    'curso-responsive-design': 6,
    'curso-taller-responsive-design': 5,
    'curso-componentes-animaciones': 6,
    'curso-introduccion-javascript': 6,
    'curso-condicionales-bucles': 6,
    'curso-funciones-arrays': 6,
    'curso-objetos-metodos-array': 6,
    'curso-dom-seleccion': 6,
    'curso-eventos': 6,
    'curso-formularios-js': 6,
    'curso-localstorage-json': 6,
    'curso-crud-crear-leer': 6,
    'curso-crud-actualizar-eliminar': 6,
    'curso-proyecto-final': 6,
    'curso-presentacion-evaluacion': 6
  };

  let totalGlobal = 0;
  let completosGlobal = 0;

  document.querySelectorAll('.clase-card[data-storage]').forEach(card => {
    const key = card.dataset.storage;
    const totalMods = TOTALES_MODULOS[key] || parseInt(card.dataset.total, 10) || 5;
    const pct = calcularProgresoCurso(key, totalMods);

    actualizarBarraClase(card, pct);

    totalGlobal += totalMods;
    completosGlobal += Math.round((pct / 100) * totalMods);
  });

  // Actualizar el progreso global del dashboard
  const pctGlobal = totalGlobal > 0 ? Math.round((completosGlobal / totalGlobal) * 100) : 0;
  const elProg = document.getElementById('stat-progreso');
  if (elProg) {
    animarNumero(elProg, 0, pctGlobal, 1000, valor => valor + '%');
  }
}

function calcularProgresoCurso(key, totalMods) {
  try {
    const datos = JSON.parse(localStorage.getItem(key));
    if (!datos || !datos.completados) return 0;

    // Filtramos los completados que están dentro del rango "completable" (0..totalMods-1)
    const completados = (datos.completados || []).filter(m => m <= totalMods - 1).length;
    return Math.round((completados / totalMods) * 100);
  } catch (e) {
    return 0;
  }
}

function actualizarBarraClase(card, pct) {
  const barra = card.querySelector('.progreso-mini-rellenar');
  const texto = card.querySelector('.progreso-texto strong');

  if (barra) {
    setTimeout(() => { barra.style.width = pct + '%'; }, 200);
  }
  if (texto) {
    texto.textContent = pct + '%';
  }

  // Si está al 100%, agregar estrella
  if (pct === 100) {
    const badge = card.querySelector('.clase-badge');
    if (badge && !badge.textContent.includes('★')) {
      badge.innerHTML += ' ★';
    }
  }
}

/* ---------- ANIMACIÓN DE NÚMEROS EN STATS ---------- */
function animarStats() {
  // Los 3 primeros son fijos
  animarNumero(document.getElementById('stat-cursos'),  0, 4,   800);
  animarNumero(document.getElementById('stat-clases'), 0, 37,  900);
  // El cuarto (horas) tiene "+" al final
  const elHoras = document.getElementById('stat-horas');
  if (elHoras) {
    animarNumero(elHoras, 0, 130, 1000, valor => valor + '+');
  }
}

function animarNumero(el, desde, hasta, duracion, formato) {
  if (!el) return;
  const inicio = performance.now();
  formato = formato || (v => v.toString());

  function paso(t) {
    const prog = Math.min((t - inicio) / duracion, 1);
    const eased = 1 - Math.pow(1 - prog, 3);
    const valor = Math.round(desde + (hasta - desde) * eased);
    el.textContent = formato(valor);
    if (prog < 1) {
      requestAnimationFrame(paso);
    }
  }

  requestAnimationFrame(paso);
}

/* ---------- INTERSECCIÓN: ANIMA CUANDO ENTRAN EN PANTALLA ---------- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'aparece 0.6s ease both';
    }
  });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.curso-bloque, .proximamente, .info-extra').forEach(el => {
    observer.observe(el);
  });
});

/* ---------- ATAJOS DE TECLADO: SALTAR A CLASE ---------- */
document.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

  // Tecla 1 → Clase 12
  if (e.key === '1') {
    const card = document.querySelector('.clase-card.ha-12');
    if (card) card.click();
  }
  // Tecla 2 → Clase 13
  if (e.key === '2') {
    const card = document.querySelector('.clase-card.ha');
    if (card) card.click();
  }
  // Tecla 3 → Clase 14
  if (e.key === '3') {
    const card = document.querySelector('.clase-card.ha-14');
    if (card) card.click();
  }
  // Tecla 4 → Clase 15
  if (e.key === '4') {
    const card = document.querySelector('.clase-card.ha-15');
    if (card) card.click();
  }
  // Tecla 5 → Clase 16
  if (e.key === '5') {
    const card = document.querySelector('.clase-card.ha-16');
    if (card) card.click();
  }
  // Tecla 6 → Clase 1 SO
  if (e.key === '6') {
    const card = document.querySelector('.clase-card.so-1');
    if (card) card.click();
  }
  // Tecla 7 → Clase 2 SO
  if (e.key === '7') {
    const card = document.querySelector('.clase-card.so-2');
    if (card) card.click();
  }
  // Tecla 8 → Clase 5 SO
  if (e.key === '8') {
    const card = document.querySelector('.clase-card.so-5');
    if (card) card.click();
  }
  // Tecla 9 → Clase 6 SO
  if (e.key === '9') {
    const card = document.querySelector('.clase-card.so-6');
    if (card) card.click();
  }
  // Tecla 0 → Clase 7 SO
  if (e.key === '0') {
    const card = document.querySelector('.clase-card.so-7');
    if (card) card.click();
  }
});

/* ---------- TOAST DE BIENVENIDA SI HAY PROGRESO ---------- */
window.addEventListener('load', () => {
  const keys = ['curso-contadores-acum-banderas', 'curso-ordenacion-sortlab', 'curso-validacion-arreglos', 'curso-integracion-estructuras', 'curso-maraton-algoritmos', 'curso-so-que-es-sistema-operativo', 'curso-so-funciones-componentes', 'curso-so-tipos-sistemas-operativos', 'curso-so-planeacion-instalacion', 'curso-so-gestion-procesos', 'curso-so-gestion-memoria', 'curso-so-gestion-almacenamiento', 'curso-so-interfaz-linea-comandos-cli', 'curso-introduccion-programacion-web', 'curso-introduccion-web-html', 'curso-html-semantico', 'curso-imagenes-tablas', 'curso-formularios-html', 'curso-introduccion-css', 'curso-box-model', 'curso-flexbox', 'curso-css-grid', 'curso-responsive-design', 'curso-taller-responsive-design', 'curso-componentes-animaciones', 'curso-introduccion-javascript', 'curso-condicionales-bucles', 'curso-funciones-arrays', 'curso-objetos-metodos-array', 'curso-dom-seleccion', 'curso-eventos', 'curso-formularios-js', 'curso-localstorage-json', 'curso-crud-crear-leer', 'curso-crud-actualizar-eliminar', 'curso-proyecto-final', 'curso-presentacion-evaluacion'];

  let tienePrograma = false;

  keys.forEach(k => {
    try {
      const d = JSON.parse(localStorage.getItem(k));
      if (d && d.completados && d.completados.length > 0) {
        tienePrograma = true;
      }
    } catch (e) {}
  });

  if (tienePrograma) {
    setTimeout(() => {
      mostrarToast('👋 ¡Bienvenid@ de vuelta! Tu progreso está guardado.');
    }, 600);
  } else {
    setTimeout(() => {
      mostrarToast('💡 Tip: usa las teclas 1-9 para saltar a una clase disponible.');
    }, 1200);
  }
});

/* ---------- TOAST GENÉRICO ---------- */
function mostrarToast(mensaje) {
  const toast = document.createElement('div');
  toast.textContent = mensaje;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    background: 'linear-gradient(135deg, #00f0ff, #ff2bd6)',
    color: '#000',
    padding: '0.9rem 1.4rem',
    borderRadius: '30px',
    fontWeight: '700',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
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
  }, 4000);
}

/* ---------- ACORDEÓN DE CURSOS ---------- */
function configurarAcordeon() {
  const CLAVE_ABIERTOS = 'hub-cursos-abiertos';
  let abiertos;
  try { abiertos = JSON.parse(localStorage.getItem(CLAVE_ABIERTOS)) || []; }
  catch (e) { abiertos = []; }

  document.querySelectorAll('.curso-bloque').forEach(bloque => {
    const id = bloque.dataset.curso;
    const encabezado = bloque.querySelector('.curso-encabezado');

    // Restaurar estado guardado (por defecto, colapsado)
    if (abiertos.includes(id)) bloque.classList.add('expandido');

    encabezado.addEventListener('click', (e) => {
      // No colapsar si el clic fue en un enlace dentro del encabezado
      if (e.target.closest('a')) return;
      const estaba = bloque.classList.toggle('expandido');
      guardarCursosAbiertos();
      if (estaba) {
        // Scroll suave para que el encabezado quede visible al expandir
        setTimeout(() => {
          encabezado.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    });
  });

  function guardarCursosAbiertos() {
    const abiertosAhora = Array.from(document.querySelectorAll('.curso-bloque.expandido'))
      .map(b => b.dataset.curso);
    try { localStorage.setItem(CLAVE_ABIERTOS, JSON.stringify(abiertosAhora)); }
    catch (e) {}
  }
}
