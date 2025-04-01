/**
 * Componente Button reutilizable
 */
export default class Button {
  /**
   * @param {HTMLElement|string} container - Contenedor donde se renderizará el botón o texto del botón
   * @param {string} text - Texto del botón o tipo de botón si container es un elemento
   * @param {string|function} type - Tipo de botón (btn-primary, btn-secondary, etc.) o función onClick
   * @param {function|boolean} onClick - Función a ejecutar al hacer click o estado disabled
   * @param {boolean|string} disabled - Si el botón está deshabilitado o icono
   * @param {string} icon - Clase de icono (Font Awesome)
   */
  constructor(container, text, type = 'btn-primary', onClick = null, disabled = false, icon = null) {
    // Compatibilidad con la versión anterior
    if (typeof container === 'string' && arguments.length <= 5) {
      this.container = null;
      this.text = container;
      this.type = text || 'btn-primary';
      this.onClick = type || null;
      this.disabled = onClick || false;
      this.icon = disabled || null;
    } else {
      this.container = typeof container === 'string' ? document.getElementById(container) : container;
      this.text = text;
      this.type = type;
      this.onClick = onClick;
      this.disabled = disabled;
      this.icon = icon;
    }
    
    this.element = null;
  }
  
  /**
   * Renderiza el botón
   * @returns {HTMLElement} - Elemento del botón
   */
  render() {
    const button = document.createElement('button');
    button.className = `btn ${this.type}`;
    
    // Agregar icono si existe
    if (this.icon) {
      button.innerHTML = `<i class="${this.icon}"></i> `;
    }
    
    // Agregar texto
    button.innerHTML += this.text;
    
    // Configurar estado deshabilitado
    if (this.disabled) {
      button.disabled = true;
      button.classList.add('disabled');
    }
    
    // Agregar evento click
    if (this.onClick && typeof this.onClick === 'function') {
      button.addEventListener('click', this.onClick);
    }
    
    this.element = button;
    
    // Si hay un contenedor, añadir el botón
    if (this.container) {
      this.container.appendChild(button);
    }
    
    return button;
  }
  
  /**
   * Actualiza el estado del botón
   * @param {boolean} disabled - Nuevo estado de deshabilitado
   * @param {string} text - Nuevo texto (opcional)
   */
  update(disabled, text = null) {
    if (!this.element) return;
    
    this.disabled = disabled;
    this.element.disabled = disabled;
    
    if (disabled) {
      this.element.classList.add('disabled');
    } else {
      this.element.classList.remove('disabled');
    }
    
    if (text) {
      this.text = text;
      
      // Actualizar texto manteniendo el icono si existe
      if (this.icon) {
        this.element.innerHTML = `<i class="${this.icon}"></i> ${text}`;
      } else {
        this.element.textContent = text;
      }
    }
  }
}
