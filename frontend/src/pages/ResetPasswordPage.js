import ResetPasswordForm from '../components/Auth/ResetPasswordForm.js';
import authService from '../utils/auth.js';

/**
 * Página de restablecimiento de contraseña
 */
export default class ResetPasswordPage {
  /**
   * @param {string} mainContainerId - ID del contenedor principal
   */
  constructor(mainContainerId = 'main-container') {
    this.mainContainerId = mainContainerId;
    this.mainContainer = null;
    this.resetPasswordForm = null;
    this.token = null;
  }
  
  /**
   * Inicializa la página
   */
  init() {
    this.mainContainer = document.getElementById(this.mainContainerId);
    
    if (!this.mainContainer) {
      console.error(`No se encontró el contenedor con ID: ${this.mainContainerId}`);
      return;
    }
    
    // Si el usuario ya está autenticado, redirigir a la página principal
    if (authService.isAuthenticated()) {
      window.location.href = '/';
      return;
    }
    
    // Obtener token de la URL
    this.token = this.getTokenFromUrl();
    
    if (!this.token) {
      this.renderError('Token no válido o expirado');
      return;
    }
    
    this.render();
    this.setupComponents();
  }
  
  /**
   * Renderiza la estructura básica de la página
   */
  render() {
    this.mainContainer.innerHTML = `
      <div class="auth-page">
        <div class="container">
          <div class="auth-container">
            <div class="auth-image">
              <img src="/assets/images/reset-password-image.jpg" alt="Restablecer contraseña">
            </div>
            <div class="auth-form-wrapper" id="reset-password-form-container"></div>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Configura los componentes de la página
   */
  setupComponents() {
    // Inicializar formulario de restablecimiento de contraseña
    this.resetPasswordForm = new ResetPasswordForm(
      'reset-password-form-container',
      this.token,
      this.handleResetSuccess.bind(this)
    );
    this.resetPasswordForm.init();
  }
  
  /**
   * Obtiene el token de la URL
   * @returns {string|null} - Token o null si no es válido
   */
  getTokenFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
  }
  
  /**
   * Maneja el restablecimiento exitoso de la contraseña
   */
  handleResetSuccess() {
    // Redirigir al login después de un tiempo
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 3000);
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
        <a href="/login.html" class="btn btn-primary">Volver al inicio de sesión</a>
      </div>
    `;
  }
}
