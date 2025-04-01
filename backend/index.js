const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const fileUpload = require('express-fileupload');
const User = require('./models/User');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Permitir cualquier origen en producción
    : ['http://localhost:3001', 'http://localhost:3002'], // Orígenes específicos en desarrollo
  credentials: true // Permitir credenciales
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  useTempFiles: false,
  abortOnLimit: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

app.get('/api/test-db', async (req, res) => {
  try {
    // Intenta hacer una operación simple en la base de datos
    const count = await User.countDocuments();
    res.json({ success: true, message: 'Conexión a MongoDB exitosa', count });
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error);
    res.status(500).json({ success: false, message: 'Error al conectar con MongoDB', error: error.message });
  }
});

app.post('/api/create-test-user', async (req, res) => {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: 'test@ejemplo.com' });
    
    if (existingUser) {
      return res.json({ 
        success: true, 
        message: 'Usuario de prueba ya existe',
        user: { email: 'test@ejemplo.com', password: 'test123' }
      });
    }
    
    // Crear usuario de prueba
    const user = await User.create({
      name: 'Usuario de Prueba',
      email: 'test@ejemplo.com',
      password: 'test123'
    });
    
    res.json({ 
      success: true, 
      message: 'Usuario de prueba creado',
      user: { email: 'test@ejemplo.com', password: 'test123' }
    });
  } catch (error) {
    console.error('Error al crear usuario de prueba:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear usuario de prueba',
      error: error.message
    });
  }
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error detallado:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });
  
  // Usar el código de estado del error o 500 por defecto
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Error en el servidor' : err.message,
    error: err.message,
    path: req.path
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
