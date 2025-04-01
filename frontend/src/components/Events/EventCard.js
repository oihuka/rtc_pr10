import Button from '../UI/Button.js';
import authService from '../../utils/auth.js';
import apiService from '../../api/apiService.js';
import { formatDate, truncateText } from '../../utils/helpers.js';
import Notification from '../UI/Notification.js';

/**
 * Componente para mostrar un evento en forma de tarjeta
 */
export default class EventCard {
  /**
   * @param {object} eventData - Datos del evento
   * @param {function} onAttend - Función a ejecutar al confirmar asistencia
   * @param {function} onViewDetails - Función a ejecutar al ver detalles
   */
  constructor(eventData, onAttend = null, onViewDetails = null) {
    this.event = eventData;
    this.onAttend = onAttend;
    this.onViewDetails = onViewDetails;
    this.element = null;
    this.attendButton = null;
  }
  
  /**
   * Maneja la confirmación de asistencia
   */
  async handleAttend(e) {
    e.preventDefault();
    
    try {
      if (!authService.isAuthenticated()) {
        Notification.show('Debes iniciar sesión para asistir a este evento', 'warning');
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 2000);
        return;
      }
      
      // Deshabilitar botón mientras se procesa
      this.attendButton.update(true, 'Procesando...');
      
      // Para desarrollo, simular una respuesta exitosa después de un breve retraso
      setTimeout(() => {
        // Actualizar botón
        this.attendButton.update(true, 'Asistencia confirmada');
        
        // Mostrar notificación
        Notification.show('¡Has confirmado tu asistencia al evento!', 'success');
        
        if (this.onAttend) {
          this.onAttend(this.event._id);
        }
      }, 1000);
      
      /* En producción, descomentar este código y eliminar la simulación
      await apiService.post(
        `/events/${this.event._id}/attend`,
        {},
        true
      );
      
      // Actualizar botón
      this.attendButton.update(true, 'Asistencia confirmada');
      
      // Mostrar notificación
      Notification.show('¡Has confirmado tu asistencia al evento!', 'success');
      
      if (this.onAttend) {
        this.onAttend(this.event._id);
      }
      */
    } catch (error) {
      console.error('Error al confirmar asistencia:', error);
      this.attendButton.update(false, 'Confirmar asistencia');
      Notification.show('Error al confirmar asistencia', 'error');
    }
  }
  
  /**
   * Maneja la navegación a los detalles del evento
   */
  handleViewDetails(e) {
    e.preventDefault();
    
    if (this.onViewDetails) {
      this.onViewDetails(this.event._id);
    } else {
      window.location.href = `/event.html?id=${this.event._id}`;
    }
  }
  
  /**
   * Renderiza la tarjeta del evento
   * @returns {HTMLElement} - Elemento de la tarjeta
   */
  render() {
    // Crear elemento de tarjeta
    this.element = document.createElement('div');
    this.element.className = 'event-card';
    
    // Formatear fecha
    const formattedDate = formatDate(this.event.date);
    
    // Truncar descripción
    const truncatedDescription = truncateText(this.event.description, 100);
    
    // Determinar precio para mostrar
    const priceDisplay = this.event.price === 0 ? 'Gratis' : `${this.event.price}€`;
    
    // Renderizar contenido
    this.element.innerHTML = `
      <div class="event-card-image">
        <img src="${this.event.image || 'https://via.placeholder.com/300x200?text=Evento'}" alt="${this.event.title}" loading="lazy">
        <div class="event-card-category">${this.event.category || 'General'}</div>
      </div>
      <div class="event-card-content">
        <h3 class="event-card-title">${this.event.title}</h3>
        <div class="event-card-meta">
          <div class="event-card-date">
            <i class="fas fa-calendar-alt"></i> ${formattedDate}
          </div>
          <div class="event-card-location">
            <i class="fas fa-map-marker-alt"></i> ${this.event.location}
          </div>
        </div>
        <p class="event-card-description">${truncatedDescription}</p>
        <div class="event-card-price">
          <i class="fas fa-ticket-alt"></i> ${priceDisplay}
        </div>
        <div class="event-card-creator">
          <div class="event-card-creator-avatar">
            <img src="${this.event.creator?.avatar || '/assets/images/default-avatar.jpg'}" alt="${this.event.creator?.name || 'Organizador'}" loading="lazy">
          </div>
          <div class="event-card-creator-name">
            Organizado por: ${this.event.creator?.name || 'Anónimo'}
          </div>
        </div>
        <div class="event-card-attendees">
          <i class="fas fa-users"></i> ${Array.isArray(this.event.attendees) ? this.event.attendees.length : 0} asistente(s)
        </div>
        <div class="event-card-actions">
          <div id="attend-button-container-${this.event._id}"></div>
          <button class="btn btn-outline btn-sm view-details-btn">
            <i class="fas fa-eye"></i> Ver detalles
          </button>
        </div>
      </div>
    `;
    
    // Configurar botón de asistencia
    const attendButtonContainer = this.element.querySelector(`#attend-button-container-${this.event._id}`);
    
    if (attendButtonContainer) {
      // Verificar si el usuario ya está asistiendo
      const isAttending = false; // Para desarrollo, siempre mostrar como no asistiendo
      
      // Crear botón de asistencia
      this.attendButton = new Button(
        isAttending ? 'Asistiendo' : 'Asistir',
        isAttending ? 'btn-success btn-sm' : 'btn-primary btn-sm',
        this.handleAttend.bind(this),
        isAttending,
        isAttending ? 'fas fa-check' : 'fas fa-plus'
      );
      
      // Renderizar botón
      attendButtonContainer.appendChild(this.attendButton.render());
    }
    
    // Configurar botón de ver detalles
    const viewDetailsButton = this.element.querySelector('.view-details-btn');
    
    if (viewDetailsButton) {
      viewDetailsButton.addEventListener('click', this.handleViewDetails.bind(this));
    }
    
    return this.element;
  }
  
  /**
   * Actualiza los datos del evento
   * @param {object} eventData - Nuevos datos del evento
   */
  update(eventData) {
    this.event = eventData;
    
    if (this.element) {
      // Actualizar el elemento con los nuevos datos
      const newElement = this.render();
      if (this.element.parentNode) {
        this.element.parentNode.replaceChild(newElement, this.element);
      }
      this.element = newElement;
    }
  }
}
