import LoginForm from '../components/Auth/LoginForm.js';
import authService from '../utils/auth.js';

/**
 * Página de inicio de sesión
 */
export default class LoginPage {
  /**
   * @param {string} mainContainerId - ID del contenedor principal
   */
  constructor(mainContainerId = 'main-container') {
    this.mainContainerId = mainContainerId;
    this.mainContainer = null;
    this.loginForm = null;
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
            <div class="auth-form-wrapper" id="login-form-container"></div>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Configura los componentes de la página
   */
  setupComponents() {
    // Inicializar formulario de inicio de sesión
    this.loginForm = new LoginForm(
      'login-form-container',
      this.handleLoginSuccess.bind(this)
    );
    this.loginForm.init();
  }
  
  /**
   * Maneja el inicio de sesión exitoso
   */
  handleLoginSuccess() {
    // Obtener URL de redirección si existe
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect') || '/';
    
    // Redirigir al usuario
    window.location.href = redirectUrl;
  }
}
