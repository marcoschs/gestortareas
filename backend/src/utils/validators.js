const { body, param, query } = require('express-validator');

// Validadores para registro de usuario
const validarRegistro = [
  body('nombre_usuario')
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),
  
  body('contrasena')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  
  body('nombres')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Los nombres no pueden exceder 50 caracteres'),
  
  body('apellidos')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Los apellidos no pueden exceder 50 caracteres')
];

// Validadores para login
const validarLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),
  
  body('contrasena')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// Validadores para refresh token
const validarRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('El refresh token es requerido')
    .isString()
    .withMessage('El refresh token debe ser una cadena de texto')
];

// Validadores para recuperación de contraseña
const validarSolicitudRecuperacion = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail()
];

const validarRestablecerContrasena = [
  body('token')
    .notEmpty()
    .withMessage('El token es requerido'),
  
  body('nuevaContrasena')
    .notEmpty()
    .withMessage('La nueva contraseña es requerida')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número')
];

// Validadores para actualizar perfil
const validarActualizarPerfil = [
  body('nombres')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Los nombres no pueden exceder 50 caracteres'),
  
  body('apellidos')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Los apellidos no pueden exceder 50 caracteres')
];

// Validadores para crear tarea
const validarCrearTarea = [
  body('titulo')
    .trim()
    .notEmpty()
    .withMessage('El título es requerido')
    .isLength({ max: 200 })
    .withMessage('El título no puede exceder 200 caracteres'),
  
  body('descripcion')
    .optional()
    .trim(),
  
  body('estado')
    .optional()
    .isIn(['pendiente', 'en_progreso', 'completada'])
    .withMessage('Estado inválido. Debe ser: pendiente, en_progreso o completada'),
  
  body('prioridad')
    .optional()
    .isIn(['baja', 'media', 'alta', 'urgente'])
    .withMessage('Prioridad inválida. Debe ser: baja, media, alta o urgente'),
  
  body('fecha_vencimiento')
    .optional()
    .isISO8601()
    .withMessage('Fecha de vencimiento inválida. Formato: YYYY-MM-DD'),
  
  body('fecha_recordatorio')
    .optional()
    .isISO8601()
    .withMessage('Fecha de recordatorio inválida. Formato: YYYY-MM-DD')

];

// Validadores para actualizar tarea
const validarActualizarTarea = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de tarea inválido'),
  
  body('titulo')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('El título debe tener entre 1 y 200 caracteres'),
  
  body('descripcion')
    .optional()
    .trim(),
  
  body('estado')
    .optional()
    .isIn(['pendiente', 'en_progreso', 'completada'])
    .withMessage('Estado inválido'),
  
  body('prioridad')
    .optional()
    .isIn(['baja', 'media', 'alta', 'urgente'])
    .withMessage('Prioridad inválida'),
  
  body('fecha_vencimiento')
    .optional()
    .isISO8601()
    .withMessage('Fecha de vencimiento inválida'),
  
  body('fecha_recordatorio')
    .optional()
    .isISO8601()
    .withMessage('Fecha de recordatorio inválida')
];

// Validador para parámetro ID
const validarIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID inválido')
];

module.exports = {
  validarRegistro,
  validarLogin,
  validarRefreshToken,
  validarSolicitudRecuperacion,
  validarRestablecerContrasena,
  validarActualizarPerfil,
  validarCrearTarea,
  validarActualizarTarea,
  validarIdParam
};