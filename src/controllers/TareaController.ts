import { Tarea } from "../models/Tarea";
import { StorageService } from "../services/StorageService";
import { TareaView } from "../views/TareaView";

// Controlador: coordina la vista con el almacenamiento y maneja la lógica de la aplicación.
export class TareaController {
  private tareas: Tarea[] = [];

  constructor(
    private readonly vista: TareaView,
    private readonly almacenamiento: StorageService,
  ) {}

  // Inicializa la aplicación conectando los manejadores de eventos y cargando los datos iniciales.
  iniciar(): void {
    this.vista.conectar({
      agregar: (titulo) => this.agregar(titulo),
      cambiarEstado: (id) => this.cambiarEstado(id),
      eliminar: (id) => this.eliminar(id),
    });

    try {
      this.tareas = this.almacenamiento.cargar();
      this.vista.renderizar(this.tareas);
    } catch (error) {
      this.vista.mostrarMensaje(
        `No se pudieron cargar las tareas: ${this.obtenerMensajeError(error)}`,
      );
      this.vista.renderizar(this.tareas);
    }
  }

  // Agrega una nueva tarea a la lista.
  private agregar(titulo: string): void {
    const tarea = new Tarea(crypto.randomUUID(), titulo);
    if (this.actualizarTareas([...this.tareas, tarea])) {
      this.vista.limpiarEntrada();
    }
  }

  // Cambia el estado (pendiente/completada) de una tarea según su id.
  private cambiarEstado(id: string): void {
    const tareas = this.tareas.map((tarea) =>
      tarea.id === id ? tarea.cambiarEstado() : tarea,
    );
    this.actualizarTareas(tareas);
  }

  // Elimina una tarea de la lista.
  private eliminar(id: string): void {
    this.actualizarTareas(this.tareas.filter((tarea) => tarea.id !== id));
  }

  // Guarda en almacenamiento y actualiza la interfaz.
  private actualizarTareas(tareas: Tarea[]): boolean {
    try {
      this.almacenamiento.guardar(tareas);
      this.tareas = tareas;
      this.vista.limpiarMensaje();
      this.vista.renderizar(this.tareas);
      return true;
    } catch (error) {
      this.vista.mostrarMensaje(
        `No se pudo guardar el cambio: ${this.obtenerMensajeError(error)}`,
      );
      this.vista.renderizar(this.tareas);
      return false;
    }
  }

  private obtenerMensajeError(error: unknown): string {
    return error instanceof Error ? error.message : "Error desconocido.";
  }
}

