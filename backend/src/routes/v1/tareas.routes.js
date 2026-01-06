const express = require("express");
const tareasController = require("../../controllers/tareas.controller");
const { verificarToken } = require("../../middlewares/auth.middleware");
const { manejarErroresValidacion } = require("../../middlewares/validation.middleware");
const {
  validarCrearTarea,
  validarActualizarTarea,
  validarIdParam
} = require("../../utils/validators");

module.exports = (models) => {
  const router = express.Router();
  const controller = tareasController(models);

  // Todas las rutas requieren autenticación
  router.use(verificarToken);

  /**
   * @swagger
   * tags:
   *   name: Tareas
   *   description: Gestión de tareas del usuario
   */

  /**
   * @swagger
   * /api/v1/tareas:
   *   post:
   *     summary: Crear una nueva tarea para el usuario autenticado
   *     tags: [Tareas]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - titulo
   *               - descripcion
   *               - estado
   *               - prioridad
   *             properties:
   *               titulo:
   *                 type: string
   *                 example: "Completar proyecto"
   *               descripcion:
   *                 type: string
   *                 example: "Finalizar backend del gestor de tareas"
   *               prioridad:
   *                 type: string
   *                 enum: ["baja", "media", "alta", "urgente"]
   *                 example: "alta"
   *               fecha_vencimiento:
   *                 type: string
   *                 format: date-time
   *                 nullable: true
   *               fecha_recordatorio:
   *                 type: string
   *                 format: date-time
   *                 nullable: true
   *     responses:
   *       201:
   *         description: Tarea creada correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Tarea'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  router.post("/", validarCrearTarea, manejarErroresValidacion, controller.crearTarea);

  /**
   * @swagger
   * /api/v1/tareas:
   *   get:
   *     summary: Obtener todas las tareas del usuario
   *     tags: [Tareas]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de tareas
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Tarea'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  router.get("/", controller.obtenerTareas);

  /**
   * @swagger
   * /api/v1/tareas/{id}:
   *   get:
   *     summary: Obtener una tarea por ID
   *     tags: [Tareas]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *           example: 1
   *     responses:
   *       200:
   *         description: Tarea encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Tarea'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  router.get("/:id", validarIdParam, manejarErroresValidacion, controller.obtenerTareaPorId);

  /**
   * @swagger
   * /api/v1/tareas/{id}:
   *   put:
   *     summary: Actualizar una tarea
   *     tags: [Tareas]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *           example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               titulo:
   *                 type: string
   *                 example: "Completar proyecto actualizado"
   *               descripcion:
   *                 type: string
   *                 example: "Actualizar backend del gestor de tareas"
   *               estado:
   *                 type: string
   *                 enum: ["pendiente", "en_progreso", "completada"]
   *                 example: "en_progreso"
   *               prioridad:
   *                 type: string
   *                 enum: ["baja", "media", "alta", "urgente"]
   *                 example: "alta"
   *               fecha_vencimiento:
   *                 type: string
   *                 format: date-time
   *                 nullable: true
   *               fecha_recordatorio:
   *                 type: string
   *                 format: date-time
   *                 nullable: true
   *     responses:
   *       200:
   *         description: Tarea actualizada correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Tarea'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  router.put("/:id", validarActualizarTarea, manejarErroresValidacion, controller.actualizarTarea);

  /**
   * @swagger
   * /api/v1/tareas/{id}:
   *   delete:
   *     summary: Eliminar una tarea (soft delete)
   *     tags: [Tareas]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *           example: 1
   *     responses:
   *       200:
   *         description: Tarea eliminada correctamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Tarea eliminada correctamente"
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  router.delete("/:id", validarIdParam, manejarErroresValidacion, controller.eliminarTarea);

  return router;
};
