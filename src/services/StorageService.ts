import { Tarea } from "../models/Tarea";

const STORAGE_KEY = "proyecto-tareas";

// Estructura esperada de una tarea guardada en localStorage.
interface TareaStorage {
  id: string;
  titulo: string;
  creadaEn: number;
  completada: boolean;
}

export class StorageService {
  // Recupera las tareas almacenadas en el navegador.
  cargar(): Tarea[] {
    const contenido = localStorage.getItem(STORAGE_KEY);

    if (!contenido) {
      return [];
    }

    try {
      const datos: unknown = JSON.parse(contenido);

      if (!Array.isArray(datos)) {
        return [];
      }

      return datos
        .filter((item): item is TareaStorage => {
          return (
            typeof item === "object" &&
            item !== null &&
            typeof item.id === "string" &&
            typeof item.titulo === "string" &&
            typeof item.completada === "boolean"
          );
        })
        .map((item) => new Tarea(item.id, item.titulo, item.creadaEn ?? Date.now(), item.completada));
    } catch {
      throw new Error("No se pudieron leer las tareas guardadas.");
    }
  }

  // Guarda la lista actual de tareas serializada como JSON.
  guardar(tareas: Tarea[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
    } catch {
      throw new Error("Espacio insuficiente para guardar los cambios.");
    }
  }
}

