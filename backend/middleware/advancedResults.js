const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // Copiar req.query
  const reqQuery = { ...req.query };

  // Campos a excluir
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Eliminar campos para no coincidir con el filtrado
  removeFields.forEach(param => delete reqQuery[param]);

  // Procesar campos de fecha y otros operadores
  let queryObj = {};

  // Procesar fechas
  if (reqQuery.startDate) {
    queryObj.date = queryObj.date || {};
    queryObj.date.$gte = new Date(reqQuery.startDate);
    delete reqQuery.startDate;
  }

  if (reqQuery.endDate) {
    queryObj.date = queryObj.date || {};
    const endDate = new Date(reqQuery.endDate);
    endDate.setHours(23, 59, 59, 999);
    queryObj.date.$lte = endDate;
    delete reqQuery.endDate;
  }

  // Procesar otros campos
  Object.keys(reqQuery).forEach(key => {
    // Si es el campo category y está vacío, no lo incluimos en la consulta
    if (key === 'category' && (!reqQuery[key] || reqQuery[key] === '')) {
      return;
    }

    // Para otros campos, solo los procesamos si tienen valor
    if (!reqQuery[key] || reqQuery[key] === '') {
      return;
    }

    if (typeof reqQuery[key] === 'string') {
      // Buscar operadores en el valor
      const operators = ['gt', 'gte', 'lt', 'lte', 'in'];
      const [field, operator] = key.split('_');
      
      if (operators.includes(operator)) {
        queryObj[field] = queryObj[field] || {};
        queryObj[field][`$${operator}`] = reqQuery[key];
      } else {
        // Si es una búsqueda por texto, usamos una expresión regular para búsqueda parcial
        if (['search', 'location'].includes(key)) {
          queryObj[key] = new RegExp(reqQuery[key], 'i');
        } else {
          queryObj[key] = reqQuery[key];
        }
      }
    } else {
      queryObj[key] = reqQuery[key];
    }
  });

  // Encontrar recursos
  query = model.find(queryObj);

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Paginación
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments(queryObj);

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  // Ejecutar consulta
  const results = await query;

  // Objeto de paginación
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };

  next();
};

module.exports = advancedResults;
