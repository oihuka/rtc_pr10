import EventForm from '../components/Events/EventForm.js';
import authService from '../utils/auth.js';
import Notification from '../components/UI/Notification.js';

/**
 * Página para crear un nuevo evento
 */
export default class CreateEventPage {
  /**
   * @param {string} mainContainerId - ID del contenedor principal
   */
  constructor(mainContainerId = 'main-container') {
    this.mainContainerId = mainContainerId;
    this.mainContainer = null;
    this.eventForm = null;
  }
  
  /**
   * Inicializa la página
   */
  async init() {
    this.mainContainer = document.getElementById(this.mainContainerId);
    
    if (!this.mainContainer) {
      console.error(`No se encontró el contenedor con ID: ${this.mainContainerId}`);
      return;
    }
    
    // Verificar si el usuario está autenticado
    if (!authService.isAuthenticated()) {
      Notification.show('Debes iniciar sesión para crear un evento', 'warning');
      window.location.href = '/login.html';
      return;
    }
    
    this.render();
    this.setupComponents();
  }
  
  /**
   * Renderiza la estructura básica de la página
   */
  render() {
    this.mainContainer.innerHTML = `
      <div class="create-event-page">
        <div class="container">
          <div class="back-button-container">
            <a href="/" class="btn btn-outline btn-sm">
              <i class="fas fa-arrow-left"></i> Volver a eventos
            </a>
          </div>
          
          <div class="section-header">
            <h1>Crear Nuevo Evento</h1>
            <p>Completa el formulario para crear tu evento</p>
          </div>
          
          <div id="event-form-container"></div>
        </div>
      </div>
    `;
  }
  
  /**
   * Configura los componentes de la página
   */
  setupComponents() {
    // Inicializar formulario de evento
    this.eventForm = new EventForm(
      'event-form-container',
      this.handleEventCreated.bind(this)
    );
    this.eventForm.init();
  }
  
  /**
   * Maneja la creación exitosa de un evento
   * @param {object} eventData - Datos del evento creado
   */
  handleEventCreated(eventData) {
    // Redirigir a la página del evento
    window.location.href = `/event.html?id=${eventData._id}`;
  }
}
