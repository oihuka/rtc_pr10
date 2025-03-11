const cloudinary = require('../config/cloudinary');
const ErrorResponse = require('./errorResponse');

/**
 * Sube un archivo a Cloudinary
 * @param {Object} file - Archivo a subir
 * @param {String} folder - Carpeta en Cloudinary (avatars, events)
 * @param {String} publicId - ID público para el archivo (opcional)
 * @returns {Promise} - URL de la imagen subida
 */
const uploadToCloudinary = async (file, folder, publicId = null) => {
  try {
    const options = {
      folder: folder,
      resource_type: 'auto',
      overwrite: true
    };
    
    if (publicId) {
      options.public_id = publicId;
    }
    
    // Convertir el archivo a base64 para subirlo
    const fileStr = `data:${file.mimetype};base64,${file.data.toString('base64')}`;
    
    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(fileStr, options);
    
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error al subir a Cloudinary:', error);
    throw new ErrorResponse('Error al subir la imagen', 500);
  }
};

/**
 * Elimina un archivo de Cloudinary
 * @param {String} publicId - ID público del archivo a eliminar
 * @returns {Promise}
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error al eliminar de Cloudinary:', error);
    // No lanzamos error para no interrumpir el flujo principal
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};
