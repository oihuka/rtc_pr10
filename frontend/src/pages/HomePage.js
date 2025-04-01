import EventList from '../components/Events/EventList.js';
import EventFilters from '../components/Events/EventFilters.js';
import authService from '../utils/auth.js';
import Notification from '../components/UI/Notification.js';
import Button from '../components/UI/Button.js';

/**
 * Página principal que muestra la lista de eventos
 */
export default class HomePage {
  /**
   * @param {string} mainContainerId - ID del contenedor principal
   */
  constructor(mainContainerId = 'main-container') {
    this.mainContainerId = mainContainerId;
    this.mainContainer = null;
    this.eventList = null;
    this.eventFilters = null;
    this.createEventButton = null;
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
    
    this.render();
    await this.setupComponents();
  }
  
  /**
   * Renderiza la estructura básica de la página
   */
  render() {
    this.mainContainer.innerHTML = `
      <div class="home-page">
        <section class="hero-section">
          <div class="hero-content container">
            <h1>Descubre eventos increíbles</h1>
            <p>Encuentra y participa en eventos de tu interés en tu ciudad</p>
            <div id="create-event-button-container" class="hero-button-container"></div>
          </div>
        </section>
        
        <section class="events-section">
          <div class="container">
            <div id="filters-container"></div>
            
            <div id="events-container"></div>
            
            <div class="load-more-container" id="load-more-container">
              <button id="load-more-button" class="btn btn-outline">
                <i class="fas fa-sync"></i> Cargar más eventos
              </button>
            </div>
          </div>
        </section>
        
        <section class="features-section">
          <div class="container">
            <div class="section-header">
              <h2>¿Por qué usar nuestra plataforma?</h2>
              <p>Descubre las ventajas de utilizar nuestra plataforma para gestionar tus eventos</p>
            </div>
            
            <div class="features-grid">
              <div class="feature-card">
                <div class="feature-icon">
                  <i class="fas fa-calendar-alt"></i>
                </div>
                <h3>Encuentra eventos</h3>
                <p>Descubre eventos interesantes cerca de ti y filtra por categorías que te interesen.</p>
              </div>
              
              <div class="feature-card">
                <div class="feature-icon">
                  <i class="fas fa-users"></i>
                </div>
                <h3>Conecta con personas</h3>
                <p>Conoce a personas con intereses similares y expande tu red de contactos.</p>
              </div>
              
              <div class="feature-card">
                <div class="feature-icon">
                  <i class="fas fa-star"></i>
                </div>
                <h3>Crea tus propios eventos</h3>
                <p>Organiza tus propios eventos y gestiona fácilmente la lista de asistentes.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
    
    // Crear botón de crear evento si el usuario está autenticado
    if (authService.isAuthenticated()) {
      this.createEventButton = new Button(
        'Crear Evento',
        'primary',
        this.handleCreateEvent.bind(this),
        false,
        'fas fa-plus'
      );
      
      const buttonContainer = document.getElementById('create-event-button-container');
      if (buttonContainer) {
        buttonContainer.appendChild(this.createEventButton.render());
      }
    }
  }
  
  /**
   * Configura los componentes de la página
   */
  async setupComponents() {
    // Inicializar filtros
    this.eventFilters = new EventFilters(
      'filters-container',
      {},
      this.handleFilterChange.bind(this)
    );
    this.eventFilters.init();
    
    // Inicializar lista de eventos
    this.eventList = new EventList(
      'events-container',
      {},
      this.handleEventClick.bind(this)
    );
    await this.eventList.init();
  }
  
  /**
   * Maneja el cambio de filtros
   * @param {object} filters - Nuevos filtros
   */
  handleFilterChange(filters) {
    if (this.eventList) {
      this.eventList.updateFilters(filters);
    }
  }
  
  /**
   * Maneja el clic en un evento
   * @param {string} eventId - ID del evento
   */
  handleEventClick(eventId) {
    window.location.href = `/event.html?id=${eventId}`;
  }
  
  /**
   * Maneja la creación de un evento
   */
  handleCreateEvent() {
    if (!authService.isAuthenticated()) {
      Notification.show('Debes iniciar sesión para crear un evento', 'warning');
      window.location.href = '/login.html';
      return;
    }
    
    window.location.href = '/create-event.html';
  }
}
