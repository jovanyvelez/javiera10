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

## HP I: entrega en el repositorio del estudiante (módulo 7 de cada clase)

Desde 2026 el curso `HerramientasProgramacionI/` no se queda en simuladores: cada estudiante publica su trabajo en **su propio** repositorio de GitHub. Esto se monta en la clase 1 y se continúa en todas las siguientes.

- **Repositorio del estudiante:** `herramientas-programacion`, público (GitHub Pages gratuito solo publica repos públicos), editado en **GitHub Codespaces** y servido por **GitHub Pages** en `https://<usuario>.github.io/herramientas-programacion/`.
- **Dos cosas viven dentro** (modelo híbrido, decidido con el profesor):
  - `claseNN/index.html` — el ejercicio suelto de cada clase; queda como registro y no se modifica después.
  - `proyecto/` — **la aplicación** (un gestor de tareas) que nace en la clase 2 y crece hasta la 21, según el arco de `HerramientasProgramacionI/PLAN_MODULO.md`.
- **Clase 1** (`uno-introduccion-web-html/`): el módulo 7 completo ES el proceso guiado (8 pasos: cuenta, repo, Codespace, `clase01/`, portada, commit/push, activar Pages, verificar).
- **Clases 2+**: el módulo 7 conserva sus 4 retos interactivos como repaso y **debajo** lleva el bloque `<!-- ══════════ ENTREGA EN TU REPOSITORIO ══════════ -->` con 5 pasos (reabrir Codespace, crear `claseNN/`, avanzar `proyecto/`, actualizar portada, commit + verificar).

### Replicar el bloque de entrega en una clase nueva de HP I

Referencia ya probada: `dos-html-semantico/` (clase 2). Son tres ediciones:

1. `index.html`: insertar el bloque de entrega **antes de** `<div class="cierre">` del módulo 7, después del último reto.
2. `app.js`: copiar el bloque `ENTREGA EN EL REPOSITORIO (módulo 7)` (funciones `configurarEntregaRepo`, `restaurarEntregaRepo`, `alternarPaso`, `pintarPaso`, `actualizarProgresoPasos`, `limpiarUsuario`, `generarEnlaces`, `verificarPublicacion`), añadir `pasos`/`autoeval`/`usuarioGithub`/`publicado` a `estado` **y** a `guardarProgreso()`/`cargarProgreso()`, llamar `configurarEntregaRepo()` tras `configurarTaller()`, y ajustar `const CARPETA_CLASE`.
3. `estilos.css`: anexar `HerramientasProgramacionI/.plantilla_entrega.css` (plantilla de origen, **no** la carga ninguna página: se copia y pega, no se enlaza, así que la arquitectura autocontenida se mantiene).

**Trampa de los dos temas CSS (rompe los colores en silencio):** HP I tiene **dos paletas distintas** y las clases NO comparten variables:

| | Clases 0 y 1 ("arcade neón") | Clases 2 a 22 ("azul") |
|---|---|---|
| panel/tarjeta | `--panel` | `--tarjeta` |
| fondo hundido | `--negro-2` | `--azul-profundo` |
| borde | `--borde` | `--tarjeta-borde` |
| acento 2 | `--magenta` | `--morado` |
| cian claro | `--cian-2` | `--cian-claro` |
| amarillo | `--amarillo` | `--ambar` |
| glow | `--glow-c` / `--glow-g` | `--sombra-glow-c` / `--sombra-glow-g` |
| tipografías | `--fuente-display` / `--fuente-mono` | no existen: usar los stacks literales (`'Segoe UI', system-ui, …` y `'JetBrains Mono', 'Cascadia Code', 'Consolas', monospace`) |

`.plantilla_entrega.css` ya está escrita con los tokens del **tema azul** (clases 2-22). Si copias CSS desde la clase 1, remapea. Una variable inexistente no da error: el navegador la descarta y deja el fondo transparente y el borde en `currentColor`, así que **una auditoría que solo mida tamaños no lo detecta** — hay que comprobar `getComputedStyle(...).backgroundColor` y que no sea `rgba(0, 0, 0, 0)`.

**Trampa obligatoria:** al guardar los pasos como claves `paso-N` dentro de `estado.talleres`, la condición de insignia de los retos deja de funcionar. Hay que cambiar
`Object.keys(estado.talleres).length === Object.keys(TALLER_MSGS).length` por
`Object.keys(TALLER_MSGS).every(k => estado.talleres[k])`.

No cambies `STORAGE_KEY`, ni el número de módulos, ni el `data-total` del hub: el bloque de entrega vive dentro del módulo taller, que no cuenta como módulo completable.

## Cómo verificar cambios

No hay tests. Verificación manual:

- Abrir `index.html` directo en el navegador funciona (`file://`). Para evitar rareces de CORS con fetch/`localStorage` entre páginas, sirve con `python3 -m http.server` desde la raíz si hace falta.
- Tras navegar a una clase y marcar módulos, recargar el hub y comprobar que la barra de esa tarjeta y el `stat-progreso` global suben.
- Cambios de UI: revisar la tarjeta del hub Y la página interna (estilos no se comparten).

### Verificación automatizable (sin instalar nada)

Hay `node` y `google-chrome-stable` en la máquina; sirven para comprobar una clase sin tocar el navegador a mano:

- `node --check <clase>/app.js` detecta errores de sintaxis.
- Cruzar los `getElementById('...')` del `app.js` contra los `id="..."` del `index.html` caza referencias muertas.
- Prueba funcional: `python3 -m http.server PUERTO` en la carpeta de la clase, una copia temporal del `index.html` con un `<script>` inyectado que simule clics y escriba el resultado en un `<div id="TEST-OUT">`, y
  `google-chrome-stable --headless=new --disable-gpu --no-sandbox --disable-crash-reporter --user-data-dir=/tmp/perfil --virtual-time-budget=9000 --dump-dom URL`.
  Chrome **exige** `--user-data-dir` en este equipo (si no, falla con "Failed to create headless user data directory container").
- Ojo al medir estilos en headless: **las transiciones CSS quedan congeladas** en tiempo virtual, así que `getComputedStyle` devuelve el color inicial. Valida clases CSS y textos, no colores animados (o fuerza `el.getAnimations().forEach(a => a.finish())`).
- `/tmp` **no persiste entre llamadas** de shell distintas: si necesitas un archivo intermedio, escríbelo dentro del workspace y bórralo al final.

## Convenciones del sitio

- Toda la UI está en español; mantener tono y emojis decorativos en títulos (`🎮`, `🖥️`, `🚀`, etc. son parte del estilo).
- Comentarios en `app.js` del hub están en español.
- Slugs y nombres lógicos van en camelCase/kebab-case mezclado, no introducir guiones distintos.

## Git

- Rama: `main` (única).
- Remoto: `git@github.com:jovanyvelez/javiera10.git` (ojo: el repo en GitHub se llama `javiera10`, el directorio local es `decimo`).
- No commit automático. Commits van en español descriptivos (ver `git log --oneline`: "SO clase2: ...", "clase16 correccion", etc.).
- No hay `.gitignore`. Material suelto (PDFs curriculares, `Clases.txt`, etc.) ha aparecido sin commitear en `SistemasOperativos/`; no agregarlo al sitio a menos que se pida.
- **`git push`/`fetch` falla en este equipo** con `Bad owner or permissions on /etc/ssh/ssh_config.d/20-systemd-ssh-proxy.conf`: el directorio `/etc/ssh/ssh_config.d/` pertenece a `nobody:nobody` y ssh se niega a leerlo. Arreglo definitivo (requiere sudo del usuario): `sudo chown root:root /etc/ssh/ssh_config.d /etc/ssh/ssh_config.d/*`. Workaround sin sudo, porque pasar `-F` hace que ssh ignore el config del sistema:
  `GIT_SSH_COMMAND='ssh -F /dev/null -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes' git push origin main`
- El sitio se publica en Vercel (`https://javiera10.vercel.app`) y redespliega solo con cada push. Si un cambio "no aparece", verifica primero que el commit llegó a `main` (`raw.githubusercontent.com` cachea unos minutos; la API `api.github.com/repos/.../contents/...` responde al instante).

## Lo que NO hacer

- No introducir `package.json`, bundlers, frameworks, linters, formateadores ni CI: es sitio estático a propósito.
- No crear archivos compartidos en una carpeta `assets/` o `js/` comunes — la arquitectura es deliberadamente copia-pega por clase.
- No borrar ni renombrar claves de `localStorage` sin migrar el progreso de estudiantes.
