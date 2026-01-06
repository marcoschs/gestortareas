const { respuestaExito, respuestaError } = require("../utils/helpers");

module.exports = (models) => {
  const { Tarea } = models;

  return {

    // Crear una nueva tarea
    crearTarea: async (req, res, next) => {
      try {
        const {
          titulo,
          descripcion,
          estado,
          prioridad,
          fecha_vencimiento,
          fecha_recordatorio
        } = req.body;
        const usuario_id = req.usuario.id;

        // Crear la tarea
        const nuevaTarea = await Tarea.create({
          usuario_id,
          titulo,
          descripcion,
          estado: estado || 'pendiente',
          prioridad: prioridad || 'media',
          fecha_vencimiento: fecha_vencimiento || null,
          fecha_recordatorio: fecha_recordatorio || null,
          numero_orden: 0,
          esta_archivada: false
        });

        return respuestaExito(res, 201, "Tarea creada exitosamente", nuevaTarea);
      } catch (error) {
        next(error);
      }
    },

    // Obtener todas las tareas del usuario con filtros y paginación
    obtenerTareas: async (req, res, next) => {
      try {
        const usuario_id = req.usuario.id;
        const {
          estado,
          prioridad,
          esta_archivada,
          buscar,
          ordenar_por,
          orden
        } = req.query;

        // Construir filtros
        const where = {
          usuario_id,
          fecha_eliminacion: null
        };

        if (estado) {
          where.estado = estado;
        }

        if (prioridad) {
          where.prioridad = prioridad;
        }

        if (esta_archivada !== undefined) {
          where.esta_archivada = esta_archivada === 'true';
        }

        // Búsqueda por título o descripción
        if (buscar) {
          const { Op } = require('sequelize');
          where[Op.or] = [
            { titulo: { [Op.like]: `%${buscar}%` } },
            { descripcion: { [Op.like]: `%${buscar}%` } }
          ];
        }

        // Configurar ordenamiento
        const order = [];
        if (ordenar_por) {
          order.push([ordenar_por, orden === 'DESC' ? 'DESC' : 'ASC']);
        } else {
          // Por defecto: orden personalizado y luego por fecha de creación
          order.push(['numero_orden', 'ASC'], ['fecha_creacion', 'DESC']);
        }

        // Consultar TODAS las tareas sin límite
        const tareas = await Tarea.findAll({
          where,
          order
        });

        return respuestaExito(res, 200, "Tareas obtenidas exitosamente", {
          tareas,
          total: tareas.length
        });
      } catch (error) {
        next(error);
      }
    },

    // Obtener una tarea por ID
    obtenerTareaPorId: async (req, res, next) => {
      try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;

        const tarea = await Tarea.findOne({
          where: {
            id,
            usuario_id,
            fecha_eliminacion: null
          }
        });

        if (!tarea) {
          return respuestaError(res, 404, "Tarea no encontrada");
        }

        return respuestaExito(res, 200, "Tarea obtenida exitosamente", tarea);
      } catch (error) {
        next(error);
      }
    },

    // Actualizar tarea
    actualizarTarea: async (req, res, next) => {
      try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;
        const {
          titulo,
          descripcion,
          estado,
          prioridad,
          fecha_vencimiento,
          fecha_recordatorio,
          numero_orden,
          esta_archivada
        } = req.body;

        // Buscar la tarea
        const tarea = await Tarea.findOne({
          where: {
            id,
            usuario_id,
            fecha_eliminacion: null
          }
        });

        if (!tarea) {
          return respuestaError(res, 404, "Tarea no encontrada");
        }

        // Actualizar campos
        if (titulo !== undefined) tarea.titulo = titulo;
        if (descripcion !== undefined) tarea.descripcion = descripcion;
        if (estado !== undefined) {
          tarea.estado = estado;
          // Si se marca como completada, guardar la fecha
          if (estado === 'completada' && !tarea.fecha_completada) {
            tarea.fecha_completada = new Date();
          }
        }
        if (prioridad !== undefined) tarea.prioridad = prioridad;
        if (fecha_vencimiento !== undefined) tarea.fecha_vencimiento = fecha_vencimiento;
        if (fecha_recordatorio !== undefined) tarea.fecha_recordatorio = fecha_recordatorio;
        if (numero_orden !== undefined) tarea.numero_orden = numero_orden;
        if (esta_archivada !== undefined) tarea.esta_archivada = esta_archivada;

        await tarea.save();

        return respuestaExito(res, 200, "Tarea actualizada exitosamente", tarea);
      } catch (error) {
        next(error);
      }
    },

    // Eliminar tarea (soft delete)
    eliminarTarea: async (req, res, next) => {
      try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;

        const tarea = await Tarea.findOne({
          where: {
            id,
            usuario_id,
            fecha_eliminacion: null
          }
        });

        if (!tarea) {
          return respuestaError(res, 404, "Tarea no encontrada");
        }

        // Soft delete
        tarea.fecha_eliminacion = new Date();
        await tarea.save();

        return respuestaExito(res, 200, "Tarea eliminada exitosamente");
      } catch (error) {
        next(error);
      }
    },

    // Archivar/Desarchivar tarea
    toggleArchivar: async (req, res, next) => {
      try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;

        const tarea = await Tarea.findOne({
          where: {
            id,
            usuario_id,
            fecha_eliminacion: null
          }
        });

        if (!tarea) {
          return respuestaError(res, 404, "Tarea no encontrada");
        }

        // Toggle archivar
        tarea.esta_archivada = !tarea.esta_archivada;
        await tarea.save();

        return respuestaExito(
          res,
          200,
          `Tarea ${tarea.esta_archivada ? 'archivada' : 'desarchivada'} exitosamente`,
          tarea
        );
      } catch (error) {
        next(error);
      }
    }
  };
};