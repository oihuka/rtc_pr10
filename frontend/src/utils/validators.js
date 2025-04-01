/**
 * Valida si un campo es requerido
 * @param {string} value - Valor a validar
 * @returns {boolean} - Indica si el valor es válido
 */
export function validateRequired(value) {
  return value !== null && value !== undefined && value.trim() !== '';
}

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} - Indica si el email es válido
 */
export function validateEmail(email) {
  if (!validateRequired(email)) return false;
  
  // Expresión regular para validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @param {number} minLength - Longitud mínima
 * @returns {boolean} - Indica si la contraseña es válida
 */
export function validatePassword(password, minLength = 6) {
  if (!validateRequired(password)) return false;
  
  return password.length >= minLength;
}

/**
 * Valida que dos contraseñas coincidan
 * @param {string} password - Contraseña
 * @param {string} confirmPassword - Confirmación de contraseña
 * @returns {boolean} - Indica si las contraseñas coinciden
 */
export function validatePasswordMatch(password, confirmPassword) {
  if (!validateRequired(password) || !validateRequired(confirmPassword)) return false;
  
  return password === confirmPassword;
}

/**
 * Valida una URL
 * @param {string} url - URL a validar
 * @returns {boolean} - Indica si la URL es válida
 */
export function validateUrl(url) {
  if (!validateRequired(url)) return false;
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Valida una fecha
 * @param {string} date - Fecha a validar (formato YYYY-MM-DD)
 * @returns {boolean} - Indica si la fecha es válida
 */
export function validateDate(date) {
  if (!validateRequired(date)) return false;
  
  // Verificar formato
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  // Verificar si es una fecha válida
  const d = new Date(date);
  return !isNaN(d.getTime());
}

/**
 * Valida que una fecha sea futura
 * @param {string} date - Fecha a validar (formato YYYY-MM-DD)
 * @returns {boolean} - Indica si la fecha es futura
 */
export function validateFutureDate(date) {
  if (!validateDate(date)) return false;
  
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return inputDate >= today;
}

/**
 * Valida una hora
 * @param {string} time - Hora a validar (formato HH:MM)
 * @returns {boolean} - Indica si la hora es válida
 */
export function validateTime(time) {
  if (!validateRequired(time)) return false;
  
  // Verificar formato
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
}

/**
 * Valida un número
 * @param {string|number} value - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} - Indica si el número es válido
 */
export function validateNumber(value, min = null, max = null) {
  if (value === null || value === undefined || value === '') return false;
  
  const num = Number(value);
  
  if (isNaN(num)) return false;
  
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  
  return true;
}

/**
 * Valida un archivo
 * @param {File} file - Archivo a validar
 * @param {Array<string>} allowedTypes - Tipos MIME permitidos
 * @param {number} maxSize - Tamaño máximo en bytes
 * @returns {boolean} - Indica si el archivo es válido
 */
export function validateFile(file, allowedTypes = [], maxSize = 5 * 1024 * 1024) {
  if (!file) return false;
  
  // Validar tipo
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return false;
  }
  
  // Validar tamaño
  if (file.size > maxSize) {
    return false;
  }
  
  return true;
}

/**
 * Valida una imagen
 * @param {File} file - Archivo a validar
 * @param {number} maxSize - Tamaño máximo en bytes
 * @returns {boolean} - Indica si la imagen es válida
 */
export function validateImage(file, maxSize = 2 * 1024 * 1024) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validateFile(file, allowedTypes, maxSize);
}

/**
 * Valida un formulario completo
 * @param {Object} formData - Datos del formulario
 * @param {Object} validations - Reglas de validación
 * @returns {Object} - Resultado de la validación
 */
export function validateForm(formData, validations) {
  const errors = {};
  let isValid = true;
  
  // Recorrer todas las reglas de validación
  for (const field in validations) {
    const value = formData[field];
    const rules = validations[field];
    
    // Aplicar cada regla de validación al campo
    for (const rule of rules) {
      const { validator, message } = rule;
      
      // Si la validación falla, agregar mensaje de error
      if (!validator(value)) {
        errors[field] = message;
        isValid = false;
        break;
      }
    }
  }
  
  return { isValid, errors };
}
