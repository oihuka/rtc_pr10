// Importación dinámica para evitar ciclos de dependencia
let authService = null;
import Notification from '../components/UI/Notification.js';

/**
 * Servicio para realizar peticiones a la API
 */
class ApiService {
  constructor() {
    // Usar la variable de entorno para la URL base
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
    console.log('API URL:', this.baseUrl); // Log para depuración
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
    
    // Importar authService de forma dinámica para evitar ciclos de dependencia
    import('../utils/auth.js').then(module => {
      authService = module.default;
    });
  }
  
  /**
   * Realiza una petición GET
   * @param {string} endpoint - Endpoint de la API
   * @param {boolean} requireAuth - Indica si la petición requiere autenticación
   * @returns {Promise<object>} - Respuesta de la API
   */
  async get(endpoint, requireAuth = false) {
    return this.request(endpoint, 'GET', null, requireAuth);
  }
  
  /**
   * Realiza una petición POST
   * @param {string} endpoint - Endpoint de la API
   * @param {object} data - Datos a enviar
   * @param {boolean} requireAuth - Indica si la petición requiere autenticación
   * @returns {Promise<object>} - Respuesta de la API
   */
  async post(endpoint, data, requireAuth = false) {
    return this.request(endpoint, 'POST', data, requireAuth);
  }
  
  /**
   * Realiza una petición PUT
   * @param {string} endpoint - Endpoint de la API
   * @param {object} data - Datos a enviar
   * @param {boolean} requireAuth - Indica si la petición requiere autenticación
   * @returns {Promise<object>} - Respuesta de la API
   */
  async put(endpoint, data, requireAuth = false) {
    return this.request(endpoint, 'PUT', data, requireAuth);
  }
  
  /**
   * Realiza una petición DELETE
   * @param {string} endpoint - Endpoint de la API
   * @param {boolean} requireAuth - Indica si la petición requiere autenticación
   * @returns {Promise<object>} - Respuesta de la API
   */
  async delete(endpoint, requireAuth = false) {
    return this.request(endpoint, 'DELETE', null, requireAuth);
  }
  
  /**
   * Realiza una petición a la API
   * @param {string} endpoint - Endpoint de la API
   * @param {string} method - Método HTTP
   * @param {object} data - Datos a enviar
   * @param {boolean} requireAuth - Indica si la petición requiere autenticación
   * @returns {Promise<object>} - Respuesta de la API
   */
  async request(endpoint, method, data, requireAuth) {
    try {
      // Asegurarse de que el endpoint comienza con /
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const url = `${this.baseUrl}${normalizedEndpoint}`;
      console.log('Request URL:', url); // Log para depuración
      
      const headers = { ...this.defaultHeaders };
      
      // Agregar token de autenticación si es necesario
      if (requireAuth && authService) {
        const token = authService.getToken();
        
        if (!token) {
          this.handleUnauthenticated();
          return { success: false, message: 'No autorizado' };
        }
        
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Configuración de la petición
      const config = {
        method,
        headers,
        credentials: 'include',
        mode: 'cors'
      };
      
      // Agregar body si es necesario
      if (data && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(data);
      }
      
      // Realizar petición
      const response = await fetch(url, config);
      
      // Procesar respuesta
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Maneja la respuesta de la API
   * @param {Response} response - Respuesta de fetch
   * @returns {Promise<object>} - Datos procesados
   */
  async handleResponse(response) {
    // Obtener datos de la respuesta
    let data;
    
    try {
      // Clonar la respuesta para evitar el error "Body has already been consumed"
      const responseClone = response.clone();
      
      try {
        data = await response.json();
      } catch (jsonError) {
        // Si no se puede parsear como JSON, usar texto
        data = {
          success: false,
          message: await responseClone.text()
        };
      }
    } catch (error) {
      console.error('Error al procesar la respuesta:', error);
      data = {
        success: false,
        message: 'Error al procesar la respuesta del servidor'
      };
    }
    
    // Si la respuesta es exitosa
    if (response.ok) {
      return data;
    }
    
    // Manejar errores específicos
    switch (response.status) {
      case 401: // No autorizado
        if (authService) {
          this.handleUnauthenticated();
        }
        break;
      case 403: // Prohibido
        Notification.show('No tienes permisos para realizar esta acción', 'error');
        break;
      case 404: // No encontrado
        Notification.show('El recurso solicitado no existe', 'error');
        break;
      case 422: // Error de validación
        // Mostrar errores de validación
        if (data.errors) {
          const errorMessages = Object.values(data.errors).join(', ');
          Notification.show(errorMessages, 'error');
        } else {
          Notification.show(data.message || 'Error de validación', 'error');
        }
        break;
      case 500: // Error del servidor
        Notification.show('Error en el servidor. Por favor, inténtalo de nuevo más tarde.', 'error');
        break;
      default:
        Notification.show(data.message || 'Ha ocurrido un error', 'error');
    }
    
    return data;
  }
  
  /**
   * Maneja errores de red
   * @param {Error} error - Error capturado
   * @returns {object} - Objeto de error
   */
  handleError(error) {
    console.error('Error de red:', error);
    
    // Mostrar notificación de error
    Notification.show('Error de conexión. Verifica tu conexión a internet.', 'error');
    
    return {
      success: false,
      message: 'Error de conexión',
      error: error.message
    };
  }
  
  /**
   * Maneja el caso de usuario no autenticado
   */
  handleUnauthenticated() {
    // Si authService no está disponible, simplemente mostrar notificación
    if (!authService) {
      Notification.show('Debes iniciar sesión para acceder a esta funcionalidad', 'warning');
      return;
    }
    
    // Cerrar sesión
    authService.logout(false);
    
    // Mostrar notificación
    Notification.show('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', 'warning');
    
    // Redirigir a login
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 1500);
  }
  
  /**
   * Sube un archivo a la API
   * @param {string} endpoint - Endpoint de la API
   * @param {FormData} formData - Datos del formulario con archivos
   * @param {boolean} requireAuth - Indica si la petición requiere autenticación
   * @param {function} progressCallback - Función para manejar el progreso de la subida
   * @returns {Promise<object>} - Respuesta de la API
   */
  async uploadFile(endpoint, formData, requireAuth = true, progressCallback = null) {
    try {
      // Construir URL completa
      const url = `${this.baseUrl}${endpoint}`;
      
      // Configurar headers (sin Content-Type para que el navegador lo establezca)
      const headers = {};
      
      // Añadir token de autenticación si es necesario
      if (requireAuth) {
        const token = authService.getToken();
        
        if (!token) {
          this.handleUnauthenticated();
          return { success: false, message: 'No autenticado' };
        }
        
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Configurar opciones de la petición
      const options = {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include'
      };
      
      // Realizar petición con manejo de progreso si hay callback
      if (progressCallback) {
        return this.uploadWithProgress(url, options, progressCallback);
      } else {
        const response = await fetch(url, options);
        return this.handleResponse(response);
      }
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Sube un archivo con manejo de progreso
   * @param {string} url - URL completa
   * @param {object} options - Opciones de fetch
   * @param {function} progressCallback - Función para manejar el progreso
   * @returns {Promise<object>} - Respuesta de la API
   */
  uploadWithProgress(url, options, progressCallback) {
    return new Promise((resolve, reject) => {
      // Crear objeto XMLHttpRequest para manejar el progreso
      const xhr = new XMLHttpRequest();
      
      // Configurar evento de progreso
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          progressCallback(percentComplete);
        }
      });
      
      // Configurar evento de carga completa
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Éxito
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (error) {
            resolve({
              success: true,
              message: 'Operación completada'
            });
          }
        } else {
          // Error
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({
              success: false,
              message: data.message || 'Error en la petición',
              status: xhr.status
            });
          } catch (error) {
            resolve({
              success: false,
              message: 'Error en la petición',
              status: xhr.status
            });
          }
        }
      });
      
      // Configurar evento de error
      xhr.addEventListener('error', () => {
        reject(new Error('Error de red'));
      });
      
      // Configurar evento de aborto
      xhr.addEventListener('abort', () => {
        reject(new Error('Petición abortada'));
      });
      
      // Abrir conexión
      xhr.open(options.method, url);
      
      // Establecer headers
      for (const [key, value] of Object.entries(options.headers)) {
        xhr.setRequestHeader(key, value);
      }
      
      // Enviar petición
      xhr.send(options.body);
    });
  }
}

// Crear instancia y exportarla
const apiService = new ApiService();
export default apiService;
