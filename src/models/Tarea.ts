// Modelo que representa una tarea individual en la aplicación.
export class Tarea {
  constructor(
    public readonly id: string,
    public readonly titulo: string,
    public readonly creadaEn: number = Date.now(),
    public readonly completada: boolean = false,
  ) {}

  // Retorna una nueva instancia con el estado completado alternado (inmutabilidad).
  cambiarEstado(): Tarea {
    return new Tarea(this.id, this.titulo, this.creadaEn, !this.completada);
  }
}

