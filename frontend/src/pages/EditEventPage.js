import EventForm from '../components/Events/EventForm.js';
import authService from '../utils/auth.js';
import apiService from '../api/apiService.js';
import Notification from '../components/UI/Notification.js';
import Loader from '../components/UI/Loader.js';

/**
 * Página para editar un evento existente
 */
export default class EditEventPage {
  /**
   * @param {string} mainContainerId - ID del contenedor principal
   */
  constructor(mainContainerId = 'main-container') {
    this.mainContainerId = mainContainerId;
    this.mainContainer = null;
    this.eventForm = null;
    this.eventId = null;
    this.eventData = null;
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
    
    // Verificar si el usuario está autenticado
    if (!authService.isAuthenticated()) {
      Notification.show('Debes iniciar sesión para editar un evento', 'warning');
      window.location.href = '/login.html';
      return;
    }
    
    // Obtener ID del evento de la URL
    this.eventId = this.getEventIdFromUrl();
    
    if (!this.eventId) {
      this.renderError('ID de evento no válido');
      return;
    }
    
    this.render();
    
    // Mostrar loader mientras se carga el evento
    this.loader.show(document.getElementById('event-form-container'));
    
    // Cargar datos del evento
    try {
      await this.loadEventData();
      this.setupComponents();
    } catch (error) {
      console.error('Error al cargar el evento:', error);
      this.renderError('No se pudo cargar el evento');
    } finally {
      this.loader.hide();
    }
  }
  
  /**
   * Renderiza la estructura básica de la página
   */
  render() {
    this.mainContainer.innerHTML = `
      <div class="edit-event-page">
        <div class="container">
          <div class="back-button-container">
            <a href="/" class="btn btn-outline btn-sm">
              <i class="fas fa-arrow-left"></i> Volver a eventos
            </a>
          </div>
          
          <div class="section-header">
            <h1>Editar Evento</h1>
            <p>Actualiza la información de tu evento</p>
          </div>
          
          <div id="event-form-container"></div>
        </div>
      </div>
    `;
  }
  
  /**
   * Carga los datos del evento desde la API
   */
  async loadEventData() {
    try {
      const response = await apiService.get(`/events/${this.eventId}`, true);
      
      if (response.success) {
        this.eventData = response.data;
        
        // Verificar si el usuario es el creador del evento
        const currentUser = authService.getCurrentUser();
        
        if (!currentUser || this.eventData.creator._id !== currentUser._id) {
          Notification.show('No tienes permiso para editar este evento', 'error');
          window.location.href = `/event.html?id=${this.eventId}`;
          return;
        }
      } else {
        throw new Error(response.message || 'No se pudo cargar el evento');
      }
    } catch (error) {
      console.error('Error al cargar evento:', error);
      throw error;
    }
  }
  
  /**
   * Configura los componentes de la página
   */
  setupComponents() {
    // Inicializar formulario de evento con los datos cargados
    this.eventForm = new EventForm(
      'event-form-container',
      this.handleEventUpdated.bind(this),
      this.eventData
    );
    this.eventForm.init();
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
   * Maneja la actualización exitosa de un evento
   * @param {object} eventData - Datos del evento actualizado
   */
  handleEventUpdated(eventData) {
    // Redirigir a la página del evento
    window.location.href = `/event.html?id=${eventData._id}`;
  }
  
  /**
   * Renderiza un mensaje de error
   * @param {string} message - Mensaje de error
   */
  renderError(message) {
    this.mainContainer.innerHTML = `
      <div class="centered-message">
        <h2>Error</h2>
        <p>${message}</p>
        <a href="/events.html" class="btn btn-primary">Volver a eventos</a>
      </div>
    `;
  }
}
