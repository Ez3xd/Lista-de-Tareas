import { Tarea } from "../models/Tarea";
import type { Prioridad } from "../models/Tarea";
import { StorageService } from "../services/StorageService";
import { TareaView } from "../views/TareaView";

// Controlador: coordina la vista con el almacenamiento y maneja la lógica de la aplicación.
export class TareaController {
  private tareas: Tarea[] = [];
  // criterios de busqueda y filtro actuales
  private terminoBusqueda: string = "";
  private filtroEstado: string = "todas";
  private filtroPrioridad: string = "todas";
  private criterioOrden: string = "recientes";

  constructor(
    private readonly vista: TareaView,
    private readonly almacenamiento: StorageService,
  ) {}

  // Inicializa la aplicación conectando los manejadores de eventos y cargando los datos iniciales.
  iniciar(): void {
    this.vista.conectar({
      agregar: (titulo, prioridad, fechaLimite) =>
        this.agregar(titulo, prioridad, fechaLimite),
      cambiarEstado: (id) => this.cambiarEstado(id),
      eliminar: (id) => this.eliminar(id),
      editar: (id) => this.handleEditar(id),
      actualizar: (id, titulo, prioridad, fechaLimite) =>
        this.handleActualizar(id, titulo, prioridad, fechaLimite),
      buscar: (termino) => this.handleBuscar(termino),
      filtrar: (estado, prioridad) => this.handleFiltrar(estado, prioridad),
      ordenar: (criterio) => this.handleOrdenar(criterio),
    });

    try {
      this.tareas = this.almacenamiento.cargar();
      this.renderizarFiltrado();
    } catch (error) {
      this.vista.mostrarMensaje(
        `No se pudieron cargar las tareas: ${this.obtenerMensajeError(error)}`,
      );
      this.renderizarFiltrado();
    }
  }

  // Agrega una nueva tarea a la lista.
  private agregar(titulo: string, prioridad: Prioridad, fechaLimite: string): void {
    // verificar si ya existe una tarea con el mismo titulo (sin importar mayusculas)
    const duplicado = this.tareas.some(
      (t) => t.titulo.toLowerCase() === titulo.toLowerCase(),
    );
    if (duplicado) {
      this.vista.mostrarMensaje("Ya existe una tarea con ese nombre.");
      return;
    }

    const tarea = new Tarea(crypto.randomUUID(), titulo, Date.now(), false, prioridad, fechaLimite);
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

  // Carga los datos de una tarea en el formulario para editarla
  private handleEditar(id: string): void {
    const tarea = this.tareas.find((t) => t.id === id);
    if (tarea) {
      this.vista.cargarParaEdicion(tarea);
    }
  }

  // Actualiza los datos de una tarea existente
  private handleActualizar(
    id: string,
    titulo: string,
    prioridad: Prioridad,
    fechaLimite: string,
  ): void {
    // no puede haber duplicados con otro id diferente
    const duplicado = this.tareas.some(
      (t) => t.id !== id && t.titulo.toLowerCase() === titulo.toLowerCase(),
    );
    if (duplicado) {
      this.vista.mostrarMensaje("Ya existe otra tarea con ese nombre.");
      return;
    }

    const tareas = this.tareas.map((t) => {
      if (t.id !== id) return t;
      return new Tarea(t.id, titulo, t.creadaEn, t.completada, prioridad, fechaLimite);
    });
    this.actualizarTareas(tareas);
  }

  // maneja la busqueda por titulo
  private handleBuscar(termino: string): void {
    this.terminoBusqueda = termino.toLowerCase();
    this.renderizarFiltrado();
  }

  // maneja los filtros por estado y prioridad
  private handleFiltrar(estado: string, prioridad: string): void {
    this.filtroEstado = estado;
    this.filtroPrioridad = prioridad;
    this.renderizarFiltrado();
  }

  // maneja el ordenamiento
  private handleOrdenar(criterio: string): void {
    this.criterioOrden = criterio;
    this.renderizarFiltrado();
  }

  // aplica busqueda, filtros y ordenamiento y renderiza
  private renderizarFiltrado(): void {
    let resultado = [...this.tareas];

    // busqueda por titulo
    if (this.terminoBusqueda) {
      resultado = resultado.filter((t) =>
        t.titulo.toLowerCase().includes(this.terminoBusqueda),
      );
    }

    // filtro por estado
    if (this.filtroEstado === "pendientes") {
      resultado = resultado.filter((t) => !t.completada);
    } else if (this.filtroEstado === "completadas") {
      resultado = resultado.filter((t) => t.completada);
    } else if (this.filtroEstado === "vencidas") {
      resultado = resultado.filter((t) => t.estaVencida());
    }

    // filtro por prioridad
    if (this.filtroPrioridad !== "todas") {
      resultado = resultado.filter((t) => t.prioridad === this.filtroPrioridad);
    }

    // ordenamiento
    if (this.criterioOrden === "fecha") {
      resultado.sort((a, b) => {
        // tareas sin fecha van al final
        if (!a.fechaLimite && !b.fechaLimite) return 0;
        if (!a.fechaLimite) return 1;
        if (!b.fechaLimite) return -1;
        return a.fechaLimite.localeCompare(b.fechaLimite);
      });
    } else if (this.criterioOrden === "prioridad") {
      const peso: Record<string, number> = { alta: 0, media: 1, baja: 2 };
      resultado.sort((a, b) => (peso[a.prioridad] ?? 1) - (peso[b.prioridad] ?? 1));
    } else {
      // mas recientes primero (por defecto)
      resultado.sort((a, b) => b.creadaEn - a.creadaEn);
    }

    this.vista.renderizar(resultado);
  }

  // Guarda en almacenamiento y actualiza la interfaz.
  private actualizarTareas(tareas: Tarea[]): boolean {
    try {
      this.almacenamiento.guardar(tareas);
      this.tareas = tareas;
      this.vista.limpiarMensaje();
      this.renderizarFiltrado();
      return true;
    } catch (error) {
      this.vista.mostrarMensaje(
        `No se pudo guardar el cambio: ${this.obtenerMensajeError(error)}`,
      );
      this.renderizarFiltrado();
      return false;
    }
  }

  private obtenerMensajeError(error: unknown): string {
    return error instanceof Error ? error.message : "Error desconocido.";
  }
}
