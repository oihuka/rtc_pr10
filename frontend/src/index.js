import App from './App.js';
import Router from './routes/Router.js';
import './styles/main.css';
import Notification from './components/UI/Notification.js';

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Inicializar la aplicación
    const app = new App();
    await app.init();
    
    // Inicializar el router
    const router = new Router(app);
    router.init();
    
    // Exponer la aplicación y el router globalmente para debugging
    if (process.env.NODE_ENV !== 'production') {
      window.app = app;
      window.router = router;
    }
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
    
    // Mostrar notificación de error en lugar de usar error-container
    Notification.init();
    Notification.show('Ha ocurrido un error al inicializar la aplicación. Por favor, recarga la página.', 'error', 0);
    
    // Mostrar un mensaje más detallado en el contenedor principal
    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
      mainContainer.innerHTML = `
        <div class="centered-message">
          <h2>Error de inicialización</h2>
          <p>Ha ocurrido un error al inicializar la aplicación.</p>
          <button class="btn btn-primary" onclick="window.location.reload()">
            Intentar de nuevo
          </button>
        </div>
      `;
    }
  }
});
