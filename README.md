# Gestor de Tareas - Laboratorio POE

Proyecto práctico de Programación Orientada a Eventos (POE) para segundo año de carrera. Es una aplicación web para organizar pendientes con guardado automático y una interfaz en tema oscuro inspirada en el menú de la Xbox clásica con reloj en tiempo real.

---

## 1. Qué es

Es un organizador de tareas personal que corre directamente en el navegador. Te permite registrar actividades pendientes, marcarlas conforme las vas terminando y llevar un control visual de tu progreso sin necesidad de registrarte ni conectarte a un servidor.

---

## 2. Cómo se hizo

Se desarrolló usando **TypeScript**, **HTML5** y **CSS puro**, empaquetado con **Vite**. No se usaron frameworks como React o Angular para enfocarse en la manipulación limpia del DOM y el manejo de eventos nativos.

El código está separado en capas para mantener orden (patrón MVC + Servicio):

* **src/models/Tarea.ts (Modelo):** Define qué datos tiene una tarea (id, título, fecha de creación y si está completada).
* **src/views/TareaView.ts (Vista):** Se encarga de dibujar las tareas en pantalla, manejar el reloj en tiempo real, actualizar la barra de progreso y capturar los eventos del usuario (clicks, submits y cambios en los checks).
* **src/controllers/TareaController.ts (Controlador):** Es el intermediario. Recibe las acciones de la vista, ejecuta la lógica de agregar, tachar o borrar, y manda a guardar los cambios.
* **src/services/StorageService.ts (Servicio):** Lee y escribe las tareas en `localStorage` usando JSON para que no se borren al cerrar la ventana.
* **src/main.ts:** Archivo principal donde se instancian y conectan todas las partes.

---

## 3. Cómo funciona

1. **Agregar:** Escribes una tarea en el cuadro de texto y das clic en "Agregar" (o presionas Enter). Si el campo está vacío, te muestra una advertencia que se quita sola al empezar a escribir.
2. **Completar:** Marcas la casilla a la izquierda de la tarea. El texto se tacha, el fondo cambia y la barra de porcentaje sube.
3. **Eliminar:** Das clic en el botón con el icono del basurero en la tarea que quieras quitar.
4. **Guardado automático:** Cualquier cambio se sincroniza al instante en el almacenamiento local del navegador (`localStorage`).
5. **Reloj de cabecera:** Muestra la hora local con segundos exactos y se actualiza cada segundo mediante `setInterval`.

---

## 4. Cómo arrancarlo y verificarlo

### Requisitos previos
* Node.js instalado en la máquina.

### Pasos para ejecutar
1. Abrir una terminal en la carpeta del proyecto (`Lista_de_Tareas`).
2. Instalar las dependencias (solo necesario la primera vez):
   ```bash
   npm install
   ```
3. Iniciar el entorno de desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir en el navegador la dirección que aparezca en la consola (normalmente `http://localhost:5173`).

### Cómo comprobar que todo funciona bien
* **Comprobación rápida en pantalla:**
  1. Agrega una tarea como "Estudiar para examen" y confirma que aparezca en la lista.
  2. Marca la casilla y revisa que la barra de progreso suba y el contador cambie.
  3. Recarga la página (F5) y comprueba que la tarea siga ahí con su mismo estado.
  4. Presiona el botón de eliminar y confirma que desaparezca.

* **Comprobación técnica en consola:**
  * Para revisar que no haya errores de tipos en TypeScript:
    ```bash
    npm run check
    ```
  * Para generar los archivos finales optimizados de producción:
    ```bash
    npm run build
    ```

