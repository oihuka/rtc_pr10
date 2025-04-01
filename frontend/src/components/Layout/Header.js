import authService from '../../utils/auth.js';
import LogoutButton from '../Auth/LogoutButton.js';
import '../../styles/components/header.css';

/**
 * Componente de cabecera de la aplicación
 */
export default class Header {
  /**
   * @param {string} containerId - ID del contenedor donde se renderizará el header
   */
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.logoutButton = null;
    this.isMenuOpen = false;
  }
  
  /**
   * Inicializa el header
   */
  async init() {
    this.container = document.getElementById(this.containerId);
    
    if (!this.container) {
      console.error(`No se encontró el contenedor con ID: ${this.containerId}`);
      return;
    }
    
    this.render();
    this.setupEventListeners();
    
    // Inicializar botón de logout si el usuario está autenticado
    if (authService.isAuthenticated()) {
      this.logoutButton = new LogoutButton(
        'logout-button-container',
        this.handleLogout.bind(this)
      );
      this.logoutButton.init();
    }
  }
  
  /**
   * Renderiza el header
   */
  render() {
    const user = authService.getCurrentUser();
    console.log("Usuario en Header:", user); // Log temporal
    
    // Asegúrate de usar valores predeterminados para evitar "undefined"
    const userName = user?.name || "Usuario";
    const userAvatar = user?.avatar || "/assets/default-avatar.png";
    
    const isAuthenticated = authService.isAuthenticated();
    
    this.container.innerHTML = `
      <header class="main-header">
        <div class="container">
          <div class="header-content">
            <div class="logo">
              <a href="/">
                <img src="/assets/images/logo.svg" alt="EventHub">
                <span>EventHub</span>
              </a>
            </div>
            
            <nav class="main-nav">
              <ul class="nav-list">
                <li class="nav-item">
                  <a href="/" class="nav-link">Inicio</a>
                </li>
                ${isAuthenticated ? `
                  <li class="nav-item">
                    <a href="/my-events.html" class="nav-link">Mis Eventos</a>
                  </li>
                  <li class="nav-item">
                    <a href="/create-event.html" class="nav-link">Crear Evento</a>
                  </li>
                ` : ''}
              </ul>
            </nav>
            
            <div class="header-actions">
              ${isAuthenticated ? `
                <div class="user-menu">
                  <button class="user-menu-button">
                    <img src="${userAvatar}" alt="${userName}" class="user-avatar">
                    <span class="user-name">${userName}</span>
                    <i class="fas fa-chevron-down"></i>
                  </button>
                  <div class="user-dropdown">
                    <ul>
                      <li>
                        <a href="/profile.html">
                          <i class="fas fa-user"></i> Mi Perfil
                        </a>
                      </li>
                      <li>
                        <a href="/my-events.html">
                          <i class="fas fa-calendar"></i> Mis Eventos
                        </a>
                      </li>
                      <li id="logout-button-container"></li>
                    </ul>
                  </div>
                </div>
              ` : `
                <div class="auth-buttons">
                  <a href="/login.html" class="btn btn-outline btn-sm">Iniciar Sesión</a>
                  <a href="/register.html" class="btn btn-primary btn-sm">Registrarse</a>
                </div>
              `}
              
              <button class="mobile-menu-toggle" aria-label="Menú">
                <i class="fas fa-bars"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div class="mobile-menu">
          <div class="container">
            <ul class="mobile-nav-list">
              <li class="mobile-nav-item">
                <a href="/" class="mobile-nav-link">Inicio</a>
              </li>
              ${isAuthenticated ? `
                <li class="mobile-nav-item">
                  <a href="/my-events.html" class="mobile-nav-link">Mis Eventos</a>
                </li>
                <li class="mobile-nav-item">
                  <a href="/create-event.html" class="mobile-nav-link">Crear Evento</a>
                </li>
                <li class="mobile-nav-item">
                  <a href="/profile.html" class="mobile-nav-link">Mi Perfil</a>
                </li>
                <li class="mobile-nav-item" id="mobile-logout-container">
                  <button class="mobile-nav-link logout-link">
                    <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                  </button>
                </li>
              ` : `
                <li class="mobile-nav-item">
                  <a href="/login.html" class="mobile-nav-link">Iniciar Sesión</a>
                </li>
                <li class="mobile-nav-item">
                  <a href="/register.html" class="mobile-nav-link">Registrarse</a>
                </li>
              `}
            </ul>
          </div>
        </div>
      </header>
    `;
  }
  
  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Toggle menú de usuario
    const userMenuButton = this.container.querySelector('.user-menu-button');
    if (userMenuButton) {
      userMenuButton.addEventListener('click', this.toggleUserMenu.bind(this));
      
      // Cerrar menú al hacer clic fuera
      document.addEventListener('click', (event) => {
        const userMenu = this.container.querySelector('.user-menu');
        if (userMenu && !userMenu.contains(event.target)) {
          userMenu.classList.remove('active');
        }
      });
    }
    
    // Toggle menú móvil
    const mobileMenuToggle = this.container.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
    }
    
    // Botón de logout en menú móvil
    const mobileLogoutButton = this.container.querySelector('.logout-link');
    if (mobileLogoutButton) {
      mobileLogoutButton.addEventListener('click', this.handleLogout.bind(this));
    }
  }
  
  /**
   * Toggle menú de usuario
   * @param {Event} event - Evento de clic
   */
  toggleUserMenu(event) {
    event.stopPropagation();
    const userMenu = this.container.querySelector('.user-menu');
    if (userMenu) {
      userMenu.classList.toggle('active');
    }
  }
  
  /**
   * Toggle menú móvil
   */
  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    const mobileMenu = this.container.querySelector('.mobile-menu');
    const menuToggle = this.container.querySelector('.mobile-menu-toggle i');
    
    if (mobileMenu && menuToggle) {
      if (this.isMenuOpen) {
        mobileMenu.classList.add('active');
        menuToggle.classList.remove('fa-bars');
        menuToggle.classList.add('fa-times');
      } else {
        mobileMenu.classList.remove('active');
        menuToggle.classList.remove('fa-times');
        menuToggle.classList.add('fa-bars');
      }
    }
  }
  
  /**
   * Maneja el cierre de sesión
   */
  handleLogout() {
    // El componente LogoutButton se encarga de la lógica de logout
    // Aquí solo cerramos los menús
    const userMenu = this.container.querySelector('.user-menu');
    if (userMenu) {
      userMenu.classList.remove('active');
    }
    
    const mobileMenu = this.container.querySelector('.mobile-menu');
    if (mobileMenu) {
      mobileMenu.classList.remove('active');
    }
  }
  
  /**
   * Actualiza el header después de cambios en la autenticación
   */
  update() {
    this.render();
    this.setupEventListeners();
    
    // Reinicializar botón de logout si el usuario está autenticado
    if (authService.isAuthenticated()) {
      this.logoutButton = new LogoutButton(
        'logout-button-container',
        this.handleLogout.bind(this)
      );
      this.logoutButton.init();
    }
  }
}
