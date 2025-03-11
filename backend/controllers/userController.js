const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const path = require('path');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Obtener un usuario por ID
// @route   GET /api/users/:id
// @access  Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`Usuario no encontrado con id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Actualizar usuario
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`Usuario no encontrado con id ${req.params.id}`, 404));
  }

  // Asegurarse de que el usuario solo pueda actualizar su propio perfil
  if (req.params.id !== req.user.id.toString()) {
    return next(new ErrorResponse('No autorizado para actualizar este perfil', 401));
  }

  // Eliminar campos que no deben ser actualizados directamente
  delete req.body.password;
  delete req.body.email;

  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Subir avatar
// @route   PUT /api/users/:id/avatar
// @access  Private
exports.uploadAvatar = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`Usuario no encontrado con id ${req.params.id}`, 404));
  }

  // Asegurarse de que el usuario solo pueda actualizar su propio avatar
  if (req.params.id !== req.user.id.toString()) {
    return next(new ErrorResponse('No autorizado para actualizar este avatar', 401));
  }

  if (!req.files || !req.files.file) {
    return next(new ErrorResponse('Por favor suba un archivo', 400));
  }

  const file = req.files.file;

  // Asegurarse de que el archivo es una imagen
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Por favor suba una imagen', 400));
  }

  // Verificar tamaño
  if (file.size > 1000000) {
    return next(new ErrorResponse('Por favor suba una imagen menor a 1MB', 400));
  }

  try {
    // Si el usuario ya tiene un avatar personalizado, eliminarlo de Cloudinary
    if (user.avatar && !user.avatar.includes('default-avatar')) {
      // Extraer el public_id del avatar actual si existe
      const publicIdMatch = user.avatar.match(/\/v\d+\/(.+)$/);
      if (publicIdMatch && publicIdMatch[1]) {
        const publicId = publicIdMatch[1].split('.')[0];
        await deleteFromCloudinary(publicId);
      }
    }

    // Subir nueva imagen a Cloudinary
    const publicId = `avatar_${user._id}`;
    const result = await uploadToCloudinary(file, 'avatars', publicId);

    // Actualizar usuario con la nueva URL del avatar
    await User.findByIdAndUpdate(req.params.id, { avatar: result.url });

    res.status(200).json({
      success: true,
      data: result.url
    });
  } catch (error) {
    return next(new ErrorResponse('Error al subir la imagen', 500));
  }
});
