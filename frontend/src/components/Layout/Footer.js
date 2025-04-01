import '../../styles/components/footer.css';

/**
 * Componente de pie de página de la aplicación
 */
export default class Footer {
  /**
   * @param {string} containerId - ID del contenedor donde se renderizará el footer
   */
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
  }
  
  /**
   * Inicializa el footer
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
   * Renderiza el footer
   */
  render() {
    const currentYear = new Date().getFullYear();
    
    this.container.innerHTML = `
      <footer class="main-footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-logo">
              <img src="/assets/images/logo.svg" alt="EventHub">
              <span>EventHub</span>
            </div>
            
            <div class="footer-section">
              <h3>Navegación</h3>
              <ul>
                <li><a href="/">Inicio</a></li>
                <li><a href="/login.html">Iniciar Sesión</a></li>
                <li><a href="/register.html">Registrarse</a></li>
              </ul>
            </div>
              
            <div class="footer-section">
              <h3>Recursos</h3>
              <ul>
                <li><a href="/terms.html" onclick="window.open('/terms.html', '_blank')">Términos y Condiciones</a></li>
                <li><a href="/privacy.html" onclick="window.open('/privacy.html', '_blank')">Política de Privacidad</a></li>
                <li><a href="/help.html" onclick="window.open('/help.html', '_blank')">Ayuda</a></li>
              </ul>
            </div>
              
            <div class="footer-section">
              <h3>Contacto</h3>
              <ul>
                <li><a href="mailto:info@eventhub.com" onclick="window.open('mailto:info@eventhub.com', '_blank')">info@eventhub.com</a></li>
                <li><a href="tel:+123456789" onclick="window.open('tel:+123456789', '_blank')">+1 234 567 89</a></li>
              </ul>
              
              <div class="social-links">
                <a href="https://www.facebook.com" aria-label="Facebook" onclick="window.open('https://www.facebook.com', '_blank')"><i class="fab fa-facebook-f"></i></a>
                <a href="https://www.twitter.com" aria-label="Twitter" onclick="window.open('https://www.twitter.com', '_blank')"><i class="fab fa-twitter"></i></a>
                <a href="https://www.instagram.com" aria-label="Instagram" onclick="window.open('https://www.instagram.com', '_blank')"><i class="fab fa-instagram"></i></a>
                <a href="https://www.linkedin.com" aria-label="LinkedIn" onclick="window.open('https://www.linkedin.com', '_blank')"><i class="fab fa-linkedin-in"></i></a>
              </div>
            </div>
          </div>
          
          <div class="footer-bottom">
            <p>&copy; ${currentYear} EventHub. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    `;
  }
}
