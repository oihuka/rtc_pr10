# RTC-PR10: EventHub

Este proyecto es una aplicación web full-stack que utiliza una arquitectura moderna con frontend y backend separados.

## Estructura del Proyecto

El proyecto está organizado en dos partes principales:

### Frontend

- Desarrollado con Vite.js
- Implementa una interfaz de usuario moderna y responsiva
- Utiliza variables de entorno para configuración
- Estructura de archivos organizada en el directorio `src/`

### Backend

- Servidor Node.js con Express
- Arquitectura MVC (Model-View-Controller)
- Sistema de rutas modular
- Middleware para autenticación y manejo de errores
- Gestión de archivos y uploads

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)

## Instalación

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd backend
npm install
```

## Configuración

### Frontend

Crea un archivo `.env.development` en el directorio frontend con las siguientes variables:

```
VITE_API_URL=http://localhost:3000
```

### Backend

Crea un archivo `.env` en el directorio backend con las siguientes variables:

```
PORT=3000
MONGODB_URI=tu_uri_de_mongodb
JWT_SECRET=tu_secreto_jwt
```

## Ejecución

### Frontend (Desarrollo)

```bash
cd frontend
npm run dev
```

### Backend

```bash
cd backend
npm start
```

## Despliegue

El proyecto está configurado para ser desplegado en Vercel, con archivos de configuración específicos para cada entorno.

### URLs de Despliegue

- Backend: https://rtc-pr10-eventhub-api.vercel.app/api
- Frontend:

## Características Principales

- Autenticación de usuarios
- Gestión de archivos
- API RESTful
- Interfaz de usuario moderna
- Diseño responsivo

## TODO

### Backend

- [ ] Actualizar documentación

### Frontend

- [ ] Corregir comportamiento al autenticarse
- [ ] Visualización correcta de "Mi perfil"
- [ ] Visualización correcta de "Mis eventos"
- [ ] Filtrado de "Próximos eventos"
- [ ] Cambiar estilo toast notificaciones
- [ ] Desplegar en Vercel

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
