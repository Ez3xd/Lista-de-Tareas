// Modelo que representa una tarea individual en la aplicación.
// Parcial 2 - se agregan prioridad y fecha limite

export type Prioridad = "alta" | "media" | "baja";

export class Tarea {
  constructor(
    public readonly id: string,
    public readonly titulo: string,
    public readonly creadaEn: number = Date.now(),
    public readonly completada: boolean = false,
    public readonly prioridad: Prioridad = "media",
    public readonly fechaLimite: string = "", // formato YYYY-MM-DD
  ) {}

  // Retorna una nueva instancia con el estado completado alternado (inmutabilidad).
  cambiarEstado(): Tarea {
    return new Tarea(
      this.id,
      this.titulo,
      this.creadaEn,
      !this.completada,
      this.prioridad,
      this.fechaLimite,
    );
  }

  // Verifica si la tarea ya paso su fecha limite
  estaVencida(): boolean {
    if (!this.fechaLimite || this.completada) return false;
    const hoy = new Date().toISOString().split("T")[0];
    return this.fechaLimite < hoy;
  }
}
