# AGENTS.md — Grado Décimo (Currículo 2026)

Static, no-build educational hub. Spanish UI ("Tecnología e Informática · Grado 10°"). No package manager, no test runner, no linter, no CI, no `.gitignore`.

## Layout

```
decimo/
├── index.html          # Hub: lista de minicursos + dashboard de progreso
├── app.js              # Lógica del hub (fecha, progreso global, animaciones)
├── estilos.css         # Estilos del hub
└── <Curso>/<nn-slug>/
    ├── index.html      # Página de la clase (autocontenida)
    ├── estilos.css     # Estilos de la clase
    └── app.js          # Lógica de la clase
```

- Cada clase es **autocontenida** (su propio HTML/CSS/JS). NO se comparten assets entre carpetas; para "duplicar" una clase se copia la carpeta entera.
- Carpetas de cursos existentes: `HerramientasAlgoritmicasI/`, `HerramientasProgramacionI/`, `SistemasOperativos/`.
- Nombres de carpetas: `<número-ordinal>-<slug>` (ej. `doce-contadoresAcumBanderas`, `quince-integracion-estructuras`, `uno-introduccion-programacion-web`). Slugs pueden mezclar kebab-case y CamelCase — respetar el slug existente.
- Tarjetas placeholder: en el `<section class="curso-bloque">` cada curso lleva además un `<div class="clase-card placeholder">` ("Próximamente") para llenar visualmente la rejilla cuando aún no están todas las clases. No es `<a>`, no lleva `data-storage`, y se ignora sola al leer progreso (el hub filtra por `[data-storage]`).

## Estado entre clases: localStorage

El progreso de cada clase se guarda en `localStorage` bajo una clave por curso (ej. `curso-contadores-acum-banderas`, `curso-so-que-es-sistema-operativo`). El hub lee esas claves para pintar las barras y el porcentaje global.

Cada `app.js` de clase persiste un objeto JSON; el hub solo lee el campo `completados` (array de índices de módulos), pero las clases además guardan `moduloActual`, `quizzes`, `talleres`, `badges`, `xp`. Las HA escriben la clave en línea dentro de `guardarProgreso()`; las SO y HP la extraen a `const STORAGE_KEY = 'curso-...'` arriba del archivo.

## Cómo añadir una clase nueva (no obviable desde los filenames)

Hay tres ediciones obligatorias, no una sola:

1. Crear la carpeta `<Curso>/<nn-slug>/` (`HerramientasAlgoritmicasI/`, `HerramientasProgramacionI/` o `SistemasOperativos/`) con su triplete `index.html` + `estilos.css` + `app.js`.
2. En el `index.html` raíz, agregar una `.clase-card` dentro del `<section class="curso-bloque">` correspondiente con:
   - `href="<ruta-relativa>/index.html"`
   - `data-storage="curso-<slug>"`  ← **debe coincidir con la clave que escribe la clase** (en SO se antepone `curso-so-`; en HA y HP se usa `curso-<slug>` directamente — respeta el patrón de cada curso mirando una clase existente)
   - `data-total="<N-módulos-completables>"` — cuenta solo los módulos que el estudiante marca como hechos; el módulo "taller" final no entra en el conteo (ver comentario en `app.js` raíz, función `cargarProgresoPorClase`).
3. En el `app.js` raíz, registrar esa misma clave en el objeto `TOTALES_MODULOS` (el hub hace fallback a `card.dataset.total`, pero las claves explícitas mandan — mejor tener ambas).

Si omites el paso 2 o 3, el dashboard global no reflejará el progreso aunque la clase funcione sola.

## Cómo verificar cambios

No hay tests. Verificación manual:

- Abrir `index.html` directo en el navegador funciona (`file://`). Para evitar rareces de CORS con fetch/`localStorage` entre páginas, sirve con `python3 -m http.server` desde la raíz si hace falta.
- Tras navegar a una clase y marcar módulos, recargar el hub y comprobar que la barra de esa tarjeta y el `stat-progreso` global suben.
- Cambios de UI: revisar la tarjeta del hub Y la página interna (estilos no se comparten).

## Convenciones del sitio

- Toda la UI está en español; mantener tono y emojis decorativos en títulos (`🎮`, `🖥️`, `🚀`, etc. son parte del estilo).
- Comentarios en `app.js` del hub están en español.
- Slugs y nombres lógicos van en camelCase/kebab-case mezclado, no introducir guiones distintos.

## Git

- Rama: `main` (única).
- Remoto: `git@github.com:jovanyvelez/javiera10.git` (ojo: el repo en GitHub se llama `javiera10`, el directorio local es `decimo`).
- No commit automático. Commits van en español descriptivos (ver `git log --oneline`: "SO clase2: ...", "clase16 correccion", etc.).
- No hay `.gitignore`. Material suelto (PDFs curriculares, `Clases.txt`, etc.) ha aparecido sin commitear en `SistemasOperativos/`; no agregarlo al sitio a menos que se pida.

## Lo que NO hacer

- No introducir `package.json`, bundlers, frameworks, linters, formateadores ni CI: es sitio estático a propósito.
- No crear archivos compartidos en una carpeta `assets/` o `js/` comunes — la arquitectura es deliberadamente copia-pega por clase.
- No borrar ni renombrar claves de `localStorage` sin migrar el progreso de estudiantes.
