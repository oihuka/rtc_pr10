/**
 * Componente Notification para mostrar notificaciones
 */
export default class Notification {
  /**
   * @param {string} message - Mensaje de la notificación
   * @param {string} type - Tipo de notificación (success, error, warning, info)
   * @param {number} duration - Duración en ms (0 para no auto-cerrar)
   */
  constructor(message, type = 'info', duration = 5000) {
    this.message = message;
    this.type = type;
    this.duration = duration;
    this.element = null;
    this.timeout = null;
  }
  
  /**
   * Inicializa el sistema de notificaciones
   */
  static init() {
    // Verificar si ya existe el contenedor
    let container = document.getElementById('notifications-container');
    
    // Si no existe, crearlo
    if (!container) {
      container = document.createElement('div');
      container.id = 'notifications-container';
      document.body.appendChild(container);
    }
    
    return container;
  }
  
  /**
   * Renderiza la notificación
   * @returns {HTMLElement} - Elemento de la notificación
   */
  render() {
    const notification = document.createElement('div');
    notification.className = `notification notification-${this.type}`;
    
    // Icono según el tipo
    let icon = '';
    switch (this.type) {
      case 'success':
        icon = '<i class="fas fa-check-circle"></i>';
        break;
      case 'error':
        icon = '<i class="fas fa-exclamation-circle"></i>';
        break;
      case 'warning':
        icon = '<i class="fas fa-exclamation-triangle"></i>';
        break;
      default:
        icon = '<i class="fas fa-info-circle"></i>';
    }
    
    notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-message">${this.message}</div>
      <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Configurar botón de cierre
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => this.close());
    
    this.element = notification;
    return notification;
  }
  
  /**
   * Muestra la notificación
   */
  show() {
    if (!this.element) {
      this.render();
    }
    
    // Obtener o crear el contenedor de notificaciones
    let container = document.getElementById('notifications-container');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'notifications-container';
      document.body.appendChild(container);
    }
    
    // Agregar al DOM
    container.appendChild(this.element);
    
    // Mostrar con animación
    setTimeout(() => {
      this.element.classList.add('show');
    }, 10);
    
    // Auto-cerrar si hay duración
    if (this.duration > 0) {
      this.timeout = setTimeout(() => {
        this.close();
      }, this.duration);
    }
  }
  
  /**
   * Cierra la notificación
   */
  close() {
    if (!this.element) return;
    
    // Limpiar timeout si existe
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    
    // Ocultar con animación
    this.element.classList.remove('show');
    
    // Eliminar del DOM después de la animación
    setTimeout(() => {
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }, 300);
  }
  
  /**
   * Método estático para mostrar una notificación rápidamente
   * @param {string} message - Mensaje de la notificación
   * @param {string} type - Tipo de notificación
   * @param {number} duration - Duración en ms
   */
  static show(message, type = 'info', duration = 5000) {
    const notification = new Notification(message, type, duration);
    notification.show();
    return notification;
  }
}
