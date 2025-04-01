/**
 * Componente para filtrar eventos
 */
export default class EventFilters {
  /**
   * @param {string} containerId - ID del contenedor donde se renderizarán los filtros
   * @param {object} initialFilters - Filtros iniciales
   * @param {function} onFilterChange - Función a ejecutar cuando cambian los filtros
   */
  constructor(containerId, initialFilters = {}, onFilterChange = null) {
    this.containerId = containerId;
    this.container = null;
    this.filters = initialFilters;
    this.onFilterChange = onFilterChange;
    this.form = null;
    this.debounceTimer = null;
    this.isAdvancedMode = false;
  }
  
  /**
   * Inicializa el componente
   */
  init() {
    this.container = document.getElementById(this.containerId);
    
    if (!this.container) {
      console.error(`No se encontró el contenedor con ID: ${this.containerId}`);
      return;
    }
    
    this.render();
    this.setupEventListeners();
  }
  
  /**
   * Renderiza los filtros
   */
  render() {
    // Obtener fechas para el filtro
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // Formatear fechas para los inputs
    const formatDateForInput = (date) => {
      return date.toISOString().split('T')[0]; // Retorna en formato yyyy-mm-dd
    };
    
    this.container.innerHTML = `
      <div class="filters-container">
        <form id="event-filters-form" class="filters-form">
          <div class="filters-header">
            <h3>Próximos eventos</h3>
            <p>Explora los eventos disponibles y únete a los que más te interesen</p>
          </div>
          
          <div class="filters-main">
            <div class="filters-search">
              <div class="filter-group search-group">
                <label for="search">Buscar por título</label>
                <div class="input-with-icon">
                  <i class="fas fa-search"></i>
                  <input 
                    type="text" 
                    id="search" 
                    name="search" 
                    class="form-control" 
                    placeholder="Buscar eventos..."
                    value="${this.filters.search || ''}"
                  >
                </div>
              </div>
              
              <div class="filter-group location-group">
                <label for="location">Ubicación</label>
                <div class="input-with-icon">
                  <i class="fas fa-map-marker-alt"></i>
                  <input 
                    type="text" 
                    id="location" 
                    name="location" 
                    class="form-control" 
                    placeholder="Cualquier ubicación"
                    value="${this.filters.location || ''}"
                  >
                </div>
              </div>
            </div>
            
            <div class="filters-date">
              <div class="filter-group date-group">
                <label for="startDate">Desde</label>
                <div class="input-with-icon">
                  <i class="fas fa-calendar"></i>
                  <input 
                    type="date" 
                    id="startDate" 
                    name="startDate" 
                    class="form-control date-input"
                    data-date-format="yyyy-mm-dd"
                    value="${this.filters.startDate || formatDateForInput(today)}"
                  >
                </div>
              </div>
              
              <div class="filter-group date-group">
                <label for="endDate">Hasta</label>
                <div class="input-with-icon">
                  <i class="fas fa-calendar-alt"></i>
                  <input 
                    type="date" 
                    id="endDate" 
                    name="endDate" 
                    class="form-control date-input"
                    data-date-format="yyyy-mm-dd"
                    value="${this.filters.endDate || ''}"
                  >
                </div>
              </div>
            </div>
          </div>
          
          <div class="filters-quick">
            <button type="button" class="btn btn-outline btn-sm" id="filter-today">Hoy</button>
            <button type="button" class="btn btn-outline btn-sm" id="filter-tomorrow">Mañana</button>
            <button type="button" class="btn btn-outline btn-sm" id="filter-week">Esta semana</button>
            <button type="button" class="btn btn-outline btn-sm" id="filter-month">Este mes</button>
          </div>
          
          <div class="filters-actions">
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-filter"></i> Aplicar filtros
            </button>
            <button type="button" class="btn btn-secondary" id="clear-filters">
              <i class="fas fa-times"></i> Limpiar filtros
            </button>
            <button type="button" class="btn btn-link toggle-advanced" id="toggle-advanced">
              <span class="show-advanced"><i class="fas fa-cog"></i> Opciones avanzadas</span>
              <span class="hide-advanced"><i class="fas fa-chevron-up"></i> Ocultar opciones</span>
            </button>
          </div>
          
          <div class="filters-advanced" id="advanced-filters">
            <div class="filter-group">
              <label for="category">Categoría</label>
              <select id="category" name="category" class="form-control">
                <option value="">Todas las categorías</option>
                <option value="Música" ${this.filters.category === 'Música' ? 'selected' : ''}>Música</option>
                <option value="Deportes" ${this.filters.category === 'Deportes' ? 'selected' : ''}>Deportes</option>
                <option value="Arte" ${this.filters.category === 'Arte' ? 'selected' : ''}>Arte</option>
                <option value="Tecnología" ${this.filters.category === 'Tecnología' ? 'selected' : ''}>Tecnología</option>
                <option value="Gastronomía" ${this.filters.category === 'Gastronomía' ? 'selected' : ''}>Gastronomía</option>
                <option value="Educación" ${this.filters.category === 'Educación' ? 'selected' : ''}>Educación</option>
                <option value="Otro" ${this.filters.category === 'Otro' ? 'selected' : ''}>Otro</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label for="price">Precio máximo</label>
              <div class="input-with-icon">
                <i class="fas fa-euro-sign"></i>
                <input 
                  type="number" 
                  id="price" 
                  name="price" 
                  class="form-control" 
                  placeholder="Cualquier precio"
                  min="0"
                  value="${this.filters.price || ''}"
                >
              </div>
            </div>
            
            <div class="filter-group">
              <label for="capacity">Capacidad mínima</label>
              <div class="input-with-icon">
                <i class="fas fa-users"></i>
                <input 
                  type="number" 
                  id="capacity" 
                  name="capacity" 
                  class="form-control" 
                  placeholder="Cualquier capacidad"
                  min="1"
                  value="${this.filters.capacity || ''}"
                >
              </div>
            </div>
          </div>
        </form>
      </div>
    `;
    
    this.form = document.getElementById('event-filters-form');
    
    // Inicializar estado de filtros avanzados
    const advancedFilters = document.getElementById('advanced-filters');
    if (advancedFilters) {
      advancedFilters.style.display = this.isAdvancedMode ? 'grid' : 'none';
    }
    
    // Actualizar clase del botón de toggle
    const toggleButton = document.getElementById('toggle-advanced');
    if (toggleButton) {
      toggleButton.classList.toggle('active', this.isAdvancedMode);
    }
  }
  
  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    if (!this.form) return;
    
    // Evento submit del formulario
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    
    // Botón para limpiar filtros
    const clearButton = document.getElementById('clear-filters');
    if (clearButton) {
      clearButton.addEventListener('click', this.handleClearFilters.bind(this));
    }
    
    // Botones de filtro rápido
    const todayButton = document.getElementById('filter-today');
    const tomorrowButton = document.getElementById('filter-tomorrow');
    const weekButton = document.getElementById('filter-week');
    const monthButton = document.getElementById('filter-month');
    
    if (todayButton) {
      todayButton.addEventListener('click', () => this.setDateFilter('today'));
    }
    
    if (tomorrowButton) {
      tomorrowButton.addEventListener('click', () => this.setDateFilter('tomorrow'));
    }
    
    if (weekButton) {
      weekButton.addEventListener('click', () => this.setDateFilter('week'));
    }
    
    if (monthButton) {
      monthButton.addEventListener('click', () => this.setDateFilter('month'));
    }
    
    // Botón para mostrar/ocultar filtros avanzados
    const toggleButton = document.getElementById('toggle-advanced');
    if (toggleButton) {
      toggleButton.addEventListener('click', this.toggleAdvancedFilters.bind(this));
    }
    
    // Configurar búsqueda en tiempo real
    const searchInput = this.form.querySelector('#search');
    const locationInput = this.form.querySelector('#location');
    
    if (searchInput) {
      searchInput.addEventListener('input', this.debounceSearch.bind(this));
    }
    
    if (locationInput) {
      locationInput.addEventListener('input', this.debounceSearch.bind(this));
    }
  }
  
  /**
   * Aplica debounce a la búsqueda para evitar demasiadas peticiones
   */
  debounceSearch() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.handleSubmit({ preventDefault: () => {} });
    }, 500);
  }
  
  /**
   * Muestra u oculta los filtros avanzados
   */
  toggleAdvancedFilters() {
    this.isAdvancedMode = !this.isAdvancedMode;
    
    const advancedFilters = document.getElementById('advanced-filters');
    const toggleButton = document.getElementById('toggle-advanced');
    
    if (advancedFilters) {
      advancedFilters.style.display = this.isAdvancedMode ? 'grid' : 'none';
    }
    
    if (toggleButton) {
      toggleButton.classList.toggle('active', this.isAdvancedMode);
    }
  }
  
  /**
   * Maneja el envío del formulario
   * @param {Event} event - Evento submit
   */
  handleSubmit(event) {
    event.preventDefault();
    
    // Obtener valores del formulario
    const formData = new FormData(this.form);
    const newFilters = {};
    
    for (const [key, value] of formData.entries()) {
      if (value) {
        newFilters[key] = value;
      }
    }
    
    // Actualizar filtros
    this.filters = newFilters;
    
    // Notificar cambio
    if (this.onFilterChange) {
      this.onFilterChange(newFilters);
    }
  }
  
  /**
   * Maneja la limpieza de filtros
   */
  handleClearFilters() {
    // Resetear formulario
    this.form.reset();
    
    // Limpiar filtros
    this.filters = {};
    
    // Notificar cambio
    if (this.onFilterChange) {
      this.onFilterChange({});
    }
  }
  
  /**
   * Establece un filtro de fecha predefinido
   * @param {string} type - Tipo de filtro (today, tomorrow, week, month)
   */
  setDateFilter(type) {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (!startDateInput || !endDateInput) return;
    
    const formatDate = (date) => {
      return date.toISOString().split('T')[0]; // Retorna en formato yyyy-mm-dd
    };
    
    const today = new Date();
    
    switch (type) {
      case 'today':
        startDateInput.value = formatDate(today);
        endDateInput.value = formatDate(today);
        break;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        startDateInput.value = formatDate(tomorrow);
        endDateInput.value = formatDate(tomorrow);
        break;
      case 'week':
        startDateInput.value = formatDate(today);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        endDateInput.value = formatDate(nextWeek);
        break;
      case 'month':
        startDateInput.value = formatDate(today);
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        endDateInput.value = formatDate(nextMonth);
        break;
    }
    
    // Aplicar filtros automáticamente
    this.handleSubmit({
      preventDefault: () => {}
    });
  }
  
  /**
   * Actualiza los filtros
   * @param {object} newFilters - Nuevos filtros
   */
  updateFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
    
    // Actualizar valores en el formulario
    if (this.form) {
      for (const [key, value] of Object.entries(this.filters)) {
        const input = this.form.querySelector(`[name="${key}"]`);
        if (input) {
          input.value = value;
        }
      }
    }
  }
}
