const express = require("express");
const authController = require("../../controllers/auth.controller");
const { verificarToken } = require("../../middlewares/auth.middleware");
const { manejarErroresValidacion } = require("../../middlewares/validation.middleware");
const {
  validarRegistro,
  validarLogin,
  validarRefreshToken
} = require("../../utils/validators");

module.exports = (models) => {
  const router = express.Router();
  const controller = authController(models);

  /**
   * @swagger
   * tags:
   *   name: Auth
   *   description: Autenticación y gestión de tokens
   */

  /**
   * @swagger
   * /api/v1/auth/registro:
   *   post:
   *     summary: Registrar un nuevo usuario
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nombre_usuario
   *               - email
   *               - contrasena
   *               - nombres
   *               - apellidos
   *             properties:
   *               nombre_usuario:
   *                 type: string
   *                 example: "marcosch"
   *               email:
   *                 type: string
   *                 example: "marcos@gmail.com"
   *               contrasena:
   *                 type: string
   *                 example: "Ejemplo1"
   *               nombres:
   *                 type: string
   *                 example: "Marcos Vinicio"
   *               apellidos:
   *                 type: string
   *                 example: "Chavez Saltos"
   *     responses:
   *       201:
   *         description: Usuario creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Usuario'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post(
    "/registro",
    validarRegistro,
    manejarErroresValidacion,
    controller.registro
  );

  /**
   * @swagger
   * /api/v1/auth/login:
   *   post:
   *     summary: Iniciar sesión y obtener tokens
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - contrasena
   *             properties:
   *               email:
   *                 type: string
   *                 example: "marcos@gmail.com"
   *               contrasena:
   *                 type: string
   *                 example: "Ejemplo1"
   *     responses:
   *       200:
   *         description: Login exitoso, devuelve access y refresh token
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accessToken:
   *                   type: string
   *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *                 refreshToken:
   *                   type: string
   *                   example: "dGhpc2lzYXJlZnJlc2h0b2tlbg=="
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  router.post(
    "/login",
    validarLogin,
    manejarErroresValidacion,
    controller.login
  );

  /**
   * @swagger
   * /api/v1/auth/refresh:
   *   post:
   *     summary: Refrescar access token usando refresh token
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 example: "dGhpc2lzYXJlZnJlc2h0b2tlbg=="
   *     responses:
   *       200:
   *         description: Devuelve un nuevo access token
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accessToken:
   *                   type: string
   *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  router.post(
    "/refresh",
    validarRefreshToken,
    manejarErroresValidacion,
    controller.refrescarToken
  );

  /**
   * @swagger
   * /api/v1/auth/logout:
   *   post:
   *     summary: Logout del usuario (revoca refresh token actual)
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: false
   *     responses:
   *       200:
   *         description: Logout exitoso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Usuario desconectado correctamente"
   */
  router.post("/logout", controller.logout);

  /**
   * @swagger
   * /api/v1/auth/logout-todo:
   *   post:
   *     summary: Logout de todas las sesiones (revoca todos los refresh tokens)
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logout de todas las sesiones exitoso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Todas las sesiones han sido cerradas"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  router.post("/logout-todo", verificarToken, controller.logoutTodo);

  return router;
};
