const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Crear usuario
  const user = await User.create({
    name,
    email,
    password
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login usuario
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  console.log('Intento de login con:', req.body.email);
  
  const { email, password } = req.body;
  
  // Validar email y password
  if (!email || !password) {
    console.log('Email o password no proporcionados');
    return next(new ErrorResponse('Por favor ingrese email y contraseña', 400));
  }
  
  try {
    // Verificar usuario
    console.log('Buscando usuario en la base de datos');
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('Usuario no encontrado');
      return next(new ErrorResponse('Credenciales inválidas', 401));
    }
    
    console.log('Usuario encontrado, verificando contraseña');
    // Verificar si la contraseña coincide
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      console.log('Contraseña incorrecta');
      return next(new ErrorResponse('Credenciales inválidas', 401));
    }
    
    console.log('Login exitoso, generando token');
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Error en proceso de login:', error);
    next(error);
  }
});

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Cerrar sesión / limpiar cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {}
  });
});

// Función auxiliar para enviar respuesta con token
const sendTokenResponse = (user, statusCode, res) => {
  // Crear token
  const token = user.getSignedJwtToken();

  // Convertir el documento de Mongoose a un objeto simple
  const userData = user.toObject();
  
  // Eliminar el campo de contraseña por seguridad
  delete userData.password;

  res.status(statusCode).json({
    success: true,
    data: {
      token,
      user: userData
    }
  });
};
