/**
 * Script para actualizar la estructura de los archivos HTML
 * Este script busca todos los archivos HTML en la carpeta public
 * y actualiza su estructura para que sea consistente.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio de archivos HTML
const publicDir = path.join(__dirname, 'public');

// Plantilla HTML actualizada
const htmlTemplate = `<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{TITLE}}</title>
  <meta name="description" content="{{DESCRIPTION}}">

  <!-- Favicon -->
  <link rel="icon" href="/assets/favicon.ico">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">

  <!-- Estilos -->
  <link rel="stylesheet" href="/css/normalize.css">
  <link rel="stylesheet" href="/css/styles.css">

  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap"
    rel="stylesheet">
</head>

<body>
  <!-- Contenedor principal de la aplicación -->
  <div id="app">
    <!-- Header -->
    <div id="header-container"></div>

    <!-- Contenido principal -->
    <main id="main-container"></main>

    <!-- Footer -->
    <div id="footer-container"></div>
  </div>

  <!-- Contenedor de notificaciones -->
  <div id="notifications-container"></div>

  <!-- Contenedor para el loader global -->
  <div id="loader" class="loader-container">
    <div class="loader"></div>
  </div>

  <!-- Scripts -->
  <script type="module" src="/src/index.js"></script>
</body>

</html>`;

// Función para extraer el título y la descripción de un archivo HTML
function extractMetadata(htmlContent) {
  const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/);
  const descriptionMatch = htmlContent.match(/<meta name="description" content="(.*?)">/);
  
  return {
    title: titleMatch ? titleMatch[1] : 'EventHub',
    description: descriptionMatch ? descriptionMatch[1] : 'Plataforma de gestión de eventos'
  };
}

// Función para actualizar un archivo HTML
function updateHtmlFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const metadata = extractMetadata(content);
    
    let updatedContent = htmlTemplate
      .replace('{{TITLE}}', metadata.title)
      .replace('{{DESCRIPTION}}', metadata.description);
    
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ Actualizado: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error al actualizar ${filePath}:`, error.message);
  }
}

// Función para procesar todos los archivos HTML en un directorio
function processHtmlFiles(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Procesar subdirectorios recursivamente
      processHtmlFiles(filePath);
    } else if (file.endsWith('.html')) {
      // Actualizar archivos HTML
      updateHtmlFile(filePath);
    }
  });
}

// Ejecutar el script
console.log('🔄 Actualizando archivos HTML...');
processHtmlFiles(publicDir);
console.log('✨ Proceso completado.'); 