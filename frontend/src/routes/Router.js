import App from '../App.js';
import HomePage from '../pages/HomePage.js';
import EventPage from '../pages/EventPage.js';
import CreateEventPage from '../pages/CreateEventPage.js';
import EditEventPage from '../pages/EditEventPage.js';
import LoginPage from '../pages/LoginPage.js';
import RegisterPage from '../pages/RegisterPage.js';
import ProfilePage from '../pages/ProfilePage.js';
import ForgotPasswordPage from '../pages/ForgotPasswordPage.js';
import ResetPasswordPage from '../pages/ResetPasswordPage.js';
import MyEventsPage from '../pages/MyEventsPage.js';
import NotFoundPage from '../pages/NotFoundPage.js';

/**
 * Router de la aplicación
 */
export default class Router {
  /**
   * @param {App} app - Instancia de la aplicación
   */
  constructor(app) {
    this.app = app;
    this.routes = this.defineRoutes();
  }
  
  /**
   * Define las rutas de la aplicación
   * @returns {object} - Objeto con las rutas
   */
  defineRoutes() {
    return {
      '/': HomePage,
      '/index.html': HomePage,
      '/event.html': EventPage,
      '/create-event.html': CreateEventPage,
      '/edit-event.html': EditEventPage,
      '/login.html': LoginPage,
      '/register.html': RegisterPage,
      '/profile.html': ProfilePage,
      '/forgot-password.html': ForgotPasswordPage,
      '/reset-password.html': ResetPasswordPage,
      '/my-events.html': MyEventsPage
    };
  }
  
  /**
   * Inicializa el router
   */
  init() {
    // Cargar la página correspondiente a la URL actual
    this.loadCurrentPage();
    
    // Manejar navegación con botones de atrás/adelante
    window.addEventListener('popstate', () => {
      this.loadCurrentPage();
    });
  }
  
  /**
   * Carga la página correspondiente a la URL actual
   */
  loadCurrentPage() {
    const path = window.location.pathname;
    const PageClass = this.routes[path] || NotFoundPage;
    
    this.app.loadPage(PageClass);
  }
  
  /**
   * Navega a una ruta específica
   * @param {string} path - Ruta a la que navegar
   * @param {object} options - Opciones adicionales
   */
  navigateTo(path, options = {}) {
    // Actualizar la URL
    window.history.pushState({}, '', path);
    
    // Cargar la página correspondiente
    const PageClass = this.routes[path] || NotFoundPage;
    this.app.loadPage(PageClass, options);
  }
}
