import authService from '../../utils/auth.js';
import Button from '../UI/Button.js';
import Notification from '../UI/Notification.js';

/**
 * Componente para el botón de cierre de sesión
 */
export default class LogoutButton {
  /**
   * @param {string} containerId - ID del contenedor donde se renderizará el botón
   * @param {function} onLogout - Función a ejecutar al cerrar sesión
   * @param {string} type - Tipo de botón (primary, secondary, outline)
   * @param {string} text - Texto del botón
   */
  constructor(containerId, onLogout = null, type = 'outline', text = 'Cerrar Sesión') {
    this.containerId = containerId;
    this.container = null;
    this.button = null;
    this.onLogout = onLogout;
    this.type = type;
    this.text = text;
  }
  
  /**
   * Inicializa el botón
   */
  init() {
    this.container = document.getElementById(this.containerId);
    
    if (!this.container) {
      console.error(`No se encontró el contenedor con ID: ${this.containerId}`);
      return;
    }
    
    this.render();
  }
  
  /**
   * Renderiza el botón
   */
  render() {
    // Crear botón
    this.button = new Button(
      this.text,
      this.type,
      this.handleLogout.bind(this),
      false,
      'fas fa-sign-out-alt'
    );
    
    this.container.appendChild(this.button.render());
  }
  
  /**
   * Maneja el cierre de sesión
   */
  async handleLogout() {
    try {
      // Deshabilitar botón mientras se procesa
      this.button.update(true, 'Cerrando sesión...');
      
      // Cerrar sesión
      await authService.logout();
      
      Notification.show('Has cerrado sesión correctamente', 'success');
      
      if (this.onLogout) {
        this.onLogout();
      } else {
        // Redirigir a la página de inicio
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      this.button.update(false, this.text);
      Notification.show('Error al cerrar sesión', 'error');
    }
  }
}
