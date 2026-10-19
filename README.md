# Gestor de Tareas - Parcial 2 POE

Proyecto práctico de Programación Orientada a Eventos (POE) para segundo año de carrera. Actualización del Laboratorio #2 con nuevas funcionalidades. Es una aplicación web para organizar tareas con prioridades, fechas límite, búsqueda, filtros y guardado automático en el navegador.

---

## 1. Qué es

Es un organizador de tareas personal que corre directamente en el navegador. Permite registrar actividades, asignarles prioridad (alta/media/baja) y fecha límite, editarlas, marcarlas como completadas y eliminarlas con confirmación. No se necesita registro ni servidor, todo se guarda en `localStorage`.

---

## 2. Funcionalidades nuevas (Parcial 2)

Comparado con el Laboratorio #2, se agregaron estas funcionalidades:

| RF | Descripción | Estado |
|---|---|---|
| RF-01 | Fecha límite por tarea | ✅ |
| RF-02 | Prioridad (alta / media / baja) | ✅ |
| RF-03 | Editar tareas existentes | ✅ |
| RF-04 | Eliminar con confirmación (modal) | ✅ |
| RF-05 | Buscar por título en tiempo real | ✅ |
| RF-06 | Filtrar por estado y prioridad | ✅ |
| RF-07 | Ordenar por fecha o prioridad | ✅ |
| RF-08 | Guardar en localStorage | ✅ |
| RF-09 | Contador de tareas pendientes | ✅ |
| Reto | Marcar tareas vencidas en rojo | ✅ |

---

## 3. Cómo se hizo

Desarrollado con **TypeScript**, **HTML5** y **CSS puro**, empaquetado con **Vite**. Sin frameworks. El código sigue el patrón MVC:

* **`src/models/Tarea.ts` (Modelo):** Define los datos de una tarea: id, título, fecha de creación, estado completada, prioridad y fecha límite. Incluye el método `estaVencida()` para detectar tareas vencidas automáticamente.
* **`src/views/TareaView.ts` (Vista):** Dibuja las tareas, maneja el formulario en modo agregar y en modo editar, muestra badges de prioridad, fechas, reloj en tiempo real, barra de progreso y el modal de confirmación para eliminar.
* **`src/controllers/TareaController.ts` (Controlador):** Coordina las acciones del usuario, valida duplicados de título, aplica la búsqueda + filtros + ordenamiento combinados antes de renderizar.
* **`src/services/StorageService.ts` (Servicio):** Lee y escribe en `localStorage` con validación de esquema para los campos nuevos.
* **`src/main.ts`:** Punto de entrada, conecta todos los módulos.

---

## 4. Validaciones implementadas

- Título no puede estar vacío
- No se permiten tareas con el mismo nombre (duplicados)
- Al editar, tampoco puede duplicar con otra tarea existente
- Tareas vencidas se detectan comparando la fecha actual vs `fechaLimite`

---

## 5. Cómo arrancarlo

### Requisitos previos
* Node.js instalado en la máquina.

### Pasos para ejecutar
1. Abrir una terminal en la carpeta del proyecto.
2. Instalar dependencias (solo la primera vez):
   ```bash
   npm install
   ```
3. Iniciar modo desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir `http://localhost:5173` en el navegador.

### Cómo comprobar que funciona

1. Agrega una tarea con prioridad Alta y una fecha límite pasada → debe aparecer en **rojo** como vencida.
2. Edita esa tarea cambiando el título → el formulario carga los datos actuales y el botón cambia a "Actualizar".
3. Intenta agregar otra tarea con el mismo nombre → debe mostrar mensaje de duplicado.
4. Usa el buscador y los filtros al mismo tiempo → solo deben mostrarse las tareas que cumplan ambos criterios.
5. Da clic en eliminar → debe aparecer el modal de confirmación antes de borrar.
6. Recarga la página (F5) → las tareas deben seguir ahí con sus datos completos.

### Comandos útiles
```bash
npm run check   # verifica tipos TypeScript
npm run build   # genera archivos de producción en /dist
```
