import apiService from '../../api/apiService.js';
import authService from '../../utils/auth.js';
import Button from '../UI/Button.js';
import Modal from '../UI/Modal.js';
import Loader from '../UI/Loader.js';
import Notification from '../UI/Notification.js';
import { formatDate } from '../../utils/helpers.js';

/**
 * Componente para mostrar los detalles de un evento
 */
export default class EventDetails {
  /**
   * @param {string} containerId - ID del contenedor donde se renderizarán los detalles
   * @param {string} eventId - ID del evento
   */
  constructor(containerId, eventId) {
    this.containerId = containerId;
    this.container = null;
    this.eventId = eventId;
    this.event = null;
    this.loader = new Loader('medium', 'Cargando detalles del evento...');
    this.attendButton = null;
    this.deleteButton = null;
    this.attendees = [];
    this.isAttending = false;
    this.isCreator = false;
  }
  
  /**
   * Inicializa el componente
   */
  async init() {
    this.container = document.getElementById(this.containerId);
    
    if (!this.container) {
      console.error(`No se encontró el contenedor con ID: ${this.containerId}`);
      return;
    }
    
    // Mostrar loader
    this.loader.show(this.container);
    
    // Cargar datos del evento
    await this.loadEventDetails();
  }
  
  /**
   * Carga los detalles del evento desde la API
   */
  async loadEventDetails() {
    try {
      const response = await apiService.get(`/events/${this.eventId}`);
      
      if (response.success) {
        this.event = response.data;
        
        // Verificar si el usuario es el creador
        const currentUser = authService.getCurrentUser();
        this.isCreator = currentUser && this.event.creator._id === currentUser._id;
        
        // Cargar asistentes
        await this.loadAttendees();
        
        // Renderizar detalles
        this.render();
      } else {
        this.container.innerHTML = `
          <div class="error-message">
            <h2>Error al cargar el evento</h2>
            <p>${response.message || 'No se pudo cargar la información del evento'}</p>
            <a href="/" class="btn btn-primary">Volver al inicio</a>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error al cargar detalles del evento:', error);
      
      this.container.innerHTML = `
        <div class="error-message">
          <h2>Error al cargar el evento</h2>
          <p>${error.message || 'No se pudo cargar la información del evento'}</p>
          <a href="/" class="btn btn-primary">Volver al inicio</a>
        </div>
      `;
    } finally {
      this.loader.hide();
    }
  }
  
  /**
   * Carga los asistentes del evento
   */
  async loadAttendees() {
    try {
      const response = await apiService.get(`/events/${this.eventId}/attendees`, authService.isAuthenticated());
      
      if (response.success) {
        this.attendees = response.data.attendees || [];
        
        // Verificar si el usuario actual está asistiendo
        const currentUser = authService.getCurrentUser();
        
        if (currentUser) {
          this.isAttending = this.attendees.some(
            attendee => attendee.user._id === currentUser._id
          );
        }
      }
    } catch (error) {
      console.error('Error al cargar asistentes:', error);
    }
  }
  
  /**
   * Renderiza los detalles del evento
   */
  render() {
    if (!this.event) {
      this.container.innerHTML = `
        <div class="error-message">
          <p>No se pudo cargar la información del evento.</p>
        </div>
      `;
      return;
    }
    
    // Formatear fecha
    const formattedDate = formatDate(this.event.date);
    
    this.container.innerHTML = `
      <div class="event-details">
        <div class="event-details-header">
          <div class="event-details-image">
            <img src="${this.event.image}" alt="${this.event.title}">
            <div class="event-details-category">${this.event.category}</div>
          </div>
          <div class="event-details-info">
            <h1 class="event-details-title">${this.event.title}</h1>
            <div class="event-details-meta">
              <div class="event-details-meta-item">
                <i class="fas fa-calendar-alt"></i>
                <span>${formattedDate}</span>
              </div>
              <div class="event-details-meta-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>${this.event.location}</span>
              </div>
              <div class="event-details-meta-item">
                <i class="fas fa-users"></i>
                <span>${Array.isArray(this.event.attendees) ? this.event.attendees.length : 0} asistentes</span>
              </div>
            </div>
            <div class="event-details-creator">
              <div class="event-details-creator-avatar">
                <img src="${this.event.creator.avatar}" alt="${this.event.creator.name}">
              </div>
              <div class="event-details-creator-info">
                <p>Organizado por</p>
                <h3>${this.event.creator.name}</h3>
              </div>
            </div>
            <div class="event-details-actions" id="event-actions"></div>
          </div>
        </div>
        
        <div class="event-details-content">
          <div class="event-details-description">
            <h2>Descripción</h2>
            <p>${this.event.description}</p>
          </div>
        </div>
      </div>
    `;
    
    // Renderizar botones de acción
    this.renderActionButtons();
  }
  
  /**
   * Renderiza la lista de asistentes
   * @returns {string} - HTML de la lista de asistentes
   */
  renderAttendeesList() {
    if (!this.event.attendees || this.event.attendees.length === 0) {
      return `<p class="no-attendees-message">Aún no hay asistentes para este evento. ¡Sé el primero en asistir!</p>`;
    }
    
    return this.event.attendees.map(attendee => `
      <div class="attendee-item">
        <div class="attendee-avatar">
          <img src="${attendee.avatar || attendee.user?.avatar || '/assets/default-avatar.png'}" 
               alt="${attendee.name || attendee.user?.name || 'Asistente'}" loading="lazy">
        </div>
        <span class="attendee-name" 
              title="${attendee.name || attendee.user?.name || 'Asistente'}">
              ${attendee.name || attendee.user?.name || 'Asistente'}
        </span>
      </div>
    `).join('');
  }
  
  /**
   * Renderiza los botones de acción según el estado del usuario
   */
  renderActionButtons() {
    const actionsContainer = document.getElementById('event-actions');
    
    if (!actionsContainer) return;
    
    // Limpiar contenedor
    actionsContainer.innerHTML = '';
    
    // Verificar si el usuario está autenticado
    if (!authService.isAuthenticated()) {
      const loginButton = new Button(
        actionsContainer,
        'Iniciar sesión para asistir',
        'btn-primary',
        () => window.location.href = '/login.html'
      );
      
      loginButton.render();
      return;
    }
    
    // Verificar si el usuario es el creador del evento
    if (this.isCreator) {
      // Botón de editar
      const editButton = new Button(
        actionsContainer,
        'Editar evento',
        'btn-outline',
        () => window.location.href = `/edit-event.html?id=${this.eventId}`,
        false,
        'fas fa-edit'
      );
      
      // Botón de eliminar
      const deleteButton = new Button(
        actionsContainer,
        'Eliminar evento',
        'btn-danger',
        this.handleDeleteEvent.bind(this),
        false,
        'fas fa-trash-alt'
      );
      
      editButton.render();
      deleteButton.render();
    } else {
      // Botón de asistir/cancelar asistencia
      const attendButton = new Button(
        actionsContainer,
        this.isAttending ? 'Cancelar asistencia' : 'Asistir al evento',
        this.isAttending ? 'btn-danger' : 'btn-primary',
        this.handleAttendEvent.bind(this),
        false,
        this.isAttending ? 'fas fa-times' : 'fas fa-check'
      );
      
      attendButton.render();
      this.attendButton = attendButton;
    }
  }
  
  /**
   * Maneja la confirmación/cancelación de asistencia
   */
  async handleAttendEvent() {
    try {
      // Deshabilitar botón mientras se procesa
      this.attendButton.update(true, 'Procesando...');
      
      const endpoint = `/events/${this.eventId}/${this.isAttending ? 'unattend' : 'attend'}`;
      const response = await apiService.post(endpoint, {}, true);
      
      if (response.success) {
        // Actualizar estado
        this.isAttending = !this.isAttending;
        
        // Actualizar botón
        this.attendButton.update(
          false,
          this.isAttending ? 'Cancelar asistencia' : 'Asistir al evento'
        );
        
        // Cambiar tipo y icono del botón
        if (this.attendButton.element) {
          this.attendButton.element.className = `btn btn-${this.isAttending ? 'danger' : 'primary'}`;
          
          const iconElement = this.attendButton.element.querySelector('i');
          if (iconElement) {
            iconElement.className = this.isAttending ? 'fas fa-times' : 'fas fa-check';
          }
        }
        
        // Recargar asistentes
        await this.loadAttendees();
        
        // Actualizar lista de asistentes
        const attendeesList = document.getElementById('attendees-list');
        if (attendeesList) {
          attendeesList.innerHTML = this.renderAttendeesList();
        }
        
        // Mostrar notificación
        Notification.show(
          this.isAttending ? '¡Has confirmado tu asistencia!' : 'Has cancelado tu asistencia',
          this.isAttending ? 'success' : 'info'
        );
      }
    } catch (error) {
      console.error('Error al gestionar asistencia:', error);
      this.attendButton.update(false, this.isAttending ? 'Cancelar asistencia' : 'Asistir al evento');
      Notification.show('Error al procesar tu solicitud', 'error');
    }
  }
  
  /**
   * Maneja la eliminación del evento
   */
  handleDeleteEvent() {
    // Mostrar modal de confirmación
    const modal = new Modal(
      'Eliminar evento',
      '¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          type: 'secondary',
          onClick: () => {}
        },
        {
          text: 'Eliminar',
          type: 'danger',
          onClick: this.confirmDeleteEvent.bind(this)
        }
      ]
    );
    
    modal.open();
  }
  
  /**
   * Confirma la eliminación del evento
   */
  async confirmDeleteEvent() {
    try {
      // Deshabilitar botón mientras se procesa
      if (this.deleteButton) {
        this.deleteButton.update(true, 'Eliminando...');
      }
      
      const response = await apiService.delete(`/events/${this.eventId}`, true);
      
      if (response.success) {
        Notification.show('Evento eliminado correctamente', 'success');
        
        // Redirigir a la página principal
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      
      if (this.deleteButton) {
        this.deleteButton.update(false, 'Eliminar evento');
      }
      
      Notification.show('Error al eliminar el evento', 'error');
    }
  }
}