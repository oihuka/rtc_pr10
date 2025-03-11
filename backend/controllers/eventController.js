const Event = require('../models/Event');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const path = require('path');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

// @desc    Obtener todos los eventos
// @route   GET /api/events
// @access  Public
exports.getEvents = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Obtener un evento
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate({
    path: 'creator',
    select: 'name avatar'
  }).populate({
    path: 'attendees',
    select: 'name avatar'
  });

  if (!event) {
    return next(new ErrorResponse(`Evento no encontrado con id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Crear un evento
// @route   POST /api/events
// @access  Private
exports.createEvent = asyncHandler(async (req, res, next) => {
  // Agregar usuario como creador
  req.body.creator = req.user.id;

  const event = await Event.create(req.body);

  res.status(201).json({
    success: true,
    data: event
  });
});

// @desc    Actualizar un evento
// @route   PUT /api/events/:id
// @access  Private
exports.updateEvent = asyncHandler(async (req, res, next) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    return next(new ErrorResponse(`Evento no encontrado con id ${req.params.id}`, 404));
  }

  // Asegurarse de que el usuario es el creador del evento
  if (event.creator.toString() !== req.user.id) {
    return next(new ErrorResponse('No autorizado para actualizar este evento', 401));
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Eliminar un evento
// @route   DELETE /api/events/:id
// @access  Private
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new ErrorResponse(`Evento no encontrado con id ${req.params.id}`, 404));
  }

  // Asegurarse de que el usuario es el creador del evento
  if (event.creator.toString() !== req.user.id) {
    return next(new ErrorResponse('No autorizado para eliminar este evento', 401));
  }

  await event.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Subir imagen de evento
// @route   PUT /api/events/:id/image
// @access  Private
exports.uploadEventImage = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new ErrorResponse(`Evento no encontrado con id ${req.params.id}`, 404));
  }

  // Asegurarse de que el usuario es el creador del evento
  if (event.creator.toString() !== req.user.id) {
    return next(new ErrorResponse('No autorizado para actualizar este evento', 401));
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
    // Si el evento ya tiene una imagen personalizada, eliminarla de Cloudinary
    if (event.image && !event.image.includes('default-event')) {
      // Extraer el public_id de la imagen actual si existe
      const publicIdMatch = event.image.match(/\/v\d+\/(.+)$/);
      if (publicIdMatch && publicIdMatch[1]) {
        const publicId = publicIdMatch[1].split('.')[0];
        await deleteFromCloudinary(publicId);
      }
    }

    // Subir nueva imagen a Cloudinary
    const publicId = `event_${event._id}`;
    const result = await uploadToCloudinary(file, 'events', publicId);

    // Actualizar evento con la nueva URL de la imagen
    await Event.findByIdAndUpdate(req.params.id, { image: result.url });

    res.status(200).json({
      success: true,
      data: result.url
    });
  } catch (error) {
    return next(new ErrorResponse('Error al subir la imagen', 500));
  }
});

// @desc    Asistir a un evento
// @route   PUT /api/events/:id/attend
// @access  Private
exports.attendEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new ErrorResponse(`Evento no encontrado con id ${req.params.id}`, 404));
  }

  // Verificar si el usuario ya está asistiendo
  if (event.attendees.includes(req.user.id)) {
    return next(new ErrorResponse('Ya estás asistiendo a este evento', 400));
  }

  // Agregar usuario a la lista de asistentes
  event.attendees.push(req.user.id);
  await event.save();

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Cancelar asistencia a un evento
// @route   PUT /api/events/:id/cancel
// @access  Private
exports.cancelAttendance = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new ErrorResponse(`Evento no encontrado con id ${req.params.id}`, 404));
  }

  // Verificar si el usuario está asistiendo
  if (!event.attendees.includes(req.user.id)) {
    return next(new ErrorResponse('No estás asistiendo a este evento', 400));
  }

  // Remover usuario de la lista de asistentes
  event.attendees = event.attendees.filter(
    attendee => attendee.toString() !== req.user.id
  );
  
  await event.save();

  res.status(200).json({
    success: true,
    data: event
  });
});
