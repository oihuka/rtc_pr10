/**
 * Componente Loader reutilizable
 */
export default class Loader {
  /**
   * @param {string} size - Tamaño del loader (small, medium, large)
   * @param {string} text - Texto a mostrar (opcional)
   * @param {boolean} overlay - Si debe mostrar un overlay
   */
  constructor(size = 'medium', text = null, overlay = false) {
    this.size = size;
    this.text = text;
    this.overlay = overlay;
    this.element = null;
  }
  
  /**
   * Renderiza el loader
   * @returns {HTMLElement} - Elemento del loader
   */
  render() {
    const container = document.createElement('div');
    container.className = this.overlay ? 'loader-overlay' : 'loader-container';
    
    const loader = document.createElement('div');
    loader.className = `loader loader-${this.size}`;
    container.appendChild(loader);
    
    if (this.text) {
      const textElement = document.createElement('p');
      textElement.className = 'loader-text';
      textElement.textContent = this.text;
      container.appendChild(textElement);
    }
    
    this.element = container;
    return container;
  }
  
  /**
   * Muestra el loader en un contenedor específico
   * @param {HTMLElement} container - Contenedor donde mostrar el loader
   */
  show(container = null) {
    if (!this.element) {
      this.render();
    }
    
    if (container) {
      container.appendChild(this.element);
    } else if (this.overlay) {
      document.body.appendChild(this.element);
      document.body.style.overflow = 'hidden';
    }
  }
  
  /**
   * Oculta el loader
   */
  hide() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      
      if (this.overlay) {
        document.body.style.overflow = '';
      }
    }
  }
  
  /**
   * Actualiza el texto del loader
   * @param {string} text - Nuevo texto
   */
  updateText(text) {
    this.text = text;
    
    if (this.element) {
      const textElement = this.element.querySelector('.loader-text');
      
      if (textElement) {
        textElement.textContent = text;
      } else if (text) {
        const newTextElement = document.createElement('p');
        newTextElement.className = 'loader-text';
        newTextElement.textContent = text;
        this.element.appendChild(newTextElement);
      }
    }
  }
}
