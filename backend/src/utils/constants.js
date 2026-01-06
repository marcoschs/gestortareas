// Estados de tareas
const ESTADOS_TAREA = {
  PENDIENTE: "pendiente",
  EN_PROGRESO: "en_progreso",
  COMPLETADA: "completada"
};

// Prioridades de tareas
const PRIORIDADES_TAREA = {
  BAJA: "baja",
  MEDIA: "media",
  ALTA: "alta",
  URGENTE: "urgente"
};

// Mensajes de error comunes
const MENSAJES_ERROR = {
  NO_AUTORIZADO: "No autorizado",
  TOKEN_INVALIDO: "Token inválido",
  CREDENCIALES_INVALIDAS: "Credenciales inválidas",
  USUARIO_NO_ENCONTRADO: "Usuario no encontrado",
  EMAIL_EN_USO: "El email ya está en uso",
  NOMBRE_USUARIO_EN_USO: "El nombre de usuario ya está en uso",
  RECURSO_NO_ENCONTRADO: "Recurso no encontrado",
  SIN_PERMISOS: "No tienes permisos para realizar esta acción"
};

module.exports = {
  ESTADOS_TAREA,
  PRIORIDADES_TAREA,
  MENSAJES_ERROR
};