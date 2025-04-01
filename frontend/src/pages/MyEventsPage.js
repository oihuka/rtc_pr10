import EventList from '../components/Events/EventList.js';
import authService from '../utils/auth.js';
import Notification from '../components/UI/Notification.js';
import Button from '../components/UI/Button.js';

/**
 * Página que muestra los eventos del usuario (creados y a los que asiste)
 */
export default class MyEventsPage {
  /**
   * @param {string} mainContainerId - ID del contenedor principal
   */
  constructor(mainContainerId = 'main-container') {
    this.mainContainerId = mainContainerId;
    this.mainContainer = null;
    this.createdEventsList = null;
    this.attendingEventsList = null;
    this.createEventButton = null;
    this.activeTab = 'created'; // 'created' o 'attending'
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
      Notification.show('Debes iniciar sesión para ver tus eventos', 'warning');
      window.location.href = '/login.html?redirect=/my-events.html';
      return;
    }
    
    // Obtener tab activo de la URL si existe
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'attending') {
      this.activeTab = 'attending';
    }
    
    this.render();
    this.setupEventListeners();
    await this.setupComponents();
  }
  
  /**
   * Renderiza la estructura básica de la página
   */
  render() {
    this.mainContainer.innerHTML = `
      <div class="my-events-page">
        <div class="container">
          <div class="section-header">
            <h1>Mis Eventos</h1>
            <div id="create-event-button-container"></div>
          </div>
          
          <div class="tabs-container">
            <div class="tabs">
              <button id="created-tab" class="tab ${this.activeTab === 'created' ? 'active' : ''}">
                <i class="fas fa-calendar-plus"></i> Eventos creados
              </button>
              <button id="attending-tab" class="tab ${this.activeTab === 'attending' ? 'active' : ''}">
                <i class="fas fa-calendar-check"></i> Eventos a los que asisto
              </button>
            </div>
            
            <div class="tab-content">
              <div id="created-events-container" class="${this.activeTab === 'created' ? 'active' : ''}">
                <div id="created-events-list"></div>
              </div>
              
              <div id="attending-events-container" class="${this.activeTab === 'attending' ? 'active' : ''}">
                <div id="attending-events-list"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Crear botón de crear evento
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
  
  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    const createdTab = document.getElementById('created-tab');
    const attendingTab = document.getElementById('attending-tab');
    
    if (createdTab) {
      createdTab.addEventListener('click', () => this.switchTab('created'));
    }
    
    if (attendingTab) {
      attendingTab.addEventListener('click', () => this.switchTab('attending'));
    }
  }
  
  /**
   * Configura los componentes de la página
   */
  async setupComponents() {
    // Inicializar lista de eventos creados
    this.createdEventsList = new EventList(
      'created-events-list',
      { creator: 'me' },
      this.handleEventClick.bind(this)
    );
    
    // Inicializar lista de eventos a los que asiste
    this.attendingEventsList = new EventList(
      'attending-events-list',
      { attending: 'me' },
      this.handleEventClick.bind(this)
    );
    
    // Cargar eventos según la pestaña activa
    if (this.activeTab === 'created') {
      await this.createdEventsList.init();
    } else {
      await this.attendingEventsList.init();
    }
  }
  
  /**
   * Cambia entre pestañas
   * @param {string} tab - Pestaña a activar ('created' o 'attending')
   */
  async switchTab(tab) {
    if (tab === this.activeTab) return;
    
    this.activeTab = tab;
    
    // Actualizar clases de pestañas
    const createdTab = document.getElementById('created-tab');
    const attendingTab = document.getElementById('attending-tab');
    const createdContainer = document.getElementById('created-events-container');
    const attendingContainer = document.getElementById('attending-events-container');
    
    if (createdTab && attendingTab && createdContainer && attendingContainer) {
      if (tab === 'created') {
        createdTab.classList.add('active');
        attendingTab.classList.remove('active');
        createdContainer.classList.add('active');
        attendingContainer.classList.remove('active');
        
        // Cargar eventos creados si aún no se han cargado
        if (!this.createdEventsList.events.length) {
          await this.createdEventsList.init();
        }
      } else {
        createdTab.classList.remove('active');
        attendingTab.classList.add('active');
        createdContainer.classList.remove('active');
        attendingContainer.classList.add('active');
        
        // Cargar eventos a los que asiste si aún no se han cargado
        if (!this.attendingEventsList.events.length) {
          await this.attendingEventsList.init();
        }
      }
    }
    
    // Actualizar URL sin recargar la página
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
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
    window.location.href = '/create-event.html';
  }
}
