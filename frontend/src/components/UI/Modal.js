/**
 * Componente Modal reutilizable
 */
export default class Modal {
  /**
   * @param {string} title - Título del modal
   * @param {string|HTMLElement} content - Contenido del modal
   * @param {Array} buttons - Array de objetos {text, type, onClick}
   * @param {boolean} closable - Si se puede cerrar con X o ESC
   * @param {string} size - Tamaño del modal (small, medium, large)
   */
  constructor(title, content, buttons = [], closable = true, size = 'medium') {
    this.title = title;
    this.content = content;
    this.buttons = buttons;
    this.closable = closable;
    this.size = size;
    this.element = null;
    this.backdrop = null;
    this.isOpen = false;
  }
  
  /**
   * Renderiza el modal
   * @returns {HTMLElement} - Elemento del modal
   */
  render() {
    // Crear backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop';
    
    // Crear modal
    const modal = document.createElement('div');
    modal.className = `modal modal-${this.size}`;
    
    // Crear header
    const header = document.createElement('div');
    header.className = 'modal-header';
    
    const title = document.createElement('h3');
    title.className = 'modal-title';
    title.textContent = this.title;
    header.appendChild(title);
    
    // Agregar botón de cierre si es closable
    if (this.closable) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'modal-close';
      closeBtn.innerHTML = '<i class="fas fa-times"></i>';
      closeBtn.addEventListener('click', () => this.close());
      header.appendChild(closeBtn);
    }
    
    // Crear body
    const body = document.createElement('div');
    body.className = 'modal-body';
    
    // Agregar contenido
    if (typeof this.content === 'string') {
      body.innerHTML = this.content;
    } else if (this.content instanceof HTMLElement) {
      body.appendChild(this.content);
    }
    
    // Crear footer con botones
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    
    this.buttons.forEach(btn => {
      const button = document.createElement('button');
      button.className = `btn btn-${btn.type || 'secondary'}`;
      button.textContent = btn.text;
      
      if (btn.onClick) {
        button.addEventListener('click', () => {
          btn.onClick();
          if (btn.closeOnClick !== false) {
            this.close();
          }
        });
      } else {
        button.addEventListener('click', () => this.close());
      }
      
      footer.appendChild(button);
    });
    
    // Ensamblar modal
    modal.appendChild(header);
    modal.appendChild(body);
    
    if (this.buttons.length > 0) {
      modal.appendChild(footer);
    }
    
    this.element = modal;
    
    // Agregar event listener para cerrar con ESC
    if (this.closable) {
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    
    return modal;
  }
  
  /**
   * Abre el modal
   */
  open() {
    if (this.isOpen) return;
    
    if (!this.element) {
      this.render();
    }
    
    // Agregar al DOM
    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.element);
    
    // Prevenir scroll en el body
    document.body.style.overflow = 'hidden';
    
    // Mostrar con animación
    setTimeout(() => {
      this.backdrop.classList.add('show');
      this.element.classList.add('show');
    }, 10);
    
    this.isOpen = true;
  }
  
  /**
   * Cierra el modal
   */
  close() {
    if (!this.isOpen) return;
    
    // Ocultar con animación
    this.backdrop.classList.remove('show');
    this.element.classList.remove('show');
    
    // Eliminar del DOM después de la animación
    setTimeout(() => {
      if (this.backdrop.parentNode) {
        document.body.removeChild(this.backdrop);
      }
      
      if (this.element.parentNode) {
        document.body.removeChild(this.element);
      }
      
      // Restaurar scroll
      document.body.style.overflow = '';
    }, 300);
    
    this.isOpen = false;
  }
  
  /**
   * Maneja el evento keydown para cerrar con ESC
   * @param {KeyboardEvent} event - Evento keydown
   */
  handleKeyDown(event) {
    if (event.key === 'Escape' && this.isOpen && this.closable) {
      this.close();
    }
  }
  
  /**
   * Actualiza el contenido del modal
   * @param {string|HTMLElement} content - Nuevo contenido
   */
  updateContent(content) {
    this.content = content;
    
    if (this.element) {
      const body = this.element.querySelector('.modal-body');
      
      if (body) {
        body.innerHTML = '';
        
        if (typeof content === 'string') {
          body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
          body.appendChild(content);
        }
      }
    }
  }
}
