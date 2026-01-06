const { validationResult } = require('express-validator');

// Middleware para manejar errores de validación de express-validator
const manejarErroresValidacion = (req, res, next) => {
  const errores = validationResult(req);
  
  if (!errores.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errores: errores.array().map(error => ({
        campo: error.path || error.param,
        mensaje: error.msg,
        valor: error.value
      }))
    });
  }
  
  next();
};

module.exports = {
  manejarErroresValidacion
};