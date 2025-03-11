# Backend de la Aplicación de Eventos

## Configuración

Instalar dependencias:

```
npm install
```

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventosapp
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## Ejecución

Para iniciar el servidor en modo desarrollo:

```
npm run dev
```

Para iniciar el servidor en modo producción:

```
npm start
```

## Semillas de Datos

Para poblar la base de datos con datos de muestra:

```
npm run seed
```

Para eliminar todos los datos de la base de datos:

```
npm run seed:delete
```

## Endpoints API

### Autenticación

- `POST /api/auth/register` - Registrar un nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual
- `GET /api/auth/logout` - Cerrar sesión

### Usuarios

- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener un usuario por ID
- `PUT /api/users/:id` - Actualizar un usuario
- `PUT /api/users/:id/avatar` - Subir avatar de usuario

### Eventos

- `GET /api/events` - Obtener todos los eventos
- `GET /api/events/:id` - Obtener un evento por ID
- `POST /api/events` - Crear un nuevo evento
- `PUT /api/events/:id` - Actualizar un evento
- `DELETE /api/events/:id` - Eliminar un evento
- `PUT /api/events/:id/image` - Subir imagen de evento
- `PUT /api/events/:id/attend` - Asistir a un evento
- `PUT /api/events/:id/cancel` - Cancelar asistencia a un evento
