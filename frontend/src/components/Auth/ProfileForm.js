import apiService from '../../api/apiService.js';
import authService from '../../utils/auth.js';
import Button from '../UI/Button.js';
import Notification from '../UI/Notification.js';
import { validateEmail, validatePassword, validatePasswordMatch } from '../../utils/validators.js';

/**
 * Componente para el formulario de perfil de usuario
 */
export default class ProfileForm {
  /**
   * @param {string} containerId - ID del contenedor donde se renderizará el formulario
   * @param {function} onSuccess - Función a ejecutar al actualizar con éxito
   */
  constructor(containerId, onSuccess = null) {
    this.containerId = containerId;
    this.container = null;
    this.form = null;
    this.submitButton = null;
    this.onSuccess = onSuccess;
    this.user = authService.getCurrentUser();
    this.avatarPreview = null;
  }
  
  /**
   * Inicializa el formulario
   */
  async init() {
    this.container = document.getElementById(this.containerId);
    
    if (!this.container) {
      console.error(`No se encontró el contenedor con ID: ${this.containerId}`);
      return;
    }
    
    // Si no hay usuario autenticado, redirigir al login
    if (!this.user) {
      window.location.href = '/login.html';
      return;
    }
    
    // Obtener datos actualizados del usuario
    try {
      const response = await apiService.get('/auth/me', true);
      
      if (response.success) {
        this.user = response.data;
        authService.updateUserData(this.user);
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }
    
    this.render();
    this.setupEventListeners();
  }
  
  /**
   * Renderiza el formulario
   */
  render() {
    this.container.innerHTML = `
      <div class="profile-form-container">
        <h2>Mi Perfil</h2>
        <form id="profile-form" class="profile-form">
          <div class="avatar-container">
            <div class="avatar-preview" id="avatar-preview">
              <img src="${this.user.avatar || '/assets/default-avatar.png'}" alt="Avatar" id="avatar-image">
            </div>
            <div class="avatar-upload">
              <label for="avatar" class="btn btn-outline btn-sm">
                <i class="fas fa-camera"></i> Cambiar avatar
              </label>
              <input type="file" id="avatar" name="avatar" accept="image/*" class="hidden-input">
            </div>
          </div>
          
          <div class="form-group">
            <label for="name">Nombre completo</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              class="form-control" 
              required 
              value="${this.user.name || ''}"
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
              value="${this.user.email || ''}"
            >
            <div class="form-error" id="email-error"></div>
          </div>
          
          <div class="form-divider">
            <span>Cambiar contraseña (opcional)</span>
          </div>
          
          <div class="form-group">
            <label for="currentPassword">Contraseña actual</label>
            <div class="password-input-container">
              <input 
                type="password" 
                id="currentPassword" 
                name="currentPassword" 
                class="form-control" 
                placeholder="Ingresa tu contraseña actual"
              >
              <button type="button" class="password-toggle" aria-label="Mostrar contraseña">
                <i class="far fa-eye"></i>
              </button>
            </div>
            <div class="form-error" id="currentPassword-error"></div>
          </div>
          
          <div class="form-group">
            <label for="newPassword">Nueva contraseña</label>
            <div class="password-input-container">
              <input 
                type="password" 
                id="newPassword" 
                name="newPassword" 
                class="form-control" 
                placeholder="Mínimo 6 caracteres"
              >
              <button type="button" class="password-toggle" aria-label="Mostrar contraseña">
                <i class="far fa-eye"></i>
              </button>
            </div>
            <div class="form-error" id="newPassword-error"></div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirmar nueva contraseña</label>
            <div class="password-input-container">
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                class="form-control" 
                placeholder="Repite tu nueva contraseña"
              >
              <button type="button" class="password-toggle" aria-label="Mostrar contraseña">
                <i class="far fa-eye"></i>
              </button>
            </div>
            <div class="form-error" id="confirmPassword-error"></div>
          </div>
          
          <div id="profile-button-container" class="form-button-container"></div>
        </form>
      </div>
    `;
    
    // Crear botón de envío
    this.submitButton = new Button(
      'Guardar Cambios',
      'primary',
      this.handleSubmit.bind(this),
      false,
      'fas fa-save'
    );
    
    const buttonContainer = document.getElementById('profile-button-container');
    if (buttonContainer) {
      buttonContainer.appendChild(this.submitButton.render());
    }
    
    // Inicializar preview de avatar
    this.avatarPreview = document.getElementById('avatar-preview');
  }
  
  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    this.form = document.getElementById('profile-form');
    
    if (!this.form) return;
    
    // Validación en tiempo real
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const avatarInput = document.getElementById('avatar');
    
    if (nameInput) {
      nameInput.addEventListener('blur', () => this.validateName());
      nameInput.addEventListener('input', () => this.clearError('name'));
    }
    
    if (emailInput) {
      emailInput.addEventListener('blur', () => this.validateEmail());
      emailInput.addEventListener('input', () => this.clearError('email'));
    }
    
    if (currentPasswordInput) {
      currentPasswordInput.addEventListener('input', () => this.clearError('currentPassword'));
    }
    
    if (newPasswordInput) {
      newPasswordInput.addEventListener('blur', () => this.validateNewPassword());
      newPasswordInput.addEventListener('input', () => {
        this.clearError('newPassword');
        if (confirmPasswordInput.value) {
          this.validatePasswordMatch();
        }
      });
    }
    
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('blur', () => this.validatePasswordMatch());
      confirmPasswordInput.addEventListener('input', () => this.clearError('confirmPassword'));
    }
    
    // Preview de avatar
    if (avatarInput) {
      avatarInput.addEventListener('change', this.handleAvatarChange.bind(this));
    }
    
    // Mostrar/ocultar contraseñas
    const toggleButtons = document.querySelectorAll('.password-toggle');
    toggleButtons.forEach(button => {
      button.addEventListener('click', this.togglePasswordVisibility.bind(this));
    });
    
    // Envío del formulario
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }
  
  /**
   * Maneja el cambio de avatar
   * @param {Event} event - Evento change
   */
  handleAvatarChange(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      Notification.show('Por favor selecciona una imagen válida (JPEG, PNG, GIF, WEBP)', 'error');
      event.target.value = '';
      return;
    }
    
    // Validar tamaño (máximo 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      Notification.show('La imagen es demasiado grande. El tamaño máximo es 2MB', 'error');
      event.target.value = '';
      return;
    }
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const avatarImage = document.getElementById('avatar-image');
      if (avatarImage) {
        avatarImage.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }
  
  /**
   * Alterna la visibilidad de la contraseña
   * @param {Event} event - Evento click
   */
  togglePasswordVisibility(event) {
    const button = event.currentTarget;
    const container = button.closest('.password-input-container');
    const input = container.querySelector('input');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
      input.type = 'text';
      icon.className = 'far fa-eye-slash';
    } else {
      input.type = 'password';
      icon.className = 'far fa-eye';
    }
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
    
    if (!name) {
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
   * Valida la nueva contraseña
   * @returns {boolean} - true si es válida, false si no
   */
  validateNewPassword() {
    const newPasswordInput = document.getElementById('newPassword');
    const newPasswordError = document.getElementById('newPassword-error');
    
    if (!newPasswordInput || !newPasswordError) return false;
    
    const newPassword = newPasswordInput.value;
    
    // Si está vacío, es válido (cambio de contraseña opcional)
    if (!newPassword) {
      newPasswordInput.classList.remove('is-invalid');
      newPasswordError.textContent = '';
      return true;
    }
    
    if (!validatePassword(newPassword)) {
      newPasswordError.textContent = 'La contraseña debe tener al menos 6 caracteres';
      newPasswordInput.classList.add('is-invalid');
      return false;
    }
    
    newPasswordInput.classList.remove('is-invalid');
    newPasswordInput.classList.add('is-valid');
    newPasswordError.textContent = '';
    return true;
  }
  
  /**
   * Valida que las contraseñas coincidan
   * @returns {boolean} - true si coinciden, false si no
   */
  validatePasswordMatch() {
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const confirmPasswordError = document.getElementById('confirmPassword-error');
    
    if (!newPasswordInput || !confirmPasswordInput || !confirmPasswordError) return false;
    
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Si ambos están vacíos, es válido
    if (!newPassword && !confirmPassword) {
      confirmPasswordInput.classList.remove('is-invalid');
      confirmPasswordError.textContent = '';
      return true;
    }
    
    // Si hay nueva contraseña pero no confirmación
    if (newPassword && !confirmPassword) {
      confirmPasswordError.textContent = 'Debes confirmar tu nueva contraseña';
      confirmPasswordInput.classList.add('is-invalid');
      return false;
    }
    
    // Si las contraseñas no coinciden
    if (newPassword !== confirmPassword) {
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
   * Valida la contraseña actual
   * @returns {boolean} - true si es válida, false si no
   */
  validateCurrentPassword() {
    const currentPasswordInput = document.getElementById('currentPassword');
    const currentPasswordError = document.getElementById('currentPassword-error');
    const newPasswordInput = document.getElementById('newPassword');
    
    if (!currentPasswordInput || !currentPasswordError || !newPasswordInput) return false;
    
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    
    // Si se quiere cambiar la contraseña, la actual es obligatoria
    if (newPassword && !currentPassword) {
      currentPasswordError.textContent = 'Debes ingresar tu contraseña actual para cambiarla';
      currentPasswordInput.classList.add('is-invalid');
      return false;
    }
    
    currentPasswordInput.classList.remove('is-invalid');
    currentPasswordError.textContent = '';
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
    
    // Validar campos obligatorios
    const isNameValid = this.validateName();
    const isEmailValid = this.validateEmail();
    
    // Validar campos de contraseña si se quiere cambiar
    const newPasswordInput = document.getElementById('newPassword');
    const isChangingPassword = newPasswordInput && newPasswordInput.value.length > 0;
    
    let isCurrentPasswordValid = true;
    let isNewPasswordValid = true;
    let isPasswordMatchValid = true;
    
    if (isChangingPassword) {
      isCurrentPasswordValid = this.validateCurrentPassword();
      isNewPasswordValid = this.validateNewPassword();
      isPasswordMatchValid = this.validatePasswordMatch();
    }
    
    if (!isNameValid || !isEmailValid || !isCurrentPasswordValid || !isNewPasswordValid || !isPasswordMatchValid) {
      return;
    }
    
    try {
      // Deshabilitar botón mientras se procesa
      this.submitButton.update(true, 'Guardando...');
      
      // Crear FormData para enviar archivos
      const formData = new FormData();
      
      // Obtener valores
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const avatarInput = document.getElementById('avatar');
      
      // Agregar datos al FormData
      formData.append('name', name);
      formData.append('email', email);
      
      // Agregar contraseñas si se quiere cambiar
      if (isChangingPassword) {
        formData.append('currentPassword', currentPassword);
        formData.append('newPassword', newPassword);
      }
      
      // Agregar avatar si se seleccionó uno nuevo
      if (avatarInput.files.length > 0) {
        formData.append('avatar', avatarInput.files[0]);
      }
      
      // Enviar petición
      const response = await apiService.fetchData('/auth/profile', 'PUT', null, true, formData);
      
      if (response.success) {
        // Actualizar datos del usuario en localStorage
        authService.updateUserData(response.data);
        
        Notification.show('¡Perfil actualizado correctamente!', 'success');
        
        if (this.onSuccess) {
          this.onSuccess(response.data);
        }
        
        // Resetear campos de contraseña
        if (isChangingPassword) {
          document.getElementById('currentPassword').value = '';
          document.getElementById('newPassword').value = '';
          document.getElementById('confirmPassword').value = '';
        }
        
        this.submitButton.update(false, 'Guardar Cambios');
      } else {
        this.submitButton.update(false, 'Guardar Cambios');
        Notification.show(response.message || 'Error al actualizar el perfil', 'error');
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      this.submitButton.update(false, 'Guardar Cambios');
      
      if (error.message.includes('incorrect password')) {
        const currentPasswordError = document.getElementById('currentPassword-error');
        if (currentPasswordError) {
          currentPasswordError.textContent = 'La contraseña actual es incorrecta';
          document.getElementById('currentPassword').classList.add('is-invalid');
        }
      } else if (error.message.includes('email already exists')) {
        const emailError = document.getElementById('email-error');
        if (emailError) {
          emailError.textContent = 'Este correo electrónico ya está en uso';
          document.getElementById('email').classList.add('is-invalid');
        }
      } else {
        Notification.show('Error al actualizar el perfil', 'error');
      }
    }
  }
}