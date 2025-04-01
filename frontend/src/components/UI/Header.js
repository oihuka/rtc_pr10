import authService from '../../utils/auth.js';

/**
 * Componente Header para la navegación principal
 */
export default class Header {
  constructor() {
    this.element = null;
    this.user = authService.getCurrentUser();
  }
  
  /**
   * Renderiza el header
   * @returns {HTMLElement} - Elemento del header
   */
  render() {
    const header = document.createElement('header');
    header.className = 'main-header';
    
    header.innerHTML = `
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <a href="/">
              <h1>EventosApp</h1>
            </a>
          </div>
          
          <nav class="main-nav">
            <ul class="nav-links">
              <li><a href="/" class="nav-link">Inicio</a></li>
              <li><a href="/events.html" class="nav-link">Eventos</a></li>
              ${this.user ? `
                <li class="dropdown">
                  <a href="#" class="nav-link dropdown-toggle">
                    <img src="${this.user.avatar}" alt="${this.user.name}" class="avatar-mini">
                    ${this.user.name}
                  </a>
                  <ul class="dropdown-menu">
                    <li><a href="/profile.html">Mi Perfil</a></li>
                    <li><a href="/my-events.html">Mis Eventos</a></li>
                    <li><a href="#" id="logout-btn">Cerrar Sesión</a></li>
                  </ul>
                </li>
              ` : `
                <li><a href="/login.html" class="nav-link">Iniciar Sesión</a></li>
                <li><a href="/register.html" class="btn btn-primary">Registrarse</a></li>
              `}
            </ul>
          </nav>
          
          <button class="mobile-menu-btn">
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>
    `;
    
    this.element = header;
    this.setupEventListeners();
    return header;
  }
  
  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Botón de logout
    const logoutBtn = this.element.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        authService.logout();
      });
    }
    
    // Menú móvil
    const mobileMenuBtn = this.element.querySelector('.mobile-menu-btn');
    const mainNav = this.element.querySelector('.main-nav');
    
    if (mobileMenuBtn && mainNav) {
      mobileMenuBtn.addEventListener('click', () => {
        mainNav.classList.toggle('show');
      });
    }
    
    // Dropdown
    const dropdownToggles = this.element.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const parent = toggle.parentElement;
        parent.classList.toggle('show-dropdown');
      });
    });
  }
}
