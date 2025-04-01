import apiService from '../../api/apiService.js';
import authService from '../../utils/auth.js';
import Button from '../UI/Button.js';
import Notification from '../UI/Notification.js';
import { validateEmail, validatePassword } from '../../utils/validators.js';

/**
 * Componente para el formulario de inicio de sesión
 */
export default class LoginForm {
  /**
   * @param {string} containerId - ID del contenedor donde se renderizará el formulario
   * @param {function} onSuccess - Función a ejecutar al iniciar sesión con éxito
   */
  constructor(containerId, onSuccess = null) {
    this.containerId = containerId;
    this.container = null;
    this.form = null;
    this.submitButton = null;
    this.onSuccess = onSuccess;
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
    this.container.innerHTML = `
      <div class="auth-form-container">
        <h2>Iniciar Sesión</h2>
        <form id="login-form" class="auth-form">
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
          
          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="password-input-container">
              <input 
                type="password" 
                id="password" 
                name="password" 
                class="form-control" 
                required 
                placeholder="Tu contraseña"
              >
              <button type="button" class="password-toggle" aria-label="Mostrar contraseña">
                <i class="far fa-eye"></i>
              </button>
            </div>
            <div class="form-error" id="password-error"></div>
          </div>
          
          <div class="form-group form-check">
            <input type="checkbox" id="remember" name="remember" class="form-check-input">
            <label for="remember" class="form-check-label">Recordarme</label>
          </div>
          
          <div id="login-button-container" class="form-button-container"></div>
          
          <div class="auth-links">
            <a href="/forgot-password.html" class="auth-link">¿Olvidaste tu contraseña?</a>
            <a href="/register.html" class="auth-link">¿No tienes cuenta? Regístrate</a>
          </div>
        </form>
      </div>
    `;
    
    // Crear botón de envío
    this.submitButton = new Button(
      'Iniciar Sesión',
      'primary',
      this.handleSubmit.bind(this),
      false,
      'fas fa-sign-in-alt'
    );
    
    const buttonContainer = document.getElementById('login-button-container');
    if (buttonContainer) {
      buttonContainer.appendChild(this.submitButton.render());
    }
  }
  
  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    this.form = document.getElementById('login-form');
    
    if (!this.form) return;
    
    // Validación en tiempo real
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) {
      emailInput.addEventListener('blur', () => this.validateEmail());
      emailInput.addEventListener('input', () => this.clearError('email'));
    }
    
    if (passwordInput) {
      passwordInput.addEventListener('blur', () => this.validatePassword());
      passwordInput.addEventListener('input', () => this.clearError('password'));
    }
    
    // Toggle de contraseña
    const passwordToggle = document.querySelector('.password-toggle');
    if (passwordToggle && passwordInput) {
      passwordToggle.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = passwordToggle.querySelector('i');
        if (icon) {
          icon.className = type === 'password' ? 'far fa-eye' : 'far fa-eye-slash';
        }
      });
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
   * Valida la contraseña
   * @returns {boolean} - true si es válida, false si no
   */
  validatePassword() {
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('password-error');
    
    if (!passwordInput || !passwordError) return false;
    
    const password = passwordInput.value;
    
    if (!password) {
      passwordError.textContent = 'La contraseña es obligatoria';
      passwordInput.classList.add('is-invalid');
      return false;
    }
    
    passwordInput.classList.remove('is-invalid');
    passwordInput.classList.add('is-valid');
    passwordError.textContent = '';
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
    
    // Validar formulario
    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    try {
      // Deshabilitar botón mientras se procesa
      this.submitButton.update(true, 'Iniciando sesión...');
      
      // Obtener valores
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const remember = document.getElementById('remember').checked;
      
      // Iniciar sesión
      const success = await authService.login(email, password, remember);
      
      if (success) {
        Notification.show('¡Bienvenido de nuevo!', 'success');
        
        // Redirigir a la página principal (con header actualizado)
        window.location.href = '/';
        
        // Asegurar que la interfaz refleje el estado de autenticación
        const event = new CustomEvent('user:login');
        document.dispatchEvent(event);
      } else {
        this.submitButton.update(false, 'Iniciar Sesión');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      this.submitButton.update(false, 'Iniciar Sesión');
      Notification.show('Error al iniciar sesión. Verifica tus credenciales.', 'error');
    }
  }
}
