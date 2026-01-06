const express = require('express');
const router = express.Router();

module.exports = (models) => {
  const recuperacionController = require('../../controllers/auth.recuperacion.controller')(models);

  /**
   * @swagger
   * tags:
   *   name: Recuperación de Contraseña
   *   description: Solicitar y restablecer contraseña olvidada
   */

  /**
   * @swagger
   * /api/v1/recuperacion/solicitar:
   *   post:
   *     summary: Solicitar recuperación de contraseña
   *     description: Envía un email con un token para restablecer la contraseña
   *     tags: [Recuperación de Contraseña]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "ejemplo@mail.com"
   *                 description: Email del usuario que solicita recuperar su contraseña
   *     responses:
   *       200:
   *         description: Email de recuperación enviado exitosamente
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
   *                   example: "Si el email existe, recibirás un correo con instrucciones"
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/solicitar', recuperacionController.solicitarRecuperacion);

  /**
   * @swagger
   * /api/v1/recuperacion/verificar/{token}:
   *   get:
   *     summary: Verificar si un token de recuperación es válido
   *     description: Valida que el token no haya expirado y no haya sido usado
   *     tags: [Recuperación de Contraseña]
   *     parameters:
   *       - in: path
   *         name: token
   *         required: true
   *         schema:
   *           type: string
   *         description: Token de recuperación recibido por email
   *         example: "a1b2c3d4e5f6g7h8i9j0"
   *     responses:
   *       200:
   *         description: Token válido
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
   *                   example: "Token válido"
   *                 data:
   *                   type: object
   *                   properties:
   *                     email:
   *                       type: string
   *                       example: "usuario@ejemplo.com"
   *       400:
   *         description: Token inválido, expirado o ya usado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Token inválido o expirado"
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  router.get('/verificar/:token', recuperacionController.verificarToken);

  /**
   * @swagger
   * /api/v1/recuperacion/restablecer:
   *   post:
   *     summary: Restablecer contraseña con el token
   *     description: Establece una nueva contraseña usando el token de recuperación válido
   *     tags: [Recuperación de Contraseña]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - token
   *               - nueva_contrasena
   *             properties:
   *               token:
   *                 type: string
   *                 example: "a1b2c3d4e5f6g7h8i9j0"
   *                 description: Token de recuperación recibido por email
   *               nueva_contrasena:
   *                 type: string
   *                 format: password
   *                 minLength: 6
   *                 example: "Nueva954"
   *                 description: Nueva contraseña (mínimo 6 caracteres una mayuscula y un numero)
   *     responses:
   *       200:
   *         description: Contraseña restablecida exitosamente
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
   *                   example: "Contraseña restablecida exitosamente"
   *       400:
   *         description: Token inválido o contraseña no válida
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Token inválido, expirado o ya usado"
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  router.post('/restablecer', recuperacionController.restablecerContrasena);

  return router;
};