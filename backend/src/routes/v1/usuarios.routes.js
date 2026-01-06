const express = require("express");
const { verificarToken } = require("../../middlewares/auth.middleware");
const { manejarErroresValidacion } = require("../../middlewares/validation.middleware");
const { body } = require("express-validator");

module.exports = (models) => {
  const router = express.Router();
  const authController = require("../../controllers/auth.controller")(models);

  // Todas las rutas de usuarios requieren autenticación
  router.use(verificarToken);

  /**
   * @swagger
   * tags:
   *   name: Usuarios
   *   description: Operaciones sobre el usuario autenticado
   */

  /**
   * @swagger
   * /api/v1/usuarios/mi-perfil:
   *   get:
   *     summary: Obtener perfil completo del usuario autenticado
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Perfil del usuario obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Usuario'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  router.get("/mi-perfil", authController.obtenerPerfil);

  /**
   * @swagger
   * /api/v1/usuarios/mi-perfil:
   *   put:
   *     summary: Actualizar perfil del usuario autenticado
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nombres:
   *                 type: string
   *                 example: "Marcos Vinicio"
   *               apellidos:
   *                 type: string
   *                 example: "Chavez Saltos"
   *               nombre_usuario:
   *                 type: string
   *                 example: "marcosch"
   *               email:
   *                 type: string
   *                 example: "marcos@gmail.com"
   *     responses:
   *       200:
   *         description: Perfil actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Perfil actualizado exitosamente"
   *                 data:
   *                   $ref: '#/components/schemas/Usuario'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  router.put(
    "/mi-perfil",
    [
      body("nombres")
        .optional()
        .trim()
        .notEmpty().withMessage("Los nombres no pueden estar vacíos")
        .isLength({ min: 1, max: 50 }).withMessage("Los nombres deben tener entre 1 y 50 caracteres"),
      
      body("apellidos")
        .optional()
        .trim()
        .notEmpty().withMessage("Los apellidos no pueden estar vacíos")
        .isLength({ min: 1, max: 50 }).withMessage("Los apellidos deben tener entre 1 y 50 caracteres"),
      
      body("nombre_usuario")
        .optional()
        .trim()
        .notEmpty().withMessage("El nombre de usuario no puede estar vacío")
        .isLength({ min: 3, max: 50 }).withMessage("El nombre de usuario debe tener entre 3 y 50 caracteres")
        .matches(/^[a-zA-Z0-9_]+$/).withMessage("El nombre de usuario solo puede contener letras, números y guiones bajos"),

      body("email")
        .optional()
        .trim()
        .isEmail().withMessage("El email debe ser válido")
        .normalizeEmail()
    ],
    manejarErroresValidacion,
    authController.actualizarPerfil
  );

  /**
   * @swagger
   * /api/v1/usuarios/cambiar-contrasena:
   *   put:
   *     summary: Cambiar la contraseña del usuario autenticado
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - contrasenaActual
   *               - contrasenaNueva
   *             properties:
   *               contrasenaActual:
   *                 type: string
   *                 example: "password123"
   *               contrasenaNueva:
   *                 type: string
   *                 example: "newpassword456"
   *     responses:
   *       200:
   *         description: Contraseña cambiada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Contraseña cambiada exitosamente. Por favor, inicia sesión nuevamente"
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         description: Contraseña actual incorrecta o token inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  router.put(
    "/cambiar-contrasena",
    [
      body("contrasenaActual")
        .notEmpty().withMessage("La contraseña actual es requerida"),
      
      body("contrasenaNueva")
        .notEmpty().withMessage("La nueva contraseña es requerida")
        .isLength({ min: 6 }).withMessage("La nueva contraseña debe tener al menos 6 caracteres")
    ],
    manejarErroresValidacion,
    authController.cambiarContrasena
  );

  return router;
};