# 🚀 Plan de Mejoras: Clase 8 - Simulador CLI (javiera10.vercel.app)

Este documento detalla las mejoras de UX/UI y correcciones de casos borde para optimizar la experiencia de uso del simulador de línea de comandos en la **Clase 8 de Sistemas Operativos**.

---

## 📄 1. Historial de Comandos y Auto-completado (Teclado)

### 🎯 Objetivo
Permitir que los estudiantes naveguen por comandos anteriores y completen rutas rápidamente usando el teclado.

- [ ] **Historial con Flechas (`▲` / `▼`):**
  - Guardar cada comando ejecutado en un arreglo `commandHistory`.
  - Permitir navegar hacia atrás (`▲`) y hacia adelante (`▼`) en el historial restaurando el texto en el prompt.
- [ ] **Autocompletado con `Tab`:**
  - Al presionar `Tab`, analizar el directorio actual en el VirtualFS.
  - Si hay una sola coincidencia con el prefijo escrito, auto-completar el nombre de la carpeta o archivo.
  - Prevenir el comportamiento por defecto de la tecla `Tab` en el navegador (`e.preven
tDefault()`).

---

## 📱 2. Adaptabilidad Móvil (UX Touch)

### 🎯 Objetivo
Facilitar la interacción en teléfonos y tablets sin depender exclusivamente de un teclado físico.

- [ ] **Barra de Atajos Rápidos (Virtual Toolbar):**
  - Insertar una barra sobre la consola en pantallas `< 768px` con botones para caracteres frecuentes:
    ` / ` | ` \ ` | ` ~ ` | ` - ` | ` Tab ` | ` ▲ ` | ` ▼ `
- [ ] **Ajuste de Tipografía y Scroll Auto:**
  - Configurar `font-size: 0.85rem` en pantallas pequeñas para evitar desbordamientos de texto.
  - Garantizar que la consola mantenga el scroll automático al final (`scrollTop = scrollHeight`) tras cada ejecución.

---

## ⚙️ 3. Robustez del Parser de Rutas (VirtualFS Edge Cases)

### 🎯 Objetivo
Asegurar que el sistema de archivos en JS maneje correctamente expresiones y navegaciones complejas.

- [ ] **Resolución de Rutas Relativas Complejas:**
  - Validar que comandos como `cd ../../`, `cd ./`, o `cd ../carpeta` resuelvan la ruta de forma jerárquica precisa.
- [ ] **Normalización de Separadores:**
  - Permitir que el parser de Windows (PowerShell/CMD) acepte tanto `\` como `/` al especificar rutas de carpetas.
- [ ] **Comandos y Parámetros con Espacios:**
  - Asegurar soporte para argumentos entre comillas (ejemplo: `mkdir "Mi Carpeta"` o `cd "Archivos de Programa"`).

---

## 📌 Checklist de Verificación Final (QA)

1. [ ] ¿Funcionan las flechas arriba/abajo sin mover la página web?
2. [ ] ¿La tecla `Tab` auto-completa nombres de carpetas existentes?
3. [ ] ¿El teclado móvil permite escribir caracteres como `/` o `-` mediante los botones de acceso rápido?
4. [ ] ¿El progreso se guarda correctamente en `localStorage` tras completar cada reto?
