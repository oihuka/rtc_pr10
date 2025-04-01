/**
 * Componente Card reutilizable
 */
export default class Card {
  /**
   * @param {string} title - Título de la tarjeta (opcional)
   * @param {string} content - Contenido HTML de la tarjeta
   * @param {string} footer - Contenido HTML del footer (opcional)
   * @param {string} className - Clases adicionales (opcional)
   */
  constructor(title = null, content = '', footer = null, className = '') {
    this.title = title;
    this.content = content;
    this.footer = footer;
    this.className = className;
    this.element = null;
  }
  
  /**
   * Renderiza la tarjeta
   * @returns {HTMLElement} - Elemento de la tarjeta
   */
  render() {
    const card = document.createElement('div');
    card.className = `card ${this.className}`;
    
    // Agregar título si existe
    if (this.title) {
      const header = document.createElement('div');
      header.className = 'card-header';
      header.innerHTML = `<h3>${this.title}</h3>`;
      card.appendChild(header);
    }
    
    // Agregar contenido
    const body = document.createElement('div');
    body.className = 'card-body';
    body.innerHTML = this.content;
    card.appendChild(body);
    
    // Agregar footer si existe
    if (this.footer) {
      const footerEl = document.createElement('div');
      footerEl.className = 'card-footer';
      footerEl.innerHTML = this.footer;
      card.appendChild(footerEl);
    }
    
    this.element = card;
    return card;
  }
  
  /**
   * Actualiza el contenido de la tarjeta
   * @param {string} content - Nuevo contenido HTML
   */
  updateContent(content) {
    if (!this.element) return;
    
    this.content = content;
    const body = this.element.querySelector('.card-body');
    if (body) {
      body.innerHTML = content;
    }
  }
  
  /**
   * Actualiza el título de la tarjeta
   * @param {string} title - Nuevo título
   */
  updateTitle(title) {
    if (!this.element) return;
    
    this.title = title;
    const header = this.element.querySelector('.card-header h3');
    if (header) {
      header.textContent = title;
    }
  }
  
  /**
   * Actualiza el footer de la tarjeta
   * @param {string} footer - Nuevo contenido HTML del footer
   */
  updateFooter(footer) {
    if (!this.element) return;
    
    this.footer = footer;
    const footerEl = this.element.querySelector('.card-footer');
    if (footerEl) {
      footerEl.innerHTML = footer;
    }
  }
}
