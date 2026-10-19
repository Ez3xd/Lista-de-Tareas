import { Tarea } from "../models/Tarea";
import type { Prioridad } from "../models/Tarea";

type AccionesTarea = {
  agregar: (titulo: string, prioridad: Prioridad, fechaLimite: string) => void;
  cambiarEstado: (id: string) => void;
  eliminar: (id: string) => void;
  editar: (id: string) => void;
  actualizar: (id: string, titulo: string, prioridad: Prioridad, fechaLimite: string) => void;
  buscar: (termino: string) => void;
  filtrar: (estado: string, prioridad: string) => void;
  ordenar: (criterio: string) => void;
};

// Vista: administra los elementos del DOM y delega los eventos del usuario (POE).
export class TareaView {
  private readonly formulario: HTMLFormElement;
  private readonly entrada: HTMLInputElement;
  private readonly selectPrioridad: HTMLSelectElement;
  private readonly inputFecha: HTMLInputElement;
  private readonly btnSubmitLabel: HTMLElement;
  private readonly btnCancelar: HTMLButtonElement;
  private readonly lista: HTMLUListElement;
  private readonly estadoVacio: HTMLElement;
  private readonly contador: HTMLElement;
  private readonly contadorPendientes: HTMLElement;
  private readonly feedback: HTMLElement;
  private readonly barraProgreso: HTMLElement | null;
  private readonly inputBuscar: HTMLInputElement;
  private readonly selectEstado: HTMLSelectElement;
  private readonly selectFiltroP: HTMLSelectElement;
  private readonly selectOrden: HTMLSelectElement;
  private readonly modal: HTMLElement;
  private readonly modalConfirm: HTMLButtonElement;
  private readonly modalCancel: HTMLButtonElement;

  // id de la tarea en modo edicion
  private idEnEdicion: string | null = null;
  // id de la tarea a eliminar (confirmacion)
  private idParaEliminar: string | null = null;

  constructor(private readonly raiz: HTMLElement) {
    this.formulario = this.obtenerElemento("#task-form");
    this.entrada = this.obtenerElemento("#task-input");
    this.selectPrioridad = this.obtenerElemento("#task-priority");
    this.inputFecha = this.obtenerElemento("#task-date");
    this.btnSubmitLabel = this.obtenerElemento("#btn-submit-label");
    this.btnCancelar = this.obtenerElemento("#btn-cancel");
    this.lista = this.obtenerElemento("#task-list");
    this.estadoVacio = this.obtenerElemento("#empty-state");
    this.contador = this.obtenerElemento("#task-count");
    this.contadorPendientes = this.obtenerElemento("#pending-count");
    this.feedback = this.obtenerElemento("#feedback");
    this.barraProgreso = this.raiz.querySelector("#progress-fill");
    this.inputBuscar = this.obtenerElemento("#search-input");
    this.selectEstado = this.obtenerElemento("#filter-status");
    this.selectFiltroP = this.obtenerElemento("#filter-priority");
    this.selectOrden = this.obtenerElemento("#sort-select");
    this.modal = this.obtenerElemento("#confirm-modal");
    this.modalConfirm = this.obtenerElemento("#modal-confirm");
    this.modalCancel = this.obtenerElemento("#modal-cancel");
    this.iniciarReloj();
  }

  // Registra los eventos principales de la interfaz.
  conectar(acciones: AccionesTarea): void {
    // submit del formulario
    this.formulario.addEventListener("submit", (evento: SubmitEvent) => {
      evento.preventDefault();
      const titulo = this.entrada.value.trim();

      if (titulo.length === 0) {
        this.mostrarMensaje("Por favor escribe una descripción para la tarea.");
        this.entrada.focus();
        return;
      }

      const prioridad = this.selectPrioridad.value as Prioridad;
      const fechaLimite = this.inputFecha.value;

      if (this.idEnEdicion) {
        acciones.actualizar(this.idEnEdicion, titulo, prioridad, fechaLimite);
        this.salirModoEdicion();
      } else {
        acciones.agregar(titulo, prioridad, fechaLimite);
      }
    });

    // limpiar error al escribir
    this.entrada.addEventListener("input", () => {
      if (this.feedback.textContent) {
        this.limpiarMensaje();
      }
    });

    // cancelar edicion
    this.btnCancelar.addEventListener("click", () => {
      this.salirModoEdicion();
      this.limpiarMensaje();
    });

    // cambio de estado en checkboxes (delegacion)
    this.lista.addEventListener("change", (evento: Event) => {
      const objetivo = evento.target;
      if (
        objetivo instanceof HTMLInputElement &&
        objetivo.matches("[data-accion='completar']")
      ) {
        const elementoTarea = objetivo.closest<HTMLElement>("[data-id]");
        const id = elementoTarea?.dataset.id;
        if (id) acciones.cambiarEstado(id);
      }
    });

    // clicks en botones de la lista (delegacion)
    this.lista.addEventListener("click", (evento: MouseEvent) => {
      const objetivo = evento.target;
      if (!(objetivo instanceof Element)) return;

      // boton eliminar
      const btnEliminar = objetivo.closest<HTMLButtonElement>("[data-accion='eliminar']");
      if (btnEliminar) {
        const id = btnEliminar.closest<HTMLElement>("[data-id]")?.dataset.id;
        if (id) this.mostrarModal(id);
        return;
      }

      // boton editar
      const btnEditar = objetivo.closest<HTMLButtonElement>("[data-accion='editar']");
      if (btnEditar) {
        const id = btnEditar.closest<HTMLElement>("[data-id]")?.dataset.id;
        if (id) acciones.editar(id);
      }
    });

    // modal de confirmacion
    this.modalConfirm.addEventListener("click", () => {
      if (this.idParaEliminar) {
        acciones.eliminar(this.idParaEliminar);
        this.cerrarModal();
      }
    });

    this.modalCancel.addEventListener("click", () => this.cerrarModal());

    // cerrar modal si se hace clic fuera del cuadro
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.cerrarModal();
    });

    // busqueda en tiempo real
    this.inputBuscar.addEventListener("input", () => {
      acciones.buscar(this.inputBuscar.value.trim());
    });

    // filtros
    this.selectEstado.addEventListener("change", () => {
      acciones.filtrar(this.selectEstado.value, this.selectFiltroP.value);
    });

    this.selectFiltroP.addEventListener("change", () => {
      acciones.filtrar(this.selectEstado.value, this.selectFiltroP.value);
    });

    // ordenamiento
    this.selectOrden.addEventListener("change", () => {
      acciones.ordenar(this.selectOrden.value);
    });
  }

  // Carga los datos de una tarea en el formulario para editarla
  cargarParaEdicion(tarea: Tarea): void {
    this.idEnEdicion = tarea.id;
    this.entrada.value = tarea.titulo;
    this.selectPrioridad.value = tarea.prioridad;
    this.inputFecha.value = tarea.fechaLimite;
    this.btnSubmitLabel.textContent = "Actualizar";
    this.btnCancelar.hidden = false;
    this.entrada.focus();
    this.limpiarMensaje();
  }

  private salirModoEdicion(): void {
    this.idEnEdicion = null;
    this.formulario.reset();
    this.selectPrioridad.value = "media";
    this.btnSubmitLabel.textContent = "Agregar";
    this.btnCancelar.hidden = true;
  }

  private mostrarModal(id: string): void {
    this.idParaEliminar = id;
    this.modal.hidden = false;
    this.modalConfirm.focus();
  }

  private cerrarModal(): void {
    this.idParaEliminar = null;
    this.modal.hidden = true;
  }

  // Renderiza la lista completa y actualiza contadores y barra de progreso.
  renderizar(tareas: Tarea[]): void {
    this.lista.replaceChildren(
      ...tareas.map((tarea) => this.crearElementoTarea(tarea)),
    );

    const total = tareas.length;
    const completadas = tareas.filter((tarea) => tarea.completada).length;
    const pendientes = total - completadas;
    const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

    this.estadoVacio.hidden = total > 0;

    if (this.barraProgreso) {
      this.barraProgreso.style.width = `${porcentaje}%`;
      this.barraProgreso
        .closest("[role='progressbar']")
        ?.setAttribute("aria-valuenow", String(porcentaje));
    }

    if (total === 0) {
      this.contador.textContent = "0 tareas";
      this.contadorPendientes.textContent = "";
    } else if (completadas === total) {
      this.contador.textContent = `¡Todo listo! (${total}/${total})`;
      this.contadorPendientes.textContent = "";
    } else {
      this.contador.textContent = `${completadas} de ${total} completadas (${porcentaje}%)`;
      this.contadorPendientes.textContent =
        pendientes === 1 ? "1 tarea pendiente" : `${pendientes} tareas pendientes`;
    }
  }

  limpiarEntrada(): void {
    this.salirModoEdicion();
    this.entrada.focus();
  }

  mostrarMensaje(mensaje: string): void {
    this.feedback.textContent = mensaje;
  }

  limpiarMensaje(): void {
    this.feedback.textContent = "";
  }

  // Construye el nodo DOM de una tarea individual.
  private crearElementoTarea(tarea: Tarea): HTMLLIElement {
    const vencida = tarea.estaVencida();
    const elemento = document.createElement("li");

    let clases = "task";
    if (tarea.completada) clases += " task--completed";
    if (vencida) clases += " task--vencida";
    elemento.className = clases;
    elemento.dataset.id = tarea.id;

    // checkbox
    const casilla = document.createElement("input");
    casilla.type = "checkbox";
    casilla.className = "task__checkbox";
    casilla.checked = tarea.completada;
    casilla.dataset.accion = "completar";
    casilla.setAttribute("aria-label", `Marcar "${tarea.titulo}" como completada`);

    // contenedor del texto
    const info = document.createElement("div");
    info.className = "task__info";

    const titulo = document.createElement("span");
    titulo.className = "task__title";
    if (tarea.completada) titulo.classList.add("task__title--completed");
    titulo.textContent = tarea.titulo;

    const meta = document.createElement("div");
    meta.className = "task__meta";

    // badge de prioridad
    const badge = document.createElement("span");
    badge.className = `task__badge task__badge--${tarea.prioridad}`;
    badge.textContent =
      tarea.prioridad === "alta" ? "🔴 Alta" :
      tarea.prioridad === "media" ? "🟡 Media" : "🟢 Baja";

    meta.appendChild(badge);

    // fecha limite si existe
    if (tarea.fechaLimite) {
      const fecha = document.createElement("span");
      fecha.className = vencida ? "task__date task__date--vencida" : "task__date";
      // formatear la fecha para que sea mas legible
      const partes = tarea.fechaLimite.split("-");
      fecha.textContent = (vencida ? "⚠️ Vencida: " : "📅 ") + `${partes[2]}/${partes[1]}/${partes[0]}`;
      meta.appendChild(fecha);
    }

    info.append(titulo, meta);

    // botones de accion
    const acciones = document.createElement("div");
    acciones.className = "task__actions";

    // boton editar
    const btnEditar = document.createElement("button");
    btnEditar.className = "button button--icon button--edit";
    btnEditar.type = "button";
    btnEditar.dataset.accion = "editar";
    btnEditar.setAttribute("aria-label", `Editar tarea "${tarea.titulo}"`);
    btnEditar.title = "Editar tarea";
    btnEditar.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    `;

    // boton eliminar
    const btnEliminar = document.createElement("button");
    btnEliminar.className = "button button--icon button--delete";
    btnEliminar.type = "button";
    btnEliminar.dataset.accion = "eliminar";
    btnEliminar.setAttribute("aria-label", `Eliminar tarea "${tarea.titulo}"`);
    btnEliminar.title = "Eliminar tarea";
    btnEliminar.innerHTML = `
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 6h18"/>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        <line x1="10" y1="11" x2="10" y2="17"/>
        <line x1="14" y1="11" x2="14" y2="17"/>
      </svg>
    `;

    acciones.append(btnEditar, btnEliminar);
    elemento.append(casilla, info, acciones);
    return elemento;
  }

  private obtenerElemento<T extends HTMLElement>(selector: string): T {
    const elemento = this.raiz.querySelector<T>(selector);
    if (!elemento) {
      throw new Error(`No se encontró el elemento requerido "${selector}".`);
    }
    return elemento;
  }

  // Actualiza el reloj digital en tiempo real cada segundo.
  private iniciarReloj(): void {
    const reloj = this.raiz.querySelector("#system-clock");
    if (!reloj) return;

    const actualizar = () => {
      const ahora = new Date();
      reloj.textContent = ahora.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    };

    actualizar();
    setInterval(actualizar, 1000);
  }
}
