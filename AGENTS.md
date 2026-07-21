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
- Carpetas de cursos existentes: `HerramientasAlgoritmicasI/`, `SistemasOperativos/`.
- Nombres de carpetas: `<número-ordinal>-<slug>` (ej. `doce-contadoresAcumBanderas`, `quince-integracion-estructuras`). Slugs pueden mezclar kebab-case y CamelCase — respetar el slug existente.

## Estado entre clases: localStorage

El progreso de cada clase se guarda en `localStorage` con una clave por curso (ej. `curso-contadores-acum-banderas`). El hub lee esas claves para pintar las barras y el porcentaje global.

**Cada `app.js` de clase** suele contener una línea del estilo:
```js
localStorage.setItem('curso-<slug>', JSON.stringify({ completados: [...] }));
```

## Cómo añadir una clase nueva (no obviable desde los filenames)

Hay tres ediciones obligatorias, no una sola:

1. Crear la carpeta `HerramientasAlgoritmicasI/<nn-slug>/` (o `SistemasOperativos/<nn-slug>/`) con su triplete `index.html` + `estilos.css` + `app.js`.
2. En el `index.html` raíz, agregar una `.clase-card` dentro del `<section class="curso-bloque">` correspondiente con:
   - `href="<ruta-relativa>/index.html"`
   - `data-storage="curso-<slug>"`  ← **debe coincidir con la clave que escribe la clase**
   - `data-total="<N-módulos-completables>"`
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
- Working tree limpio al estado actual; no hay `.gitignore`.

## Lo que NO hacer

- No introducir `package.json`, bundlers, frameworks, linters, formateadores ni CI: es sitio estático a propósito.
- No crear archivos compartidos en una carpeta `assets/` o `js/` comunes — la arquitectura es deliberadamente copia-pega por clase.
- No borrar ni renombrar claves de `localStorage` sin migrar el progreso de estudiantes.
