const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Por favor ingrese un título para el evento'],
    trim: true,
    maxlength: [100, 'El título no puede tener más de 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Por favor ingrese una descripción'],
    maxlength: [1000, 'La descripción no puede tener más de 1000 caracteres']
  },
  location: {
    type: String,
    required: [true, 'Por favor ingrese una ubicación']
  },
  date: {
    type: Date,
    required: [true, 'Por favor ingrese una fecha para el evento']
  },
  image: {
    type: String,
    default: 'https://res.cloudinary.com/'+process.env.CLOUDINARY_CLOUD_NAME+'/image/upload/v1/events/default-event.jpg'
  },
  category: {
    type: String,
    required: [true, 'Por favor seleccione una categoría'],
    enum: [
      'Música',
      'Deportes',
      'Arte',
      'Tecnología',
      'Gastronomía',
      'Educación',
      'Otro'
    ]
  },
  creator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', EventSchema);