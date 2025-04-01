/**
 * Página 404 - No encontrado
 */
export default class NotFoundPage {
  /**
   * @param {string} mainContainerId - ID del contenedor principal
   */
  constructor(mainContainerId = 'main-container') {
    this.mainContainerId = mainContainerId;
    this.mainContainer = null;
  }
  
  /**
   * Inicializa la página
   */
  init() {
    this.mainContainer = document.getElementById(this.mainContainerId);
    
    if (!this.mainContainer) {
      console.error(`No se encontró el contenedor con ID: ${this.mainContainerId}`);
      return;
    }
    
    this.render();
  }
  
  /**
   * Renderiza la página
   */
  render() {
    this.mainContainer.innerHTML = `
      <div class="not-found-page">
        <div class="container">
          <div class="not-found-content">
            <h1>404</h1>
            <h2>Página no encontrada</h2>
            <p>Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
            <a href="/" class="btn btn-primary">Volver al inicio</a>
          </div>
        </div>
      </div>
    `;
  }
}
