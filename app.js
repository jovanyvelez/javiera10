/* ============================================================
   PÁGINA PRINCIPAL — GRADO DÉCIMO
   Lee progreso de cada clase desde localStorage y lo muestra
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  mostrarFecha();
  cargarProgresoPorClase();
  animarStats();
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
    'curso-validacion-arreglos': 5
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
  animarNumero(document.getElementById('stat-cursos'),  0, 3,   800);
  animarNumero(document.getElementById('stat-clases'),  0, 3,   900);
  // El cuarto (horas) tiene "+" al final
  const elHoras = document.getElementById('stat-horas');
  if (elHoras) {
    animarNumero(elHoras, 0, 60, 1000, valor => valor + '+');
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
});

/* ---------- TOAST DE BIENVENIDA SI HAY PROGRESO ---------- */
window.addEventListener('load', () => {
  const keys = ['curso-contadores-acum-banderas', 'curso-ordenacion-sortlab', 'curso-validacion-arreglos'];

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
      mostrarToast('💡 Tip: usa las teclas 1-3 para saltar a una clase disponible.');
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
