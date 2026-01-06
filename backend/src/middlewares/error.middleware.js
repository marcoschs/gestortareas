//Middleware centralizado para manejo de errores

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Error de Sequelize - Validación
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      ok: false,
      message: "Error de validación",
      errors: err.errors.map(e => ({
        campo: e.path,
        mensaje: e.message
      }))
    });
  }

  // Error de Sequelize - Unique constraint
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      ok: false,
      message: "El registro ya existe",
      errors: err.errors.map(e => ({
        campo: e.path,
        mensaje: `${e.path} ya está en uso`
      }))
    });
  }

  // Error de Sequelize - Foreign key constraint
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      ok: false,
      message: "Referencia inválida",
      error: "El registro al que intentas hacer referencia no existe"
    });
  }

  // Error de Sequelize - Database error
  if (err.name === "SequelizeDatabaseError") {
    return res.status(500).json({
      ok: false,
      message: "Error en la base de datos",
      error: process.env.NODE_ENV === "development" ? err.message : "Error interno"
    });
  }

  // Error personalizado con statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      ok: false,
      message: err.message || "Error en la petición"
    });
  }

  // Error genérico
  res.status(500).json({
    ok: false,
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
};

// Clase para crear errores personalizados con statusCode
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  AppError
};