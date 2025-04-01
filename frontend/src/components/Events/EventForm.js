import apiService from '../../api/apiService.js';
import Button from '../UI/Button.js';
import Notification from '../UI/Notification.js';
import { validateForm, validateFutureDate } from '../../utils/validators.js';

/**
 * Componente para crear o editar eventos
 */
export default class EventForm {
  /**
   * @param {string} containerId - ID del contenedor donde se renderizará el formulario
   * @param {function} onSuccess - Función a ejecutar al crear/editar con éxito
   * @param {object} eventData - Datos del evento para edición (opcional)
   */
  constructor(containerId, onSuccess = null, eventData = null) {
    this.containerId = containerId;
    this.container = null;
    this.form = null;
    this.submitButton = null;
    this.onSuccess = onSuccess;
    this.eventData = eventData;
    this.isEditing = !!eventData;
    this.imagePreview = null;
  }
  
  /**
   * Inicializa el formulario
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
   * Renderiza el formulario
   */
  render() {
    const formTitle = this.isEditing ? 'Editar Evento' : 'Crear Nuevo Evento';
    const submitText = this.isEditing ? 'Guardar Cambios' : 'Crear Evento';
    
    this.container.innerHTML = `
      <div class="form-container">
        <h2>${formTitle}</h2>
        <form id="event-form" class="event-form">
          <div class="form-group">
            <label for="title">Título del evento *</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              class="form-control" 
              required 
              minlength="5" 
              maxlength="100"
              value="${this.eventData ? this.eventData.title : ''}"
            >
            <div class="form-error" id="title-error"></div>
          </div>
          
          <div class="form-group">
            <label for="description">Descripción *</label>
            <textarea 
              id="description" 
              name="description" 
              class="form-control" 
              required 
              minlength="20" 
              rows="5"
            >${this.eventData ? this.eventData.description : ''}</textarea>
            <div class="form-error" id="description-error"></div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="date">Fecha *</label>
              <input 
                type="date" 
                id="date" 
                name="date" 
                class="form-control date-input" 
                required
                data-date-format="yyyy-mm-dd"
                value="${this.eventData ? this.formatDateToInput(new Date(this.eventData.date)) : ''}"
              >
              <div class="form-error" id="date-error"></div>
            </div>
            
            <div class="form-group">
              <label for="time">Hora *</label>
              <input 
                type="time" 
                id="time" 
                name="time" 
                class="form-control" 
                required
                value="${this.eventData ? new Date(this.eventData.date).toTimeString().slice(0, 5) : ''}"
              >
              <div class="form-error" id="time-error"></div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="location">Ubicación *</label>
            <input 
              type="text" 
              id="location" 
              name="location" 
              class="form-control" 
              required
              value="${this.eventData ? this.eventData.location : ''}"
            >
            <div class="form-error" id="location-error"></div>
          </div>
          
          <div class="form-group">
            <label for="image">Imagen del evento</label>
            <div class="file-input-container">
              <input 
                type="file" 
                id="image" 
                name="image" 
                class="form-control file-input" 
                accept="image/*"
              >
              <label for="image" class="file-input-label">
                <i class="fas fa-upload"></i> Seleccionar imagen
              </label>
            </div>
            <div class="image-preview-container" id="image-preview-container">
              ${this.eventData && this.eventData.image ? 
                `<img src="${this.eventData.image}" alt="Vista previa" class="image-preview">` : 
                ''}
            </div>
            <div class="form-error" id="image-error"></div>
          </div>
          
          <div class="form-actions">
            <div id="submit-button-container"></div>
            <button type="button" class="btn btn-outline" id="cancel-button">Cancelar</button>
          </div>
        </form>
      </div>
    `;
    
    // Crear botón de envío
    setTimeout(() => {
      const submitContainer = document.getElementById('submit-button-container');
      
      if (submitContainer) {
        this.submitButton = new Button(
          submitText,
          'primary',
          this.handleSubmit.bind(this),
          false,
          'fas fa-save'
        );
        
        submitContainer.appendChild(this.submitButton.render());
      }
    }, 0);
    
    this.form = document.getElementById('event-form');
    this.imagePreview = document.getElementById('image-preview-container');
  }
  
  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Cancelar formulario
    const cancelButton = document.getElementById('cancel-button');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        window.history.back();
      });
    }
    
    // Vista previa de imagen
    const imageInput = document.getElementById('image');
    if (imageInput) {
      imageInput.addEventListener('change', this.handleImageChange.bind(this));
    }
    
    // Validación en tiempo real
    const inputs = this.form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
    });
  }
  
  /**
   * Maneja el cambio de imagen
   * @param {Event} event - Evento change
   */
  handleImageChange(event) {
    const file = event.target.files[0];
    
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!validTypes.includes(file.type)) {
        document.getElementById('image-error').textContent = 'El archivo debe ser una imagen (JPEG, PNG, GIF, WEBP)';
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        document.getElementById('image-error').textContent = 'La imagen no debe superar los 5MB';
        return;
      }
      
      // Limpiar error
      document.getElementById('image-error').textContent = '';
      
      // Mostrar vista previa
      const reader = new FileReader();
      
      reader.onload = (e) => {
        this.imagePreview.innerHTML = `
          <img src="${e.target.result}" alt="Vista previa" class="image-preview">
        `;
      };
      
      reader.readAsDataURL(file);
    }
  }
  
  /**
   * Valida un campo del formulario
   * @param {HTMLElement} field - Campo a validar
   * @returns {boolean} - true si es válido, false si no
   */
  validateField(field) {
    const errorElement = document.getElementById(`${field.id}-error`);
    
    // Validar campo requerido
    if (field.required && !field.value.trim()) {
      errorElement.textContent = 'Este campo es obligatorio';
      field.classList.add('error');
      return false;
    }
    
    // Validar longitud mínima
    if (field.minLength && field.value.length < field.minLength) {
      errorElement.textContent = `Debe tener al menos ${field.minLength} caracteres`;
      field.classList.add('error');
      return false;
    }
    
    // Validar longitud máxima
    if (field.maxLength && field.value.length > field.maxLength) {
      errorElement.textContent = `No debe exceder los ${field.maxLength} caracteres`;
      field.classList.add('error');
      return false;
    }
    
    // Validar fecha futura
    if (field.id === 'date') {
      const dateValue = field.value;
      
      if (!validateFutureDate(dateValue)) {
        errorElement.textContent = 'La fecha debe ser futura';
        field.classList.add('error');
        return false;
      }
    }
    
    // Limpiar error
    errorElement.textContent = '';
    field.classList.remove('error');
    return true;
  }
  
  /**
   * Maneja el envío del formulario
   * @param {Event} event - Evento submit
   */
  async handleSubmit(event) {
    event.preventDefault();
    
    // Validar formulario
    if (!validateForm(this.form)) {
      return;
    }
    
    // Validar campos manualmente
    const inputs = this.form.querySelectorAll('input, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
      if (input.id !== 'image') { // No validar imagen (es opcional)
        if (!this.validateField(input)) {
          isValid = false;
        }
      }
    });
    
    if (!isValid) {
      return;
    }
    
    try {
      // Deshabilitar botón mientras se procesa
      this.submitButton.update(true, 'Guardando...');
      
      // Crear FormData
      const formData = new FormData();
      
      // Obtener valores
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const date = document.getElementById('date').value; // Formato yyyy-mm-dd
      const time = document.getElementById('time').value;
      const location = document.getElementById('location').value;
      const imageInput = document.getElementById('image');
      
      // Combinar fecha y hora
      const dateTime = new Date(`${date}T${time}`);
      
      // Agregar datos al FormData
      formData.append('title', title);
      formData.append('description', description);
      formData.append('date', dateTime.toISOString());
      formData.append('location', location);
      
      // Agregar imagen si se seleccionó una nueva
      if (imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
      }
      
      // Endpoint y método según si es creación o edición
      const endpoint = this.isEditing ? `/events/${this.eventData._id}` : '/events';
      const method = this.isEditing ? 'PUT' : 'POST';
      
      // Enviar petición
      const response = await apiService.fetchData(endpoint, method, null, true, formData);
      
      if (response.success) {
        Notification.show(
          this.isEditing ? '¡Evento actualizado correctamente!' : '¡Evento creado correctamente!',
          'success'
        );
        
        if (this.onSuccess) {
          this.onSuccess(response.data);
        } else {
          // Redirigir a la página del evento
          window.location.href = `/event.html?id=${response.data._id}`;
        }
      }
    } catch (error) {
      console.error('Error al guardar evento:', error);
      Notification.show('Error al guardar el evento', 'error');
      this.submitButton.update(false, this.isEditing ? 'Guardar Cambios' : 'Crear Evento');
    }
  }
  
  /**
   * Formatea una fecha para el input date
   * @param {Date} date - Fecha a formatear
   * @returns {string} - Fecha formateada en formato yyyy-mm-dd
   */
  formatDateToInput(date) {
    return date.toISOString().split('T')[0];
  }
}
