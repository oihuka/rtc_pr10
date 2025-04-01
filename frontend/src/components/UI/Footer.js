/**
 * Componente Footer para el pie de página
 */
export default class Footer {
  constructor() {
    this.element = null;
  }
  
  /**
   * Renderiza el footer
   * @returns {HTMLElement} - Elemento del footer
   */
  render() {
    const footer = document.createElement('footer');
    footer.className = 'main-footer';
    
    const currentYear = new Date().getFullYear();
    
    footer.innerHTML = `
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <h2>EventosApp</h2>
            <p>Tu plataforma para descubrir y gestionar eventos</p>
          </div>
          
          <div class="footer-links">
            <h3>Enlaces rápidos</h3>
            <ul>
              <li><a href="/">Inicio</a></li>
              <li><a href="/events.html">Eventos</a></li>
              <li><a href="/login.html">Iniciar Sesión</a></li>
              <li><a href="/register.html">Registrarse</a></li>
            </ul>
          </div>
          
          <div class="footer-contact">
            <h3>Contacto</h3>
            <p><i class="fas fa-envelope"></i> info@eventosapp.com</p>
            <p><i class="fas fa-phone"></i> +34 123 456 789</p>
            <div class="social-links">
              <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
              <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
              <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
              <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; ${currentYear} EventosApp. Todos los derechos reservados.</p>
        </div>
      </div>
    `;
    
    this.element = footer;
    return footer;
  }
}