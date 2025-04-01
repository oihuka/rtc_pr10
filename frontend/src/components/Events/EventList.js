import EventCard from './EventCard.js';
import Loader from '../UI/Loader.js';
import apiService from '../../api/apiService.js';

/**
 * Componente para mostrar una lista de eventos
 */
export default class EventList {
  /**
   * @param {string} containerId - ID del contenedor donde se renderizará la lista
   * @param {object} filters - Filtros iniciales
   * @param {function} onEventClick - Función a ejecutar al hacer click en un evento
   */
  constructor(containerId, filters = {}, onEventClick = null) {
    this.containerId = containerId;
    this.container = null;
    this.events = [];
    this.filters = filters;
    this.onEventClick = onEventClick;
    this.loader = new Loader('medium', 'Cargando eventos...');
    this.page = 1;
    this.limit = 6;
    this.hasMore = true;
    this.isLoading = false;
  }
  
  /**
   * Inicializa la lista de eventos
   */
  async init() {
    this.container = document.getElementById(this.containerId);
    
    if (!this.container) {
      console.error(`No se encontró el contenedor con ID: ${this.containerId}`);
      return;
    }
    
    // Crear contenedor para los eventos
    const eventsGrid = document.createElement('div');
    eventsGrid.className = 'events-grid';
    this.container.appendChild(eventsGrid);
    
    // Crear contenedor para el mensaje de no eventos
    const noEventsMessage = document.createElement('p');
    noEventsMessage.id = 'no-events-message';
    noEventsMessage.className = 'no-events-message';
    noEventsMessage.textContent = 'No se encontraron eventos con los filtros seleccionados.';
    noEventsMessage.style.display = 'none';
    this.container.appendChild(noEventsMessage);
    
    // Crear botón "Cargar más"
    const loadMoreContainer = document.createElement('div');
    loadMoreContainer.className = 'load-more-container';
    
    const loadMoreButton = document.createElement('button');
    loadMoreButton.className = 'btn btn-outline';
    loadMoreButton.textContent = 'Cargar más eventos';
    loadMoreButton.addEventListener('click', () => this.loadMore());
    
    loadMoreContainer.appendChild(loadMoreButton);
    this.container.appendChild(loadMoreContainer);
    
    // Cargar eventos iniciales
    await this.loadEvents();
  }
  
  /**
   * Carga los eventos desde la API
   */
  async loadEvents() {
    try {
      if (this.isLoading) return;
      
      this.isLoading = true;
      this.loader.show(this.container);
      
      // Construir query string para filtros
      const queryParams = new URLSearchParams();
      
      // Agregar paginación
      queryParams.append('page', this.page);
      queryParams.append('limit', this.limit);
      
      // Agregar filtros
      Object.entries(this.filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
      
      const queryString = queryParams.toString();
      
      // Construir endpoint con los parámetros de consulta
      const endpoint = `/events${queryString ? `?${queryString}` : ''}`;
      
      try {
        // Realizar la llamada a la API
        const response = await apiService.get(endpoint);
        
        this.loader.hide();
        
        if (response.success) {
          const newEvents = response.data || [];
          
          // Actualizar estado
          this.events = this.page === 1 ? newEvents : [...this.events, ...newEvents];
          
          // Verificar si hay más eventos para cargar
          this.hasMore = newEvents.length === this.limit;
          
          // Renderizar eventos
          this.renderEvents();
          
          // Actualizar botón "Cargar más"
          const loadMoreContainer = this.container.querySelector('.load-more-container');
          if (loadMoreContainer) {
            loadMoreContainer.style.display = this.hasMore ? 'block' : 'none';
          }
        } else {
          console.error('Error en la respuesta de la API:', response);
        }
      } catch (apiError) {
        console.error('Error al llamar a la API:', apiError);
        
        // Si hay un error en la API, usar datos simulados como fallback durante el desarrollo
        console.warn('Usando datos simulados como fallback');
        
        // Simulación de respuesta para desarrollo (código existente como fallback)
        let mockEvents = this.getMockEvents();
        
        // Aplicar filtros a los datos de prueba
        if (this.filters.search) {
          const searchTerm = this.filters.search.toLowerCase();
          mockEvents = mockEvents.filter(event => 
            event.title.toLowerCase().includes(searchTerm) || 
            event.description.toLowerCase().includes(searchTerm)
          );
        }
        
        if (this.filters.location) {
          const locationTerm = this.filters.location.toLowerCase();
          mockEvents = mockEvents.filter(event => 
            event.location.toLowerCase().includes(locationTerm)
          );
        }
        
        if (this.filters.startDate) {
          const startDate = new Date(this.filters.startDate);
          mockEvents = mockEvents.filter(event => 
            new Date(event.date) >= startDate
          );
        }
        
        if (this.filters.endDate) {
          const endDate = new Date(this.filters.endDate);
          endDate.setHours(23, 59, 59); // Establecer al final del día
          mockEvents = mockEvents.filter(event => 
            new Date(event.date) <= endDate
          );
        }
        
        if (this.filters.category) {
          mockEvents = mockEvents.filter(event => 
            event.category === this.filters.category
          );
        }
        
        if (this.filters.price) {
          const maxPrice = parseFloat(this.filters.price);
          mockEvents = mockEvents.filter(event => 
            event.price <= maxPrice
          );
        }
        
        // Simular paginación
        const startIndex = (this.page - 1) * this.limit;
        const paginatedEvents = mockEvents.slice(startIndex, startIndex + this.limit);
        
        this.loader.hide();
        
        // Actualizar estado con datos simulados
        this.events = this.page === 1 ? paginatedEvents : [...this.events, ...paginatedEvents];
        this.hasMore = paginatedEvents.length === this.limit && mockEvents.length > (startIndex + this.limit);
        
        // Renderizar eventos
        this.renderEvents();
        
        // Actualizar botón "Cargar más"
        const loadMoreContainer = this.container.querySelector('.load-more-container');
        if (loadMoreContainer) {
          loadMoreContainer.style.display = this.hasMore ? 'block' : 'none';
        }
      }
      
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      this.loader.hide();
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Renderiza los eventos en el contenedor
   */
  renderEvents() {
    const eventsGrid = this.container.querySelector('.events-grid');
    const noEventsMessage = this.container.querySelector('#no-events-message');
    
    if (!eventsGrid || !noEventsMessage) return;
    
    // Limpiar contenedor si es la primera página
    if (this.page === 1) {
      eventsGrid.innerHTML = '';
    }
    
    // Mostrar mensaje si no hay eventos
    if (this.events.length === 0) {
      eventsGrid.style.display = 'none';
      noEventsMessage.style.display = 'block';
      noEventsMessage.innerHTML = `
        <div class="no-events">
          <i class="fas fa-calendar-times"></i>
          <h3>No se encontraron eventos</h3>
          <p>No hay eventos que coincidan con los criterios de búsqueda seleccionados.</p>
          <p>Intenta con otros filtros o explora todos los eventos disponibles.</p>
        </div>
      `;
      return;
    }
    
    eventsGrid.style.display = 'grid';
    noEventsMessage.style.display = 'none';
    
    // Renderizar solo los nuevos eventos
    const startIndex = (this.page - 1) * this.limit;
    const newEvents = this.events.slice(startIndex);
    
    newEvents.forEach(event => {
      const eventCard = new EventCard(
        event,
        this.handleAttendEvent.bind(this),
        this.handleViewEventDetails.bind(this)
      );
      
      eventsGrid.appendChild(eventCard.render());
    });
  }
  
  /**
   * Carga más eventos (siguiente página)
   */
  async loadMore() {
    if (!this.hasMore || this.isLoading) return;
    
    this.page++;
    await this.loadEvents();
  }
  
  /**
   * Actualiza los filtros y recarga los eventos
   * @param {object} newFilters - Nuevos filtros
   */
  async updateFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
    this.page = 1;
    await this.loadEvents();
  }
  
  /**
   * Maneja la confirmación de asistencia a un evento
   * @param {string} eventId - ID del evento
   */
  handleAttendEvent(eventId) {
    // Actualizar el estado del evento en la lista
    const eventIndex = this.events.findIndex(e => e._id === eventId);
    
    if (eventIndex !== -1) {
      this.events[eventIndex].isAttending = true;
      
      // Buscar la tarjeta del evento y actualizarla
      const eventCards = this.container.querySelectorAll('.event-card');
      const eventCardElements = Array.from(eventCards);
      
      for (let i = 0; i < eventCardElements.length; i++) {
        const card = eventCardElements[i];
        const titleElement = card.querySelector('.event-card__title');
        
        if (titleElement && titleElement.textContent === this.events[eventIndex].title) {
          const eventCard = new EventCard(
            this.events[eventIndex],
            this.handleAttendEvent.bind(this),
            this.handleViewEventDetails.bind(this)
          );
          
          card.parentNode.replaceChild(eventCard.render(), card);
          break;
        }
      }
    }
  }
  
  /**
   * Maneja la navegación a los detalles de un evento
   * @param {string} eventId - ID del evento
   */
  handleViewEventDetails(eventId) {
    if (this.onEventClick) {
      this.onEventClick(eventId);
    } else {
      window.location.href = `/event.html?id=${eventId}`;
    }
  }
  
  /**
   * Obtiene eventos de prueba para desarrollo
   * @returns {Array} - Lista de eventos de prueba
   */
  getMockEvents() {
    return [
      {
        _id: '1',
        title: 'Conferencia de Desarrollo Web',
        description: 'Aprende las últimas tendencias en desarrollo web',
        date: '2025-04-15T10:00:00.000Z',
        location: 'Madrid, España',
        image: 'https://via.placeholder.com/300x200?text=Conferencia+Web',
        category: 'conferencia',
        price: 50,
        capacity: 100,
        attendees: 45,
        creator: {
          _id: 'user1',
          name: 'Juan Pérez',
          avatar: 'https://via.placeholder.com/50x50'
        }
      },
      {
        _id: '2',
        title: 'Taller de UX/UI Design',
        description: 'Taller práctico sobre diseño de experiencia de usuario',
        date: '2025-04-20T14:00:00.000Z',
        location: 'Barcelona, España',
        image: 'https://via.placeholder.com/300x200?text=Taller+UX/UI',
        category: 'taller',
        price: 75,
        capacity: 30,
        attendees: 25,
        creator: {
          _id: 'user2',
          name: 'María López',
          avatar: 'https://via.placeholder.com/50x50'
        }
      },
      {
        _id: '3',
        title: 'Networking para Desarrolladores',
        description: 'Evento de networking para profesionales del desarrollo',
        date: '2025-05-05T18:00:00.000Z',
        location: 'Valencia, España',
        image: 'https://via.placeholder.com/300x200?text=Networking',
        category: 'networking',
        price: 0,
        capacity: 50,
        attendees: 30,
        creator: {
          _id: 'user3',
          name: 'Carlos Rodríguez',
          avatar: 'https://via.placeholder.com/50x50'
        }
      },
      {
        _id: '4',
        title: 'Concierto de Jazz',
        description: 'Disfruta de una noche de jazz en vivo',
        date: '2025-05-10T20:00:00.000Z',
        location: 'Madrid, España',
        image: 'https://via.placeholder.com/300x200?text=Concierto+Jazz',
        category: 'cultural',
        price: 25,
        capacity: 200,
        attendees: 150,
        creator: {
          _id: 'user4',
          name: 'Ana Martínez',
          avatar: 'https://via.placeholder.com/50x50'
        }
      },
      {
        _id: '5',
        title: 'Maratón Solidario',
        description: 'Carrera solidaria para recaudar fondos',
        date: '2025-06-01T09:00:00.000Z',
        location: 'Sevilla, España',
        image: 'https://via.placeholder.com/300x200?text=Maratón',
        category: 'deportivo',
        price: 15,
        capacity: 500,
        attendees: 320,
        creator: {
          _id: 'user5',
          name: 'Pedro Sánchez',
          avatar: 'https://via.placeholder.com/50x50'
        }
      },
      {
        _id: '6',
        title: 'Hackathon de Innovación',
        description: 'Competición de desarrollo de soluciones innovadoras',
        date: '2025-06-15T08:00:00.000Z',
        location: 'Barcelona, España',
        image: 'https://via.placeholder.com/300x200?text=Hackathon',
        category: 'conferencia',
        price: 0,
        capacity: 100,
        attendees: 80,
        creator: {
          _id: 'user6',
          name: 'Laura Gómez',
          avatar: 'https://via.placeholder.com/50x50'
        }
      },
      {
        _id: '7',
        title: 'Exposición de Arte Digital',
        description: 'Muestra de arte digital y nuevas tecnologías',
        date: '2025-07-01T11:00:00.000Z',
        location: 'Madrid, España',
        image: 'https://via.placeholder.com/300x200?text=Arte+Digital',
        category: 'cultural',
        price: 10,
        capacity: 150,
        attendees: 75,
        creator: {
          _id: 'user7',
          name: 'Miguel Fernández',
          avatar: 'https://via.placeholder.com/50x50'
        }
      },
      {
        _id: '8',
        title: 'Workshop de Inteligencia Artificial',
        description: 'Taller práctico sobre IA y machine learning',
        date: '2025-07-15T15:00:00.000Z',
        location: 'Valencia, España',
        image: 'https://via.placeholder.com/300x200?text=Workshop+IA',
        category: 'taller',
        price: 100,
        capacity: 40,
        attendees: 35,
        creator: {
          _id: 'user8',
          name: 'Sofía Torres',
          avatar: 'https://via.placeholder.com/50x50'
        }
      }
    ];
  }
}
