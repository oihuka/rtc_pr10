import Header from './components/Layout/Header.js';
import Footer from './components/Layout/Footer.js';
import Notification from './components/UI/Notification.js';
import authService from './utils/auth.js';

/**
 * Clase principal de la aplicación
 */
export default class App {
  /**
   * @param {string} headerContainerId - ID del contenedor del header
   * @param {string} mainContainerId - ID del contenedor principal
   * @param {string} footerContainerId - ID del contenedor del footer
   */
  constructor(headerContainerId = 'header-container', mainContainerId = 'main-container', footerContainerId = 'footer-container') {
    this.headerContainerId = headerContainerId;
    this.mainContainerId = mainContainerId;
    this.footerContainerId = footerContainerId;
    this.header = null;
    this.footer = null;
    this.currentPage = null;
  }
  
  /**
   * Inicializa la aplicación
   */
  async init() {
    // Inicializar componentes globales
    this.initializeGlobalComponents();
    
    // Inicializar header y footer
    await this.initializeLayout();
    
    // Inicializar sistema de notificaciones
    Notification.init();
    
    // Verificar token de autenticación
    await this.checkAuthentication();
  }
  
  /**
   * Inicializa componentes globales
   */
  initializeGlobalComponents() {
    // Configurar interceptores para manejar errores de autenticación
    this.setupAuthInterceptors();
    
    // Configurar manejo de errores global
    window.addEventListener('error', this.handleGlobalError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
  }
  
  /**
   * Inicializa el header y footer
   */
  async initializeLayout() {
    // Inicializar header
    this.header = new Header(this.headerContainerId);
    if (this.header) {
      await this.header.init();
    } else {
      console.warn('No se pudo inicializar el componente Header');
    }
    
    // Inicializar footer
    this.footer = new Footer(this.footerContainerId);
    this.footer.init();
    
    // Asegurar que el layout flex funcione correctamente
    document.body.style.display = 'flex';
    document.body.style.flexDirection = 'column';
    document.body.style.minHeight = '100vh';
    
    // Verificar si existe el elemento app
    const appElement = document.getElementById('app');
    if (appElement) {
      // Si existe, aplicar estilos al elemento app
      appElement.style.flex = '1';
      appElement.style.display = 'flex';
      appElement.style.flexDirection = 'column';
    } else {
      // Si no existe, aplicar estilos directamente a los contenedores
      const mainContainer = document.getElementById(this.mainContainerId);
      if (mainContainer) {
        mainContainer.style.flex = '1';
      }
    }
  }
  
  /**
   * Verifica el token de autenticación
   */
  async checkAuthentication() {
    if (authService.isAuthenticated()) {
      try {
        // Verificar si el token es válido
        const isValid = await authService.validateToken();
        
        if (!isValid) {
          // Si el token no es válido, cerrar sesión
          authService.logout(false);
        }
      } catch (error) {
        console.error('Error al validar token:', error);
        // En caso de error, mantener la sesión para evitar cerrar sesión por problemas de red
      }
    }
  }
  
  /**
   * Configura interceptores para manejar errores de autenticación
   */
  setupAuthInterceptors() {
    // Este método se implementará en apiService.js
  }
  
  /**
   * Carga una página en el contenedor principal
   * @param {object} PageClass - Clase de la página a cargar
   * @param {object} options - Opciones adicionales para la página
   */
  async loadPage(PageClass, options = {}) {
    try {
      // Crear instancia de la página
      this.currentPage = new PageClass(this.mainContainerId, options);
      
      // Inicializar la página
      await this.currentPage.init();
      
      // Hacer scroll al inicio de la página
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error al cargar la página:', error);
      this.renderErrorPage('Ha ocurrido un error al cargar la página');
    }
  }
  
  /**
   * Renderiza una página de error
   * @param {string} message - Mensaje de error
   */
  renderErrorPage(message) {
    // Mostrar notificación de error
    Notification.show(message, 'error', 0);
    
    const mainContainer = document.getElementById(this.mainContainerId);
    
    if (mainContainer) {
      mainContainer.innerHTML = `
        <div class="centered-message">
          <h2>Error</h2>
          <p>${message}</p>
          <button class="btn btn-primary" onclick="window.location.reload()">
            Intentar de nuevo
          </button>
        </div>
      `;
    }
  }
  
  /**
   * Maneja errores globales
   * @param {ErrorEvent} event - Evento de error
   */
  handleGlobalError(event) {
    console.error('Error global:', event.error || event.message);
    
    // Evitar mostrar notificaciones para errores de recursos (imágenes, scripts, etc.)
    if (!event.filename || event.filename.includes(window.location.origin)) {
      Notification.show('Ha ocurrido un error en la aplicación', 'error');
    }
    
    // Evitar que el navegador muestre su propio mensaje de error
    event.preventDefault();
  }
  
  /**
   * Maneja promesas rechazadas no capturadas
   * @param {PromiseRejectionEvent} event - Evento de rechazo de promesa
   */
  handleUnhandledRejection(event) {
    console.error('Promesa rechazada no capturada:', event.reason);
    
    // Mostrar notificación solo para errores de la aplicación
    if (event.reason && event.reason.isAxiosError) {
      // No mostrar notificación para errores de red que ya son manejados por apiService
      return;
    }
    
    Notification.show('Ha ocurrido un error en la aplicación', 'error');
  }

  /**
   * Monta el footer en el contenedor correspondiente
   */
  mountFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
      // Limpiar el contenedor antes de montar el footer
      footerContainer.innerHTML = '';
      
      // Crear y montar el footer
      const footer = new Footer();
      footerContainer.appendChild(footer.render());
      
      // Aseguramos que el footer esté al final de la página
      document.body.style.display = 'flex';
      document.body.style.flexDirection = 'column';
      document.body.style.minHeight = '100vh';
      document.getElementById('app').style.flex = '1';
    }
  }
}
