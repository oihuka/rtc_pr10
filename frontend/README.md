# EventHub Frontend

Frontend para la aplicación EventHub, una plataforma para crear y gestionar eventos.

## Requisitos

- Node.js (v14 o superior)
- npm (v6 o superior)

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/eventhub.git
   cd eventhub/frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm start
```

La aplicación estará disponible en [http://localhost:8080](http://localhost:8080).

## Construcción

Para construir la aplicación para producción:

```bash
npm run build
```

Los archivos generados estarán en la carpeta `dist`.

## Linting y Formateo

Para ejecutar el linter:

```bash
npm run lint
```

Para formatear el código:

```bash
npm run format
```

## Pruebas

Para ejecutar las pruebas:

```bash
npm test
```

## Estructura del Proyecto

```
frontend/
├── public/ # Archivos estáticos
│ ├── assets/ # Imágenes, fuentes, etc.
│ ├── css/ # Hojas de estilo
│ └── .html # Archivos HTML
├── src/ # Código fuente
│ ├── api/ # Servicios de API
│ ├── components/ # Componentes reutilizables
│ ├── pages/ # Páginas de la aplicación
│ ├── routes/ # Configuración de rutas
│ ├── utils/ # Utilidades
│ └── index.js # Punto de entrada
├── mocks/ # Mocks para pruebas
├── .eslintrc.js # Configuración de ESLint
├── .prettierrc.js # Configuración de Prettier
├── babel.config.js # Configuración de Babel
├── jest.config.js # Configuración de Jest
├── package.json # Dependencias y scripts
└── webpack.config.js # Configuración de Webpack
```

## Licencia

MIT
