### CONTEXTO DEL PROYECTO
Estamos desarrollando la **Clase 8** del módulo de "Sistemas Operativos" para el sitio estático web de Grado Décimo: `https://javiera10.vercel.app/`.
- Tecnología base: HTML5, CSS3, JavaScript ES6+ (Cliente estático compatible con Vercel).
- Estructura de ruta esperada: `SistemasOperativos/ocho-interfaz-linea-comandos-cli/index.html`.
- Formato: Lección interactiva dividida en módulos pedagógicos, barra de progreso local, descansos estructurados y un simulador de consola integrado.

### OBJETIVO
Crear la clase interactiva "Línea de Comandos (CLI): Administrando el SO desde la Consola (Linux vs Windows)", con un simulador en JS que permita a los estudiantes practicar los comandos fundamentales sin salir del navegador ni instalar nada.

---

### ARQUITECTURA DEL SIMULADOR WEB (JS Virtual Shell)

El componente principal debe ser un widget interactivo con:
1. **Doble consola con pestañas:** 
   - Pestaña 1: **Linux Bash** (`estudiante@javiera10:~$`)
   - Pestaña 2: **Windows PowerShell / CMD** (`PS C:\Users\Estudiante>`)
2. **Sistema de Archivos Virtual (VirtualFS):**
   - Árbol de archivos y carpetas simulado en memoria/JSON (`/home/estudiante/documentos`, `C:\Users\Estudiante\Documentos`).
   - Soporte para creación (`mkdir`, `touch` / `New-Item`), navegación (`cd`), lectura (`cat` / `type`), listado (`ls -l`, `ls -a` / `dir`) y borrado (`rm`, `rmdir` / `del`).
3. **Mecanismo de Desafíos/Retos Guiados:**
   - La clase mostrará misiones interactivas (Ej: *"Crea una carpeta llamada 'Proyectos' y dentro crea el archivo 'notas.txt'"*).
   - El simulador validará en tiempo real el estado del VirtualFS para marcar el reto como completado.

---

### METODOLOGÍA ADVERSARIAL EN LOOP (Desarrollador vs Red Team)

Debes trabajar en un bucle iterativo ejecutando estos 4 pasos por cada módulo:

#### FASE 1: Codificación (Programador)
Escribe el HTML, CSS (mismo estilo visual moderno de javiera10) y JS del módulo actual.

#### FASE 2: Prueba en Sandbox
Ejecuta y parsea el VirtualFS en el navegador simulado.

#### FASE 3: Evaluación Adversarial (Red Team)
El Red Team intentará romper la clase y la consola evaluando:
1. **Comandos al borde (Edge Cases):** ¿Qué pasa si el estudiante escribe `cd ../../../`, rutas relativas con espacios, comillas simples/dobles o comandos inexistentes? ¿Se muestra un error pedagógico o se rompe la app?
2. **Persistencia y Progreso:** ¿Si el usuario refresca la pantalla, se guarda el estado en `localStorage` igual que en las otras clases de javiera10?
3. **Coherencia Sintáctica:** ¿`ls` en Windows redirige o enseña la equivalencia con `dir`? ¿Los parámetros de Linux (`ls -la`) funcionan de acuerdo con el estándar?
4. **Usabilidad Móvil y Teclado:** ¿Es usable en pantallas pequeñas? ¿Soporta auto-completado con `Tab` y flechas arriba/abajo para el historial de comandos?

#### FASE 4: Refactorización
Corrige las fallas detectadas por el Red Team hasta que la prueba pase al 100%.

---

### PLAN DE DESARROLLO POR MÓDULOS (A entregar uno por uno)

- **Módulo 1: Estructura HTML/CSS de la Clase 8** (Alineada visualmente a las Clases 1-7 de Sistemas Operativos en javiera10.vercel.app).
- **Módulo 2: Motor del VirtualFS y Parser de Comandos en JS** (Manejo de rutas absolutas/relativas, parsing de argumentos).
- **Módulo 3: UI de la Consola (xterm.js o DOM Terminal) con Pestañas Bash / PowerShell**.
- **Módulo 4: Batería de Retos Interactivos con Autovalidación de Diagnóstico**.
- **Módulo 5: Integración con el Sistema de Progreso LocalStorage de javiera10**.

### INSTRUCCIONES DE EJECUCIÓN
Comienza desarrollando el **Módulo 1** y el **Módulo 2**. Para cada uno, muéstrame el código y el reporte de evaluación del Red Team antes de continuar.
