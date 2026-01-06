const crypto = require("crypto");

// Genera un token aleatorio
const generarTokenAleatorio = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

// Calcula la fecha de expiración
const calcularFechaExpiracion = (tiempo) => {
  const ahora = new Date();
  
  // Parsear tiempo (ej: "7d", "24h", "30m")
  const valor = parseInt(tiempo);
  const unidad = tiempo.slice(-1);
  
  switch (unidad) {
    case "d": // días
      ahora.setDate(ahora.getDate() + valor);
      break;
    case "h": // horas
      ahora.setHours(ahora.getHours() + valor);
      break;
    case "m": // minutos
      ahora.setMinutes(ahora.getMinutes() + valor);
      break;
    default:
      ahora.setDate(ahora.getDate() + 1); // por defecto 1 día
  }
  
  return ahora;
};

// Formatea una respuesta de éxito
const respuestaExito = (res, statusCode = 200, message, data = null) => {
  const respuesta = {
    ok: true,
    message
  };
  
  if (data !== null) {
    respuesta.data = data;
  }
  
  return res.status(statusCode).json(respuesta);
};

// Formatea una respuesta de error
const respuestaError = (res, statusCode = 500, message, errors = null) => {
  const respuesta = {
    ok: false,
    message
  };
  
  if (errors !== null) {
    respuesta.errors = errors;
  }
  
  return res.status(statusCode).json(respuesta);
};

// Verifica si una fecha está en el pasado
const estaEnElPasado = (fecha) => {
  return new Date(fecha) < new Date();
};

//Sanitiza objeto para respuesta (remueve campos sensibles)
const sanitizarObjeto = (obj, camposARemover = []) => {
  const objCopia = { ...obj };
  camposARemover.forEach(campo => delete objCopia[campo]);
  return objCopia;
};

module.exports = {
  generarTokenAleatorio,
  calcularFechaExpiracion,
  respuestaExito,
  respuestaError,
  estaEnElPasado,
  sanitizarObjeto
};