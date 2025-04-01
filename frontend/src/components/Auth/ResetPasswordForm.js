import apiService from '../../api/apiService.js';
import Button from '../UI/Button.js';
import Notification from '../UI/Notification.js';
import { validatePassword, validatePasswordMatch } from '../../utils/validators.js';

/**
 * Componente para el formulario de restablecimiento de contraseña
 */
export default class ResetPasswordForm {
  /**
   * @param {string} containerId - ID del contenedor donde se renderizará el formulario
   * @param {string} token - Token de restablecimiento
   * @param {function} onSuccess - Función a ejecutar al restablecer con éxito
   */
  constructor(containerId, token, onSuccess = null) {
    this.containerId = containerId;
    this.container = null;
    this.form = null;
    this.submitButton = null;
    this.token = token;
    this.onSuccess = onSuccess;
    this.isReset = false;
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
    
    if (!this.token) {
      this.renderError('Token inválido o expirado');
      return;
    }
    
    this.render();
    this.setupEventListeners();
  }
  
  /**
   * Renderiza el formulario
   */
  render() {
    if (this.isReset) {
      this.renderSuccessMessage();
      return;
    }
    
    this.container.innerHTML = `
      <div class="auth-form-container">
        <h2>Restablecer Contraseña</h2>
        <p class="auth-form-description">
          Ingresa tu nueva contraseña para restablecer tu cuenta.
        </p>
        <form id="reset-password-form" class="auth-form">
          <div class="form-group">
            <label for="password">Nueva contraseña</label>
            <div class="password-input-container">
              <input 
                type="password" 
                id="password" 
                name="password" 
                class="form-control" 
                required 
                placeholder="Mínimo 6 caracteres"
              >
              <button type="button" class="password-toggle" aria-label="Mostrar contraseña">
                <i class="far fa-eye"></i>
              </button>
            </div>
            <div class="form-error" id="password-error"></div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirmar contraseña</label>
            <div class="password-input-container">
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                class="form-control" 
                required 
                placeholder="Repite tu contraseña"
              >
              <button type="button" class="password-toggle" aria-label="Mostrar contraseña">
                <i class="far fa-eye"></i>
              </button>
            </div>
            <div class="form-error" id="confirmPassword-error"></div>
          </div>
          
          <div id="reset-password-button-container" class="form-button-container"></div>
        </form>
      </div>
    `;
    
    // Crear botón de envío
    this.submitButton = new Button(
      'Restablecer Contraseña',
      'primary',
      this.handleSubmit.bind(this),
      false,
      'fas fa-key'
    );
    
    const buttonContainer = document.getElementById('reset-password-button-container');
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
          <h2>¡Contraseña Restablecida!</h2>
          <p>
            Tu contraseña ha sido restablecida correctamente.
            Ahora puedes iniciar sesión con tu nueva contraseña.
          </p>
          <a href="/login.html" class="btn btn-primary">
            <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
          </a>
        </div>
      </div>
    `;
  }
  
  /**
   * Renderiza un mensaje de error
   * @param {string} message - Mensaje de error
   */
  renderError(message) {
    this.container.innerHTML = `
      <div class="auth-form-container">
        <div class="auth-error-message">
          <i class="fas fa-exclamation-circle error-icon"></i>
          <h2>Error</h2>
          <p>${message}</p>
          <a href="/forgot-password.html" class="btn btn-primary">
            <i class="fas fa-redo"></i> Solicitar nuevo enlace
          </a>
        </div>
      </div>
    `;
  }
  
  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    this.form = document.getElementById('reset-password-form');
    
    if (!this.form) return;
    
    // Validación en tiempo real
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (passwordInput) {
      passwordInput.addEventListener('blur', () => this.validatePassword());
      passwordInput.addEventListener('input', () => this.clearError('password'));
    }
    
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('blur', () => this.validatePasswordMatch());
      confirmPasswordInput.addEventListener('input', () => this.clearError('confirmPassword'));
    }
    
    // Mostrar/ocultar contraseña
    const toggleButtons = document.querySelectorAll('.password-toggle');
    
    toggleButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const input = e.currentTarget.previousElementSibling;
        const icon = e.currentTarget.querySelector('i');
        
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          input.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      });
    });
    
    // Envío del formulario
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
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
    
    if (!validatePassword(password)) {
      passwordError.textContent = 'La contraseña debe tener al menos 6 caracteres';
      passwordInput.classList.add('is-invalid');
      return false;
    }
    
    passwordInput.classList.remove('is-invalid');
    passwordInput.classList.add('is-valid');
    passwordError.textContent = '';
    return true;
  }
  
  /**
   * Valida que las contraseñas coincidan
   * @returns {boolean} - true si coinciden, false si no
   */
  validatePasswordMatch() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const confirmPasswordError = document.getElementById('confirmPassword-error');
    
    if (!passwordInput || !confirmPasswordInput || !confirmPasswordError) return false;
    
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (!confirmPassword) {
      confirmPasswordError.textContent = 'Debes confirmar la contraseña';
      confirmPasswordInput.classList.add('is-invalid');
      return false;
    }
    
    if (!validatePasswordMatch(password, confirmPassword)) {
      confirmPasswordError.textContent = 'Las contraseñas no coinciden';
      confirmPasswordInput.classList.add('is-invalid');
      return false;
    }
    
    confirmPasswordInput.classList.remove('is-invalid');
    confirmPasswordInput.classList.add('is-valid');
    confirmPasswordError.textContent = '';
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
    
    // Validar contraseñas
    const isPasswordValid = this.validatePassword();
    const isPasswordMatchValid = this.validatePasswordMatch();
    
    if (!isPasswordValid || !isPasswordMatchValid) {
      return;
    }
    
    try {
      // Deshabilitar botón mientras se procesa
      this.submitButton.update(true, 'Restableciendo...');
      
      // Obtener contraseña
      const password = document.getElementById('password').value;
      
      // Enviar petición
      const response = await apiService.post('/auth/reset-password', {
        token: this.token,
        password
      });
      
      if (response.success) {
        this.isReset = true;
        this.render(); // Mostrar mensaje de éxito
        
        if (this.onSuccess) {
          this.onSuccess();
        }
      } else {
        this.submitButton.update(false, 'Restablecer Contraseña');
        
        if (response.message.includes('token') || response.message.includes('expirado')) {
          this.renderError(response.message || 'Token inválido o expirado');
        } else {
          Notification.show(response.message || 'Error al restablecer la contraseña', 'error');
        }
      }
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      this.submitButton.update(false, 'Restablecer Contraseña');
      
      if (error.message.includes('token') || error.message.includes('expirado')) {
        this.renderError('Token inválido o expirado');
      } else {
        Notification.show('Error al restablecer la contraseña', 'error');
      }
    }
  }
}