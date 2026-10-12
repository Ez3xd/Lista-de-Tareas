import { Tarea } from "../models/Tarea";

type AccionesTarea = {
  agregar: (titulo: string) => void;
  cambiarEstado: (id: string) => void;
  eliminar: (id: string) => void;
};

// Vista: administra los elementos del DOM y delega los eventos del usuario (POE).
export class TareaView {
  private readonly formulario: HTMLFormElement;
  private readonly entrada: HTMLInputElement;
  private readonly lista: HTMLUListElement;
  private readonly estadoVacio: HTMLElement;
  private readonly contador: HTMLElement;
  private readonly feedback: HTMLElement;
  private readonly barraProgreso: HTMLElement | null;

  constructor(private readonly raiz: HTMLElement) {
    this.formulario = this.obtenerElemento("#task-form");
    this.entrada = this.obtenerElemento("#task-input");
    this.lista = this.obtenerElemento("#task-list");
    this.estadoVacio = this.obtenerElemento("#empty-state");
    this.contador = this.obtenerElemento("#task-count");
    this.feedback = this.obtenerElemento("#feedback");
    this.barraProgreso = this.raiz.querySelector("#progress-fill");
    this.iniciarReloj();
  }

  // Registra los eventos principales de la interfaz (submit, change, click, input).
  conectar(acciones: AccionesTarea): void {
    // Evento al enviar formulario
    this.formulario.addEventListener("submit", (evento: SubmitEvent) => {
      evento.preventDefault();
      const titulo = this.entrada.value.trim();

      if (titulo.length === 0) {
        this.mostrarMensaje("Por favor escribe una descripción para la tarea.");
        this.entrada.focus();
        return;
      }

      acciones.agregar(titulo);
    });

    // Limpiar mensaje de error al comenzar a escribir
    this.entrada.addEventListener("input", () => {
      if (this.feedback.textContent) {
        this.limpiarMensaje();
      }
    });

    // Delegación de eventos: cambio de estado en checkboxes
    this.lista.addEventListener("change", (evento: Event) => {
      const objetivo = evento.target;

      if (
        objetivo instanceof HTMLInputElement &&
        objetivo.matches("[data-accion='completar']")
      ) {
        const elementoTarea = objetivo.closest<HTMLElement>("[data-id]");
        const id = elementoTarea?.dataset.id;

        if (id) {
          acciones.cambiarEstado(id);
        }
      }
    });

    // Delegación de eventos: clic en botón de eliminar
    this.lista.addEventListener("click", (evento: MouseEvent) => {
      const objetivo = evento.target;

      if (
        objetivo instanceof Element &&
        objetivo.closest<HTMLButtonElement>("[data-accion='eliminar']")
      ) {
        const boton = objetivo.closest<HTMLButtonElement>(
          "[data-accion='eliminar']",
        );
        const id = boton?.closest<HTMLElement>("[data-id]")?.dataset.id;

        if (id) {
          acciones.eliminar(id);
        }
      }
    });
  }

  // Renderiza la lista completa y actualiza contadores y barra de progreso.
  renderizar(tareas: Tarea[]): void {
    this.lista.replaceChildren(
      ...tareas.map((tarea) => this.crearElementoTarea(tarea)),
    );

    const total = tareas.length;
    const completadas = tareas.filter((tarea) => tarea.completada).length;
    const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

    this.estadoVacio.hidden = total > 0;

    if (this.barraProgreso) {
      this.barraProgreso.style.width = `${porcentaje}%`;
    }

    if (total === 0) {
      this.contador.textContent = "0 tareas";
    } else if (completadas === total) {
      this.contador.textContent = `¡Todo listo! (${total}/${total})`;
    } else {
      this.contador.textContent = `${completadas} de ${total} completadas (${porcentaje}%)`;
    }
  }

  limpiarEntrada(): void {
    this.entrada.value = "";
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
    const elemento = document.createElement("li");
    elemento.className = tarea.completada ? "task task--completed" : "task";
    elemento.dataset.id = tarea.id;

    const casilla = document.createElement("input");
    casilla.type = "checkbox";
    casilla.className = "task__checkbox";
    casilla.checked = tarea.completada;
    casilla.dataset.accion = "completar";
    casilla.setAttribute("aria-label", `Marcar "${tarea.titulo}" como completada`);

    const titulo = document.createElement("span");
    titulo.className = "task__title";
    titulo.textContent = tarea.titulo;

    if (tarea.completada) {
      titulo.classList.add("task__title--completed");
    }

    const eliminar = document.createElement("button");
    eliminar.className = "button button--icon button--delete";
    eliminar.type = "button";
    eliminar.dataset.accion = "eliminar";
    eliminar.setAttribute("aria-label", `Eliminar tarea "${tarea.titulo}"`);
    eliminar.title = "Eliminar tarea";
    eliminar.innerHTML = `
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 6h18"/>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        <line x1="10" y1="11" x2="10" y2="17"/>
        <line x1="14" y1="11" x2="14" y2="17"/>
      </svg>
    `;

    elemento.append(casilla, titulo, eliminar);
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


