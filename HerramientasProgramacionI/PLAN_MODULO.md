# Curso de HTML, CSS y JavaScript con localStorage y CRUD

Planificación para un curso de **22 clases**, cada una de **2 horas y 40 minutos** —es decir, **160 minutos por sesión**— orientado a que los estudiantes desarrollen un **proyecto final tipo CRUD usando `localStorage`**.

---

## Datos generales del curso

- **Duración total:** 22 sesiones.
- **Duración por sesión:** 3 h 45 min / 165 minutos. Con un descanso de 15
- **Tecnologías:** HTML, CSS y JavaScript.
- **Enfoque:** práctico, progresivo y basado en proyecto.
- **Proyecto final sugerido:** gestor de tareas, gestor de productos o gestor de contactos.
- **Persistencia:** `localStorage`.
- **Nivel:** inicial.

---

## Objetivo general del curso

Que los estudiantes sean capaces de construir una aplicación web funcional utilizando HTML para la estructura, CSS para el diseño, JavaScript para la interactividad y `localStorage` para la persistencia de datos, implementando operaciones CRUD:

- **Create:** crear datos.
- **Read:** leer/listar datos.
- **Update:** actualizar datos.
- **Delete:** eliminar datos.

---

## Estructura sugerida de cada clase

Cada sesión de 160 minutos puede organizarse así:

Actividad

Bienvenida, objetivos del día y repaso breve |
Explicación teórica corta con demostración |
Práctica guiada |
Descanso / pausa activa |
Taller práctico / reto aplicado |
Puesta en común, revisión de avances y dudas |
Cierre y tarea opcional |

---

## Metodología

- Aprender haciendo.
- Cada clase debe tener un resultado visible.
- Usar un proyecto integrador desde el inicio.
- Explicaciones breves y mucha práctica.
- Revisión entre pares.
- Evaluación por avances y proyecto final.

---

## Proyecto integrador

Se recomienda construir una aplicación como un **gestor de tareas**.

### Ejemplo de objeto tarea

```js
{
  id: 1,
  titulo: "Estudiar JavaScript",
  descripcion: "Repasar DOM y eventos",
  categoria: "estudio",
  completada: false,
  fecha: "2026-07-01"
}
```

### Funcionalidades mínimas del proyecto final

- Agregar tarea.
- Listar tareas.
- Editar tarea.
- Eliminar tarea.
- Guardar en `localStorage`.
- Recuperar datos al recargar la página.
- Validar formulario.
- Diseño responsive.

### Funcionalidades opcionales

- Buscar tareas.
- Filtrar por estado.
- Filtrar por categoría.
- Contador de tareas pendientes.
- Botón para vaciar todo.
- Exportar/importar JSON.
- Modo oscuro.
- Publicación en GitHub Pages o Netlify.

---

## Distribución general del curso

| Módulo | Clases | Tema principal | Producto esperado |
|---|---:|---|---|
| 1 | 1 a 4 | HTML | Página web semántica con formulario |
| 2 | 5 a 10 | CSS | Interfaz responsive y estilizada |
| 3 | 11 a 17 | JavaScript | Interactividad, DOM y formularios dinámicos |
| 4 | 18 a 21 | localStorage y CRUD | Proyecto CRUD funcional |
| 5 | 22 | Cierre | Presentación y evaluación final |

---

# Módulo 1: HTML

---

## Clase 1 — Introducción a la web y primera página HTML

### Objetivo

Que los estudiantes entiendan qué es una página web, cómo funciona HTML y creen su primer archivo HTML.

### Contenidos

- ¿Qué es Internet, navegador, servidor y cliente?
- Diferencia entre HTML, CSS y JavaScript.
- Estructura básica de una página HTML:
  - `<!DOCTYPE html>`
  - `<html>`
  - `<head>`
  - `<body>`
- Etiquetas básicas:
  - `<h1>` a `<h6>`
  - `<p>`
  - `<a>`
  - `<br>`
  - `<hr>`
- Atributos básicos.
- Comentarios en HTML.
- Uso de VS Code y Live Server.

### Actividades

- Crear una carpeta del proyecto.
- Crear un archivo `index.html`.
- Escribir una página simple llamada “Sobre mí”.
- Agregar título, párrafos y encabezados.

### Entregable

Una página HTML básica con:

- Título.
- Encabezado principal.
- Párrafos.
- Enlace simple.

### Cierre

> HTML es el esqueleto de la página.

---

## Clase 2 — HTML semántico y estructura de página

### Objetivo

Que los estudiantes aprendan a estructurar una página con etiquetas semánticas.

### Contenidos

- ¿Qué es HTML semántico?
- Etiquetas estructurales:
  - `<header>`
  - `<nav>`
  - `<main>`
  - `<section>`
  - `<article>`
  - `<aside>`
  - `<footer>`
- Listas:
  - `<ul>`
  - `<ol>`
  - `<li>`
- Enlaces internos y externos.
- Buenas prácticas de estructura.

### Actividades

- Convertir la página de la clase anterior en una página semántica.
- Crear una estructura para una landing page:
  - Encabezado.
  - Menú.
  - Sección principal.
  - Sección de servicios o tarjetas.
  - Pie de página.

### Entregable

Página HTML semántica con:

- `header`
- `nav`
- `main`
- Al menos dos `section`
- `footer`

### Tarea opcional

Traer contenido para el proyecto final: título, descripción, categorías posibles.

---

## Clase 3 — Imágenes, multimedia, tablas y listas

### Objetivo

Que los estudiantes incorporen contenido multimedia y tablas simples.

### Contenidos

- Imágenes:
  - `<img>`
  - Atributo `src`
  - Atributo `alt`
- Buenas prácticas de accesibilidad con imágenes.
- Figuras:
  - `<figure>`
  - `<figcaption>`
- Tablas:
  - `<table>`
  - `<thead>`
  - `<tbody>`
  - `<tr>`
  - `<th>`
  - `<td>`
- Video y audio de forma introductoria.

### Actividades

- Agregar una galería simple de imágenes.
- Crear una tabla con datos, por ejemplo:
  - productos,
  - horarios,
  - tareas,
  - estudiantes.
- Añadir descripciones alternativas a las imágenes.

### Entregable

Página con:

- Al menos 3 imágenes.
- Una tabla simple.
- Uso correcto de `alt`.

### Cierre

En el proyecto final los datos se mostrarán como tarjetas o listas, no necesariamente tablas, pero entender tablas ayuda a estructurar información.

---

## Clase 4 — Formularios HTML y accesibilidad básica

### Objetivo

Que los estudiantes creen formularios correctamente estructurados y accesibles.

### Contenidos

- Formularios:
  - `<form>`
  - `<label>`
  - `<input>`
  - `<textarea>`
  - `<select>`
  - `<option>`
  - `<button>`
- Atributos:
  - `type`
  - `name`
  - `placeholder`
  - `required`
  - `value`
- Tipos de input:
  - `text`
  - `email`
  - `password`
  - `number`
  - `date`
  - `checkbox`
  - `radio`
- Accesibilidad básica:
  - Relacionar `label` con `input`.
  - Orden lógico de tabulación.
  - Contraste básico.
  - Foco visible.

### Actividades

- Crear un formulario de contacto.
- Crear un formulario para agregar una tarea:
  - título,
  - descripción,
  - categoría,
  - estado.
- Validar con atributos HTML como `required`.

### Entregable

Checkpoint HTML:

- Página semántica.
- Formulario funcional visualmente.
- Contenido mínimo del proyecto definido.

### Cierre

HTML no tiene lógica, solo estructura. La lógica llegará con JavaScript.

---

# Módulo 2: CSS

---

## Clase 5 — Introducción a CSS: selectores, colores y tipografía

### Objetivo

Que los estudiantes comiencen a dar estilos a sus páginas usando CSS.

### Contenidos

- ¿Qué es CSS?
- Formas de incluir CSS:
  - externo,
  - interno,
  - en línea.
- Sintaxis CSS.
- Selectores:
  - etiqueta,
  - clase,
  - id,
  - universal.
- Colores:
  - nombres,
  - hexadecimal,
  - RGB,
  - HSL.
- Tipografía:
  - `font-family`
  - `font-size`
  - `font-weight`
  - `line-height`
- Introducción a cascada y especificidad.

### Actividades

- Crear archivo `styles.css`.
- Estilizar la página HTML del módulo anterior.
- Aplicar colores, fuentes y espaciados simples.

### Entregable

Página con:

- Hoja de estilos externa.
- Selectores de clase.
- Colores y tipografía definidos.

### Cierre

CSS permite separar presentación y estructura.

---

## Clase 6 — Box model, display y posicionamiento

### Objetivo

Que los estudiantes comprendan cómo se distribuyen los elementos en la página.

### Contenidos

- Box model:
  - `content`
  - `padding`
  - `border`
  - `margin`
- Propiedades:
  - `width`
  - `height`
  - `padding`
  - `margin`
  - `border`
  - `box-sizing`
- Display:
  - `block`
  - `inline`
  - `inline-block`
  - `none`
- Posicionamiento:
  - `static`
  - `relative`
  - `absolute`
  - `fixed`
  - `sticky`
- Introducción a `z-index`.
- Sombras:
  - `box-shadow`

### Actividades

- Crear tarjetas visuales.
- Diseñar botones.
- Posicionar un menú simple.
- Practicar márgenes y rellenos.

### Entregable

Componentes básicos:

- Card.
- Botón.
- Barra de navegación simple.

### Cierre

Entender el box model es clave para controlar el diseño.

---

## Clase 7 — Flexbox

### Objetivo

Que los estudiantes aprendan a crear layouts flexibles.

### Contenidos

- Concepto de contenedor flexible.
- Propiedades del contenedor:
  - `display: flex`
  - `flex-direction`
  - `justify-content`
  - `align-items`
  - `flex-wrap`
  - `gap`
- Propiedades de los hijos:
  - `flex-grow`
  - `flex-shrink`
  - `flex-basis`
- Centrado de elementos.
- Creación de filas y columnas.

### Actividades

- Crear un menú responsive con Flexbox.
- Crear una fila de tarjetas.
- Centrar vertical y horizontalmente un elemento.

### Entregable

Layout con:

- Navbar.
- Sección de tarjetas usando Flexbox.

### Cierre

Flexbox es ideal para distribuciones en una dimensión.

---

## Clase 8 — CSS Grid

### Objetivo

Que los estudiantes aprendan a construir layouts bidimensionales.

### Contenidos

- Concepto de grid.
- Propiedades:
  - `display: grid`
  - `grid-template-columns`
  - `grid-template-rows`
  - `gap`
  - `grid-template-areas`
- Unidades:
  - `fr`
  - `auto`
  - `minmax()`
- `repeat()`
- `auto-fit` y `auto-fill`.

### Actividades

- Crear una galería responsive.
- Diseñar un layout tipo dashboard.
- Reorganizar secciones con `grid-template-areas`.

### Entregable

Página con:

- Galería responsive.
- Layout principal construido con Grid.

### Cierre

Grid es ideal para layouts en filas y columnas.

---

## Clase 9 — Responsive Design y Mobile First

### Objetivo

Que los estudiantes adapten sus páginas a distintos tamaños de pantalla.

### Contenidos

- ¿Qué es responsive design?
- Mobile First.
- Viewport.
- Media queries.
- Breakpoints.
- Unidades relativas:
  - `%`
  - `em`
  - `rem`
  - `vw`
  - `vh`
- Imágenes responsive.
- Variables CSS:
  - `:root`
  - `--color-primario`
  - `--fuente-principal`

### Actividades

- Adaptar la landing page a móvil, tablet y escritorio.
- Usar variables para colores principales.
- Mejorar el menú para pantallas pequeñas.

### Entregable

Página responsive con:

- Al menos 2 media queries.
- Uso de variables CSS.
- Diseño adaptable.

### Cierre

Diseñar primero para móvil ayuda a priorizar contenido.

---

## Clase 10 — Componentes, animaciones y checkpoint CSS

### Objetivo

Que los estudiantes mejoren la interfaz con estados, transiciones y componentes visuales.

### Contenidos

- Pseudo-clases:
  - `:hover`
  - `:focus`
  - `:active`
  - `:disabled`
- Transiciones:
  - `transition`
- Transformaciones:
  - `translate`
  - `scale`
  - `rotate`
- Animaciones simples.
- Sombras, bordes redondeados y efectos visuales.
- Buenas prácticas de UX.

### Actividades

- Mejorar botones y tarjetas con hover y focus.
- Crear una animación suave al aparecer una tarjeta.
- Pulir la interfaz del proyecto.

### Entregable

Checkpoint CSS:

- Página responsive.
- Componentes estilizados.
- Interfaz lista para recibir JavaScript.

### Cierre

CSS no solo decora: comunica estados y mejora la experiencia.

---

# Módulo 3: JavaScript

---

## Clase 11 — Introducción a JavaScript

### Objetivo

Que los estudiantes comprendan qué es JavaScript y escriban sus primeros scripts.

### Contenidos

- ¿Qué es JavaScript?
- Diferencia entre HTML, CSS y JS.
- Inclusión de scripts:
  - `<script src="...">`
  - `defer`
- Consola del navegador.
- Variables:
  - `let`
  - `const`
- Tipos de datos:
  - string
  - number
  - boolean
  - null
  - undefined
- Operadores básicos.
- Template literals.
- `console.log()`.

### Actividades

- Crear archivo `script.js`.
- Mostrar mensajes en consola.
- Crear variables con datos personales.
- Hacer operaciones simples.

### Entregable

Script con:

- Variables.
- Mensajes en consola.
- Uso de template literals.

### Cierre

JavaScript agrega lógica e interactividad.

---

## Clase 12 — Condicionales y bucles

### Objetivo

Que los estudiantes aprendan a controlar el flujo de un programa.

### Contenidos

- Condicionales:
  - `if`
  - `else if`
  - `else`
  - operador ternario
- Comparaciones:
  - `===`
  - `!==`
  - `>`
  - `<`
- Operadores lógicos:
  - `&&`
  - `||`
  - `!`
- Bucles:
  - `for`
  - `while`
  - `do while`
- Introducción a `break` y `continue`.

### Actividades

- Validar si un usuario es mayor de edad.
- Mostrar una tabla de multiplicar.
- Recorrer una lista simple con `for`.

### Entregable

Mini ejercicios de lógica en consola.

### Cierre

La lógica permite que el programa tome decisiones.

---

## Clase 13 — Funciones y arrays

### Objetivo

Que los estudiantes organicen código en funciones y trabajen con listas.

### Contenidos

- Funciones:
  - declaración clásica,
  - funciones flecha,
  - parámetros,
  - retorno.
- Scope básico.
- Arrays:
  - creación,
  - índices,
  - `length`,
  - `push`,
  - `pop`,
  - `includes`,
  - `indexOf`.
- Recorrer arrays:
  - `for`
  - `for...of`

### Actividades

- Crear funciones para:
  - saludar,
  - sumar,
  - validar un dato.
- Crear una lista de tareas en consola.
- Agregar y quitar elementos de un array.

### Entregable

Script con:

- Funciones.
- Array de tareas.
- Función para mostrar tareas en consola.

### Cierre

Los arrays serán fundamentales para el CRUD.

---

## Clase 14 — Objetos y métodos de array

### Objetivo

Que los estudiantes trabajen con datos estructurados usando objetos y métodos de array.

### Contenidos

- Objetos literales.
- Propiedades y métodos.
- Acceso a propiedades:
  - punto,
  - corchetes.
- Introducción a desestructuración.
- Métodos de array:
  - `forEach()`
  - `map()`
  - `filter()`
  - `find()`
  - `some()`
- Array de objetos.

### Actividades

- Crear objetos para tareas.
- Filtrar tareas completadas.
- Buscar una tarea por id.
- Mostrar tareas con `forEach()`.

### Entregable

Array de objetos con funciones para:

- listar,
- filtrar,
- buscar.

### Cierre

El proyecto final usará arrays de objetos para representar los datos.

---

## Clase 15 — DOM: seleccionar y modificar elementos

### Objetivo

Que los estudiantes aprendan a manipular HTML desde JavaScript.

### Contenidos

- ¿Qué es el DOM?
- Selección de elementos:
  - `getElementById()`
  - `querySelector()`
  - `querySelectorAll()`
- Modificar contenido:
  - `textContent`
  - `innerHTML`
- Modificar atributos.
- Modificar clases:
  - `classList.add()`
  - `classList.remove()`
  - `classList.toggle()`
- Crear elementos:
  - `document.createElement()`
  - `append()`
  - `appendChild()`
- Introducción a `DocumentFragment`.

### Actividades

- Mostrar una lista de tareas desde un array en el HTML.
- Cambiar textos dinámicamente.
- Agregar elementos al DOM sin recargar la página.

### Entregable

Lista de tareas renderizada dinámicamente en HTML.

### Cierre

JavaScript puede modificar la página sin recargarla.

---

## Clase 16 — Eventos

### Objetivo

Que los estudiantes aprendan a responder a acciones del usuario.

### Contenidos

- ¿Qué es un evento?
- `addEventListener()`
- Eventos comunes:
  - `click`
  - `input`
  - `submit`
  - `change`
- Objeto evento.
- `preventDefault()`
- Delegación de eventos.
- Botones dinámicos.

### Actividades

- Crear un contador.
- Mostrar/ocultar un elemento.
- Capturar lo que el usuario escribe en un input.
- Evitar que un formulario recargue la página.

### Entregable

Página con:

- Botón interactivo.
- Input con evento.
- Formulario que no recarga la página.

### Cierre

Los eventos conectan la interfaz con la lógica.

---

## Clase 17 — Formularios con JavaScript y checkpoint de JS

### Objetivo

Que los estudiantes capturen datos de formularios y los usen en la aplicación.

### Contenidos

- Captura de datos de formularios.
- Uso de `FormData`.
- Validación básica:
  - campos vacíos,
  - longitud mínima,
  - tipo de dato.
- Mostrar mensajes de error.
- Limpiar formulario.
- Agregar objetos a un array.
- Renderizar nuevamente la lista.

### Actividades

- Tomar datos del formulario de tareas.
- Crear un objeto tarea.
- Agregarlo a un array.
- Mostrarlo en el HTML.

### Entregable

Checkpoint JavaScript:

- Formulario funcional.
- Lista de tareas en memoria.
- Renderizado dinámico.

### Cierre

Ya tienen la base del “Create” y “Read” del CRUD.

---

# Módulo 4: localStorage y CRUD

---

## Clase 18 — Persistencia con localStorage y JSON

### Objetivo

Que los estudiantes comprendan cómo guardar datos en el navegador.

### Contenidos

- ¿Qué es `localStorage`?
- Diferencia entre memoria y almacenamiento persistente.
- `localStorage.setItem()`
- `localStorage.getItem()`
- `localStorage.removeItem()`
- `localStorage.clear()`
- JSON:
  - `JSON.stringify()`
  - `JSON.parse()`
- Limitaciones de `localStorage`.
- No guardar datos sensibles.

### Actividades

- Guardar una tarea en `localStorage`.
- Recuperar tareas al recargar la página.
- Guardar un array de objetos como JSON.
- Cargar el array desde JSON al iniciar la aplicación.

### Entregable

Aplicación que conserva datos después de recargar.

### Cierre

`localStorage` permite persistencia simple sin backend.

---

## Clase 19 — CRUD: crear y leer

### Objetivo

Que los estudiantes implementen formalmente las operaciones de creación y lectura.

### Contenidos

- Concepto de CRUD:
  - Create,
  - Read,
  - Update,
  - Delete.
- Arquitectura simple:
  - datos,
  - almacenamiento,
  - renderizado.
- Generación de IDs:
  - `Date.now()`
  - `crypto.randomUUID()` si está disponible.
- Funciones:
  - `cargarTareas()`
  - `guardarTareas()`
  - `renderizarTareas()`
  - `agregarTarea()`
- Renderizar desde `localStorage`.

### Actividades

- Iniciar la app cargando datos guardados.
- Agregar tareas desde formulario.
- Guardar automáticamente.
- Actualizar la lista en pantalla.

### Entregable

CRUD parcial:

- Crear tareas.
- Leer tareas guardadas.

### Cierre

La app ya persiste información creada por el usuario.

---

## Clase 20 — CRUD: actualizar y eliminar

### Objetivo

Que los estudiantes completen el CRUD con edición y borrado.

### Contenidos

- Identificar elementos por ID.
- Delegación de eventos para botones dinámicos.
- Eliminar elementos:
  - `filter()`
- Actualizar elementos:
  - `find()`
  - `map()`
  - edición directa del objeto
- Cargar datos en formulario para editar.
- Botón “Guardar cambios”.
- Confirmación simple para eliminar.

### Actividades

- Agregar botón eliminar a cada tarea.
- Permitir editar título, descripción o categoría.
- Marcar tarea como completada.
- Actualizar `localStorage` después de cada cambio.

### Entregable

CRUD completo:

- Crear.
- Leer.
- Actualizar.
- Eliminar.

### Cierre

Con esto el proyecto ya cumple el requisito principal del curso.

---

## Clase 21 — Proyecto final: filtros, validaciones, UX y despliegue

### Objetivo

Que los estudiantes pulan el proyecto y agreguen funcionalidades adicionales.

### Contenidos

- Filtros:
  - todas,
  - pendientes,
  - completadas.
- Buscador por texto.
- Contador de tareas.
- Validaciones más completas.
- Mensajes de estado:
  - “Tarea agregada”,
  - “Tarea eliminada”,
  - “No hay tareas”.
- Mejora visual con CSS.
- Accesibilidad básica.
- Pruebas manuales.
- Opcional: publicar en GitHub Pages o Netlify.

### Actividades

- Agregar buscador.
- Agregar filtros.
- Validar formulario.
- Mejorar diseño responsive.
- Probar el flujo completo:
  1. Crear.
  2. Recargar página.
  3. Editar.
  4. Eliminar.
  5. Filtrar.

### Entregable

Proyecto final MVP:

- CRUD completo.
- Persistencia con `localStorage`.
- Interfaz responsive.
- Validaciones básicas.
- Funcionalidad de filtro o búsqueda.

### Cierre

El proyecto debe sentirse como una pequeña aplicación funcional.

---

## Clase 22 — Presentación final, evaluación y cierre del curso

### Objetivo

Que los estudiantes presenten su proyecto, reciban retroalimentación y se cierre el proceso formativo.

### Actividades

- Preparación de demostración.
- Presentación de proyectos.
- Revisión de código.
- Retroalimentación grupal.
- Pruebas cruzadas entre compañeros.
- Evaluación final.
- Próximos pasos de aprendizaje.

### Posible dinámica

5 minutos por estudiante o equipo:

- Mostrar aplicación.
- Explicar funcionalidades.
- Mostrar código.
- Contar dificultades y soluciones.

### Evaluación sugerida

| Aspecto | Puntaje sugerido |
|---|---:|
| HTML semántico y accesible | 10% |
| CSS responsive y diseño | 20% |
| JavaScript y lógica | 20% |
| Manipulación del DOM | 15% |
| CRUD completo | 20% |
| Uso correcto de localStorage | 10% |
| Presentación y buenas prácticas | 5% |

### Entregable final

Proyecto publicado o ejecutable localmente con:

- `index.html`
- `styles.css`
- `script.js`
- README simple opcional.

---

# Versión resumida del cronograma

| Clase | Tema |
|---:|---|
| 1 | Introducción a la web y primera página HTML |
| 2 | HTML semántico y estructura |
| 3 | Imágenes, multimedia, listas y tablas |
| 4 | Formularios HTML y accesibilidad |
| 5 | Introducción a CSS, selectores y colores |
| 6 | Box model, display y posicionamiento |
| 7 | Flexbox |
| 8 | CSS Grid |
| 9 | Responsive Design y variables CSS |
| 10 | Animaciones, componentes y checkpoint CSS |
| 11 | Introducción a JavaScript |
| 12 | Condicionales y bucles |
| 13 | Funciones y arrays |
| 14 | Objetos y métodos de array |
| 15 | DOM: selección y manipulación |
| 16 | Eventos |
| 17 | Formularios con JavaScript y checkpoint JS |
| 18 | JSON y localStorage |
| 19 | CRUD: crear y leer |
| 20 | CRUD: actualizar y eliminar |
| 21 | Filtros, validaciones, UX y proyecto final |
| 22 | Presentación, evaluación y cierre |

---

# Recomendaciones didácticas

## 1. Enseñar con retos pequeños

En cada clase, mejor que explicar todo durante mucho tiempo, usar:

- “Vamos a crear un botón que haga esto”.
- “Ahora hagan que aparezca una tarjeta”.
- “Ahora guardémoslo en localStorage”.

## 2. Mantener un proyecto hilo conductor

Desde la clase 1, los estudiantes pueden estar construyendo la misma aplicación:

- Clases 1-4: estructura HTML.
- Clases 5-10: estilos.
- Clases 11-17: lógica.
- Clases 18-21: persistencia y CRUD.
- Clase 22: presentación.

## 3. Evitar saturar con teoría

Para un curso inicial, conviene priorizar:

- HTML semántico.
- CSS layout.
- JavaScript básico.
- DOM.
- Eventos.
- Arrays de objetos.
- localStorage.

Temas como APIs, fetch, promesas, frameworks o backend pueden dejarse para un siguiente nivel.

## 4. Dar plantillas base

Para que no se pierdan en detalles, puedes entregar:

- Plantilla HTML inicial.
- CSS base.
- Funciones auxiliares.
- Ejemplo de objeto tarea.
- Ejemplo de `localStorage`.

Pero que ellos completen la lógica.

## 5. Fomentar la revisión entre pares

En las últimas clases, que los estudiantes prueben las aplicaciones de otros. Esto ayuda a detectar errores y mejora la comprensión.

---

# Resultado esperado al finalizar el curso

Al terminar las 22 clases, los estudiantes deberían poder:

- Crear una página web semántica con HTML.
- Darle estilos responsive con CSS.
- Manipular el DOM con JavaScript.
- Manejar eventos y formularios.
- Trabajar con arrays y objetos.
- Guardar y recuperar datos con `localStorage`.
- Construir una aplicación tipo CRUD.
- Presentar un proyecto funcional y comprensible.
