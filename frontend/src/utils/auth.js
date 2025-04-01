// Importación dinámica para evitar ciclos de dependencia
let apiService = null;
import { showNotification } from './helpers.js';

/**
 * Gestiona la autenticación de usuarios
 */
class AuthService {
  constructor() {
    this.tokenKey = 'auth_token';
    this.userKey = 'user_data';
    this.rememberKey = 'remember_me';
    
    // Importar apiService de forma dinámica para evitar ciclos de dependencia
    import('../api/apiService.js').then(module => {
      apiService = module.default;
    });
  }
  
  /**
   * Inicia sesión de usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @param {boolean} remember - Indica si se debe recordar la sesión
   * @returns {Promise<boolean>} - Indica si el login fue exitoso
   */
  async login(email, password, remember = false) {
    try {
      const response = await apiService.post('/auth/login', { email, password });
      
      // Depuración
      console.log('Respuesta completa del servidor:', response);
      
      if (response.success) {
        // Usar estructura condicional para manejar ambos formatos de respuesta
        const token = response.data ? response.data.token : response.token;
        const userData = response.data ? response.data.user : response.user;
        
        if (!token) {
          console.error('Token no encontrado en la respuesta');
          return false;
        }
        
        this.setToken(token, remember);
        
        if (userData) {
          this.setUserData(userData);
        } else {
          console.warn('Datos de usuario no encontrados en la respuesta');
        }
        
        return true;
      } else {
        console.error('Error de login:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return false;
    }
  }
  
  /**
   * Registra un nuevo usuario
   * @param {object} userData - Datos del usuario
   * @returns {Promise<object>} - Respuesta de la API
   */
  async register(userData) {
    try {
      // Si apiService no está disponible, mostrar error
      if (!apiService) {
        showNotification('Error al registrar usuario. Por favor, intenta de nuevo.', 'error');
        return { success: false, message: 'Error al registrar usuario' };
      }
      
      const response = await apiService.post('/auth/register', userData);
      
      if (response.success) {
        // Guardar token y datos del usuario
        this.setToken(response.data.token);
        this.setUserData(response.data.user);
      }
      
      return response;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      return { success: false, message: 'Error al registrar usuario' };
    }
  }
  
  /**
   * Cierra la sesión del usuario
   * @param {boolean} callApi - Indica si se debe llamar a la API
   * @returns {Promise<boolean>} - Indica si el logout fue exitoso
   */
  async logout(callApi = true) {
    try {
      if (callApi) {
        // Llamar a la API para invalidar el token
        await apiService.post('/auth/logout', {}, true);
      }
      
      // Eliminar token y datos del usuario
      this.clearToken();
      this.clearUserData();
      
      return true;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      
      // Eliminar token y datos del usuario de todas formas
      this.clearToken();
      this.clearUserData();
      
      return true;
    }
  }
  
  /**
   * Valida el token actual
   * @returns {Promise<boolean>} - Indica si el token es válido
   */
  async validateToken() {
    try {
      // Si no hay token, no es válido
      if (!this.getToken()) {
        return false;
      }
      
      // Si apiService no está disponible, asumir que el token es válido
      if (!apiService) {
        return true;
      }
      
      // Verificar token con el servidor
      const response = await apiService.get('/auth/me', true);
      
      return response.success;
    } catch (error) {
      console.error('Error al validar token:', error);
      return false;
    }
  }
  
  /**
   * Obtiene el token de autenticación
   * @returns {string|null} - Token de autenticación
   */
  getToken() {
    return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
  }
  
  /**
   * Guarda el token de autenticación
   * @param {string} token - Token de autenticación
   * @param {boolean} remember - Indica si se debe recordar la sesión
   */
  setToken(token, remember) {
    if (remember) {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.rememberKey, 'true');
      sessionStorage.removeItem(this.tokenKey);
    } else {
      sessionStorage.setItem(this.tokenKey, token);
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.rememberKey);
    }
  }
  
  /**
   * Elimina el token de autenticación
   */
  clearToken() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.rememberKey);
    sessionStorage.removeItem(this.tokenKey);
  }
  
  /**
   * Obtiene los datos del usuario
   * @returns {object|null} - Datos del usuario
   */
  getCurrentUser() {
    const userData = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log("Datos de usuario almacenados:", parsedUser); // Log temporal
        return parsedUser;
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
        return null;
      }
    }
    
    return null;
  }
  
  /**
   * Guarda los datos del usuario
   * @param {object} userData - Datos del usuario
   */
  setUserData(userData) {
    if (!userData) {
      console.warn('Intentando guardar datos de usuario nulos o undefined');
      return;
    }
    
    console.log('Guardando datos de usuario:', userData);
    const data = JSON.stringify(userData);
    
    if (localStorage.getItem(this.rememberKey) === 'true') {
      localStorage.setItem(this.userKey, data);
      sessionStorage.removeItem(this.userKey);
    } else {
      sessionStorage.setItem(this.userKey, data);
      localStorage.removeItem(this.userKey);
    }
  }
  
  /**
   * Actualiza los datos del usuario
   * @param {object} userData - Nuevos datos del usuario
   */
  updateUserData(userData) {
    const currentUser = this.getCurrentUser();
    
    if (currentUser) {
      // Combinar datos actuales con nuevos datos
      const updatedUser = { ...currentUser, ...userData };
      this.setUserData(updatedUser);
    }
  }
  
  /**
   * Elimina los datos del usuario
   */
  clearUserData() {
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.userKey);
  }
  
  /**
   * Verifica si el usuario está autenticado
   * @returns {boolean} - Indica si el usuario está autenticado
   */
  isAuthenticated() {
    return !!this.getToken();
  }
  
  /**
   * Obtiene el ID del usuario actual
   * @returns {string|null} - ID del usuario o null si no está autenticado
   */
  getUserId() {
    const user = this.getCurrentUser();
    return user ? user._id : null;
  }
}

// Crear instancia y exportarla
const authService = new AuthService();
export default authService;

