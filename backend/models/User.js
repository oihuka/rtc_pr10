const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor ingrese un nombre'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Por favor ingrese un email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingrese un email válido'
    ]
  },
  password: {
    type: String,
    required: [true, 'Por favor ingrese una contraseña'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/' + process.env.CLOUDINARY_CLOUD_NAME + '/image/upload/v1741704872/rtc_p10/events/default-avatar.png'
  },
  bio: {
    type: String,
    maxlength: [500, 'La biografía no puede tener más de 500 caracteres']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Encriptar contraseña usando bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Firmar JWT y retornar
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Verificar si la contraseña coincide
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Relación virtual con eventos creados
UserSchema.virtual('events', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'creator',
  justOne: false
});

module.exports = mongoose.model('User', UserSchema);