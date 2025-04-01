import apiService from '../../api/apiService.js';
import authService from '../../utils/auth.js';
import Button from '../UI/Button.js';
import Notification from '../UI/Notification.js';
import { 
  validateEmail, 
  validatePassword, 
  validatePasswordMatch,
  validateRequired
} from '../../utils/validators.js';

/**
 * Componente para el formulario de registro
 */
export default class RegisterForm {
  /**
   * @param {string} containerId - ID del contenedor donde se renderizará el formulario
   * @param {function} onSuccess - Función a ejecutar al registrarse con éxito
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
        <h2>Crear Cuenta</h2>
        <form id="register-form" class="auth-form">
          <div class="form-group">
            <label for="name">Nombre completo</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              class="form-control" 
              required 
              placeholder="Tu nombre completo"
            >
            <div class="form-error" id="name-error"></div>
          </div>
          
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
          
          <div class="form-group form-check">
            <input type="checkbox" id="terms" name="terms" class="form-check-input" required>
            <label for="terms" class="form-check-label">
              Acepto los <a href="/terms.html" target="_blank">términos y condiciones</a>
            </label>
            <div class="form-error" id="terms-error"></div>
          </div>
          
          <div id="register-button-container" class="form-button-container"></div>
          
          <div class="auth-links">
            <a href="/login.html" class="auth-link">¿Ya tienes cuenta? Inicia sesión</a>
          </div>
        </form>
      </div>
    `;
    
    // Crear botón de envío
    this.submitButton = new Button(
      'Crear Cuenta',
      'primary',
      this.handleSubmit.bind(this),
      false,
      'fas fa-user-plus'
    );
    
    const buttonContainer = document.getElementById('register-button-container');
    if (buttonContainer) {
      buttonContainer.appendChild(this.submitButton.render());
    }
  }
  
  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    this.form = document.getElementById('register-form');
    
    if (!this.form) return;
    
    // Validación en tiempo real
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('terms');
    
    if (nameInput) {
      nameInput.addEventListener('blur', () => this.validateName());
      nameInput.addEventListener('input', () => this.clearError('name'));
    }
    
    if (emailInput) {
      emailInput.addEventListener('blur', () => this.validateEmail());
      emailInput.addEventListener('input', () => this.clearError('email'));
    }
    
    if (passwordInput) {
      passwordInput.addEventListener('blur', () => this.validatePassword());
      passwordInput.addEventListener('input', () => {
        this.clearError('password');
        if (confirmPasswordInput.value) {
          this.validatePasswordMatch();
        }
      });
    }
    
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('blur', () => this.validatePasswordMatch());
      confirmPasswordInput.addEventListener('input', () => this.clearError('confirmPassword'));
    }
    
    if (termsCheckbox) {
      termsCheckbox.addEventListener('change', () => this.validateTerms());
    }
    
    // Toggle de contraseñas
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        const passwordField = e.target.closest('.password-input-container').querySelector('input');
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        
        const icon = toggle.querySelector('i');
        if (icon) {
          icon.className = type === 'password' ? 'far fa-eye' : 'far fa-eye-slash';
        }
      });
    });
    
    // Envío del formulario
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }
  
  /**
   * Valida el nombre
   * @returns {boolean} - true si es válido, false si no
   */
  validateName() {
    const nameInput = document.getElementById('name');
    const nameError = document.getElementById('name-error');
    
    if (!nameInput || !nameError) return false;
    
    const name = nameInput.value.trim();
    
    if (!validateRequired(name)) {
      nameError.textContent = 'El nombre es obligatorio';
      nameInput.classList.add('is-invalid');
      return false;
    }
    
    if (name.length < 3) {
      nameError.textContent = 'El nombre debe tener al menos 3 caracteres';
      nameInput.classList.add('is-invalid');
      return false;
    }
    
    nameInput.classList.remove('is-invalid');
    nameInput.classList.add('is-valid');
    nameError.textContent = '';
    return true;
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
    
    if (!validateRequired(email)) {
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
    
    if (!validateRequired(password)) {
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
    
    if (!validateRequired(confirmPassword)) {
      confirmPasswordError.textContent = 'Debes confirmar tu contraseña';
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
   * Valida la aceptación de términos
   * @returns {boolean} - true si se aceptaron, false si no
   */
  validateTerms() {
    const termsCheckbox = document.getElementById('terms');
    const termsError = document.getElementById('terms-error');
    
    if (!termsCheckbox || !termsError) return false;
    
    if (!termsCheckbox.checked) {
      termsError.textContent = 'Debes aceptar los términos y condiciones';
      return false;
    }
    
    termsError.textContent = '';
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
    const isNameValid = this.validateName();
    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();
    const isPasswordMatchValid = this.validatePasswordMatch();
    const isTermsValid = this.validateTerms();
    
    if (!isNameValid || !isEmailValid || !isPasswordValid || !isPasswordMatchValid || !isTermsValid) {
      return;
    }
    
    try {
      // Deshabilitar botón mientras se procesa
      this.submitButton.update(true, 'Creando cuenta...');
      
      // Obtener valores
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      
      // Registrar usuario
      const response = await apiService.post('/auth/register', {
        name,
        email,
        password
      });
      
      if (response.success) {
        Notification.show('¡Cuenta creada correctamente!', 'success');
        
        // Iniciar sesión automáticamente
        await authService.login(email, password);
        
        if (this.onSuccess) {
          this.onSuccess();
        } else {
          // Redirigir a la página principal
          window.location.href = '/';
        }
      } else {
        this.submitButton.update(false, 'Crear Cuenta');
        Notification.show(response.message || 'Error al crear la cuenta', 'error');
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      this.submitButton.update(false, 'Crear Cuenta');
      
      if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
        Notification.show('El correo electrónico ya está registrado', 'error');
      } else {
        Notification.show('Error al crear la cuenta', 'error');
      }
    }
  }
}
