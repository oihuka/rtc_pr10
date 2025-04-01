import apiService from '../../api/apiService.js';
import Button from '../UI/Button.js';
import Notification from '../UI/Notification.js';
import { validateEmail } from '../../utils/validators.js';

/**
 * Componente para el formulario de recuperación de contraseña
 */
export default class ForgotPasswordForm {
  /**
   * @param {string} containerId - ID del contenedor donde se renderizará el formulario
   * @param {function} onSuccess - Función a ejecutar al enviar con éxito
   */
  constructor(containerId, onSuccess = null) {
    this.containerId = containerId;
    this.container = null;
    this.form = null;
    this.submitButton = null;
    this.onSuccess = onSuccess;
    this.isSent = false;
  }
  
  /**
   * Inicializa el formulario
   */
  init() {
    this.container = document.getElementById(this.containerId);
    
    if (!this.container) {
      console.error(`No se encontró el contenedor con ID: ${this.containerId}`);
      return;
    }
    
    this.render();
    this.setupEventListeners();
  }
  
  /**
   * Renderiza el formulario
   */
  render() {
    if (this.isSent) {
      this.renderSuccessMessage();
      return;
    }
    
    this.container.innerHTML = `
      <div class="auth-form-container">
        <h2>Recuperar Contraseña</h2>
        <p class="auth-form-description">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        <form id="forgot-password-form" class="auth-form">
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              class="form-control" 
              required 
              placeholder="tu@email.com"
            >
            <div class="form-error" id="email-error"></div>
          </div>
          
          <div id="forgot-password-button-container" class="form-button-container"></div>
          
          <div class="auth-links">
            <a href="/login.html" class="auth-link">Volver al inicio de sesión</a>
          </div>
        </form>
      </div>
    `;
    
    // Crear botón de envío
    this.submitButton = new Button(
      'Enviar Enlace',
      'primary',
      this.handleSubmit.bind(this),
      false,
      'fas fa-paper-plane'
    );
    
    const buttonContainer = document.getElementById('forgot-password-button-container');
    if (buttonContainer) {
      buttonContainer.appendChild(this.submitButton.render());
    }
  }
  
  /**
   * Renderiza el mensaje de éxito
   */
  renderSuccessMessage() {
    this.container.innerHTML = `
      <div class="auth-form-container">
        <div class="auth-success-message">
          <i class="fas fa-check-circle success-icon"></i>
          <h2>Correo Enviado</h2>
          <p>
            Hemos enviado un enlace de recuperación a tu correo electrónico.
            Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
          </p>
          <p class="small-text">
            Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
          </p>
          <a href="/login.html" class="btn btn-primary">
            <i class="fas fa-arrow-left"></i> Volver al inicio de sesión
          </a>
        </div>
      </div>
    `;
  }
  
  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    this.form = document.getElementById('forgot-password-form');
    
    if (!this.form) return;
    
    // Validación en tiempo real
    const emailInput = document.getElementById('email');
    
    if (emailInput) {
      emailInput.addEventListener('blur', () => this.validateEmail());
      emailInput.addEventListener('input', () => this.clearError('email'));
    }
    
    // Envío del formulario
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }
  
  /**
   * Valida el email
   * @returns {boolean} - true si es válido, false si no
   */
  validateEmail() {
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    
    if (!emailInput || !emailError) return false;
    
    const email = emailInput.value.trim();
    
    if (!email) {
      emailError.textContent = 'El correo electrónico es obligatorio';
      emailInput.classList.add('is-invalid');
      return false;
    }
    
    if (!validateEmail(email)) {
      emailError.textContent = 'Ingresa un correo electrónico válido';
      emailInput.classList.add('is-invalid');
      return false;
    }
    
    emailInput.classList.remove('is-invalid');
    emailInput.classList.add('is-valid');
    emailError.textContent = '';
    return true;
  }
  
  /**
   * Limpia el error de un campo
   * @param {string} field - Nombre del campo
   */
  clearError(field) {
    const input = document.getElementById(field);
    const error = document.getElementById(`${field}-error`);
    
    if (input && error) {
      input.classList.remove('is-invalid');
      error.textContent = '';
    }
  }
  
  /**
   * Maneja el envío del formulario
   * @param {Event} event - Evento submit
   */
  async handleSubmit(event) {
    event.preventDefault();
    
    // Validar email
    const isEmailValid = this.validateEmail();
    
    if (!isEmailValid) {
      return;
    }
    
    try {
      // Deshabilitar botón mientras se procesa
      this.submitButton.update(true, 'Enviando...');
      
      // Obtener email
      const email = document.getElementById('email').value.trim();
      
      // Enviar petición
      const response = await apiService.post('/auth/forgot-password', { email });
      
      if (response.success) {
        this.isSent = true;
        this.render(); // Mostrar mensaje de éxito
        
        if (this.onSuccess) {
          this.onSuccess(email);
        }
      } else {
        this.submitButton.update(false, 'Enviar Enlace');
        Notification.show(response.message || 'Error al enviar el enlace', 'error');
      }
    } catch (error) {
      console.error('Error al solicitar recuperación de contraseña:', error);
      this.submitButton.update(false, 'Enviar Enlace');
      
      // Mostrar mensaje genérico (por seguridad no indicamos si el email existe o no)
      Notification.show('Ha ocurrido un error. Inténtalo de nuevo más tarde.', 'error');
    }
  }
}
