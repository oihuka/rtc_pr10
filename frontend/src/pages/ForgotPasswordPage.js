import ForgotPasswordForm from '../components/Auth/ForgotPasswordForm.js';
import authService from '../utils/auth.js';

/**
 * Página de recuperación de contraseña
 */
export default class ForgotPasswordPage {
  /**
   * @param {string} mainContainerId - ID del contenedor principal
   */
  constructor(mainContainerId = 'main-container') {
    this.mainContainerId = mainContainerId;
    this.mainContainer = null;
    this.forgotPasswordForm = null;
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
              <img src="/assets/images/forgot-password-image.jpg" alt="Recuperar contraseña">
            </div>
            <div class="auth-form-wrapper" id="forgot-password-form-container"></div>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Configura los componentes de la página
   */
  setupComponents() {
    // Inicializar formulario de recuperación de contraseña
    this.forgotPasswordForm = new ForgotPasswordForm(
      'forgot-password-form-container'
    );
    this.forgotPasswordForm.init();
  }
}
