import { TareaController } from "./controllers/TareaController";
import { StorageService } from "./services/StorageService";
import { TareaView } from "./views/TareaView";
import "./style.css";

// Punto de entrada de la aplicación: inicializa los módulos según la arquitectura MVC.
const app = document.querySelector<HTMLElement>("#app");

if (!app) {
  throw new Error('No se encontró el elemento raíz "#app".');
}

const view = new TareaView(app);
const storage = new StorageService();
const controller = new TareaController(view, storage);

controller.iniciar();

