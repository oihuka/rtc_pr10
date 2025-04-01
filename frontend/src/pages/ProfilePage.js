import ProfileForm from '../components/Auth/ProfileForm.js';
import authService from '../utils/auth.js';
import Notification from '../components/UI/Notification.js';

/**
 * Página de perfil de usuario
 */
export default class ProfilePage {
  /**
   * @param {string} mainContainerId - ID del contenedor principal
   */
  constructor(mainContainerId = 'main-container') {
    this.mainContainerId = mainContainerId;
    this.mainContainer = null;
    this.profileForm = null;
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
    
    // Verificar si el usuario está autenticado
    if (!authService.isAuthenticated()) {
      Notification.show('Debes iniciar sesión para ver tu perfil', 'warning');
      window.location.href = '/login.html?redirect=/profile.html';
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
      <div class="profile-page">
        <div class="container">
          <div class="section-header">
            <h1>Mi Perfil</h1>
            <p>Actualiza tu información personal</p>
          </div>
          
          <div id="profile-form-container"></div>
        </div>
      </div>
    `;
  }
  
  /**
   * Configura los componentes de la página
   */
  setupComponents() {
    // Inicializar formulario de perfil
    this.profileForm = new ProfileForm(
      'profile-form-container',
      this.handleProfileUpdated.bind(this)
    );
    this.profileForm.init();
  }
  
  /**
   * Maneja la actualización exitosa del perfil
   * @param {object} userData - Datos del usuario actualizados
   */
  handleProfileUpdated(userData) {
    // Actualizar datos en el header si es necesario
    const headerUserName = document.getElementById('header-user-name');
    const headerUserAvatar = document.getElementById('header-user-avatar');
    
    if (headerUserName) {
      headerUserName.textContent = userData.name;
    }
    
    if (headerUserAvatar) {
      headerUserAvatar.src = userData.avatar || '/assets/default-avatar.png';
    }
  }
}
