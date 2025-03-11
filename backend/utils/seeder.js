const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Event = require('../models/Event');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
mongoose.connect(process.env.MONGO_URI);

// Datos de muestra para usuarios
const users = [
  {
    name: 'Admin Usuario',
    email: 'admin@ejemplo.com',
    password: 'password123',
    bio: 'Administrador de la plataforma de eventos',
    avatar: 'https://res.cloudinary.com/' + process.env.CLOUDINARY_CLOUD_NAME + '/image/upload/v1740822656/rtc_p10/events/default-event.jpg'
  },
  {
    name: 'Juan Pérez',
    email: 'juan@ejemplo.com',
    password: 'password123',
    bio: 'Organizador de eventos musicales',
    avatar: 'https://res.cloudinary.com/' + process.env.CLOUDINARY_CLOUD_NAME + '/image/upload/v1740822656/rtc_p10/events/default-event.jpg'
  },
  {
    name: 'María García',
    email: 'maria@ejemplo.com',
    password: 'password123',
    bio: 'Amante de los eventos deportivos',
    avatar: 'https://res.cloudinary.com/' + process.env.CLOUDINARY_CLOUD_NAME + '/image/upload/v1740822656/rtc_p10/events/default-event.jpg'
  }
];

// Datos de muestra para eventos
const createEvents = (users) => {
  return [
    {
      title: 'Concierto de Rock',
      description: 'Un increíble concierto con las mejores bandas de rock de la ciudad.',
      location: 'Estadio Municipal',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días en el futuro
      category: 'Música',
      creator: users[0]._id,
      attendees: [users[1]._id, users[2]._id],
      image: 'https://res.cloudinary.com/' + process.env.CLOUDINARY_CLOUD_NAME + '/image/upload/v1740822656/rtc_p10/events/default-event.jpg'
    },
    {
      title: 'Torneo de Fútbol',
      description: 'Participa en el torneo de fútbol más grande de la temporada.',
      location: 'Complejo Deportivo Norte',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 días en el futuro
      category: 'Deportes',
      creator: users[1]._id,
      attendees: [users[0]._id],
      image: 'https://res.cloudinary.com/' + process.env.CLOUDINARY_CLOUD_NAME + '/image/upload/v1740822656/rtc_p10/events/default-event.jpg'
    },
    {
      title: 'Exposición de Arte Moderno',
      description: 'Descubre las obras de los artistas contemporáneos más destacados.',
      location: 'Galería Central',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días en el futuro
      category: 'Arte',
      creator: users[2]._id,
      attendees: [users[0]._id, users[1]._id],
      image: 'https://res.cloudinary.com/' + process.env.CLOUDINARY_CLOUD_NAME + '/image/upload/v1740822656/rtc_p10/events/default-event.jpg'
    },
    {
      title: 'Conferencia de Tecnología',
      description: 'Aprende sobre las últimas tendencias en tecnología y desarrollo.',
      location: 'Centro de Convenciones',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 días en el futuro
      category: 'Tecnología',
      creator: users[0]._id,
      attendees: [users[2]._id],
      image: 'https://res.cloudinary.com/' + process.env.CLOUDINARY_CLOUD_NAME + '/image/upload/v1740822656/rtc_p10/events/default-event.jpg'
    },
    {
      title: 'Festival Gastronómico',
      description: 'Degusta los mejores platos de la cocina internacional.',
      location: 'Plaza Mayor',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días en el futuro
      category: 'Gastronomía',
      creator: users[1]._id,
      attendees: [users[0]._id, users[2]._id],
      image: 'https://res.cloudinary.com/' + process.env.CLOUDINARY_CLOUD_NAME + '/image/upload/v1740822656/rtc_p10/events/default-event.jpg'
    }
  ];
};

// Importar datos
const importData = async () => {
  try {
    // Limpiar la base de datos
    await User.deleteMany();
    await Event.deleteMany();

    // Crear usuarios con contraseñas hasheadas
    const createdUsers = [];
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const createdUser = await User.create({
        ...user,
        password: hashedPassword
      });
      
      createdUsers.push(createdUser);
    }

    // Crear eventos
    const events = createEvents(createdUsers);
    await Event.insertMany(events);

    console.log('✅ Datos importados correctamente\r\n');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Eliminar datos
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Event.deleteMany();

    console.log('✅ Datos eliminados correctamente\r\n');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Ejecutar según el argumento
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Por favor, especifica una opción: -i (importar) o -d (eliminar)');
  process.exit();
}
