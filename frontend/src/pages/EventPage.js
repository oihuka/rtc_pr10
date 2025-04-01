import EventDetails from '../components/Events/EventDetails.js';
import Loader from '../components/UI/Loader.js';
import Button from '../components/UI/Button.js';
import Notification from '../components/UI/Notification.js';

/**
 * Página de detalles de un evento
 */
export default class EventPage {
  /**
   * @param {string} mainContainerId - ID del contenedor principal
   */
  constructor(mainContainerId = 'main-container') {
    this.mainContainerId = mainContainerId;
    this.mainContainer = null;
    this.eventId = null;
    this.eventDetails = null;
    this.loader = new Loader('medium', 'Cargando evento...');
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
    
    // Obtener ID del evento de la URL
    this.eventId = this.getEventIdFromUrl();
    
    if (!this.eventId) {
      this.renderError('ID de evento no válido');
      return;
    }
    
    this.render();
    await this.setupComponents();
  }
  
  /**
   * Renderiza la estructura básica de la página
   */
  render() {
    this.mainContainer.innerHTML = `
      <div class="event-page">
        <div class="container">
          <div class="back-button-container">
            <a href="/" class="btn btn-outline btn-sm">
              <i class="fas fa-arrow-left"></i> Volver a eventos
            </a>
          </div>
          
          <div id="event-details-container"></div>
        </div>
      </div>
    `;
  }
  
  /**
   * Configura los componentes de la página
   */
  async setupComponents() {
    // Inicializar detalles del evento
    this.eventDetails = new EventDetails('event-details-container', this.eventId);
    await this.eventDetails.init();
  }
  
  /**
   * Obtiene el ID del evento de la URL
   * @returns {string|null} - ID del evento o null si no es válido
   */
  getEventIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }
  
  /**
   * Renderiza un mensaje de error
   * @param {string} message - Mensaje de error
   */
  renderError(message) {
    // Mostrar notificación de error
    Notification.show(message, 'error', 0);
    
    this.mainContainer.innerHTML = `
      <div class="centered-message">
        <h2>Error</h2>
        <p>${message}</p>
        <a href="/" class="btn btn-primary">Volver al inicio</a>
      </div>
    `;
  }
}
