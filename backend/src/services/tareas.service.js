module.exports = (models) => {
  const { Tarea, Usuario, Etiqueta } = models;
  const { Op } = require('sequelize');

  const service = {
    // Obtener todas las tareas de un usuario
    obtenerPorUsuario: async (usuarioId, filtros = {}) => {
      try {
        const where = {
          usuario_id: usuarioId,
          fecha_eliminacion: null
        };

        // Filtros opcionales
        if (filtros.estado) where.estado = filtros.estado;
        if (filtros.prioridad) where.prioridad = filtros.prioridad;

        const tareas = await Tarea.findAll({
          where,
          include: [includeEtiquetas],
          order: [['fecha_creacion', 'DESC']]
        });

        return tareas;
      } catch (error) {
        throw error;
      }
    },

    // Obtener una tarea por ID
    obtenerPorId: async (id) => {
      try {
        const tarea = await Tarea.findOne({
          where: { id },
          include: [includeEtiquetas]
        });
        return tarea;
      } catch (error) {
        throw error;
      }
    },

    // Crear una tarea
    crear: async (datos) => {
      const transaction = await models.sequelize.transaction();
      
      try {
        const tarea = await Tarea.create(datosTarea, { transaction });
        await transaction.commit();
        return await service.obtenerPorId(tarea.id);

      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    },

    // Actualizar una tarea 
    actualizar: async (id, datos) => {
      const transaction = await models.sequelize.transaction();
      
      try {
        const tarea = await Tarea.findByPk(id);
        
        if (!tarea) {
          throw new Error('Tarea no encontrada');
        }

        // Actualizar campos de la tarea
        await tarea.update(datosTarea, { transaction });
        await transaction.commit();

        // Retornar la tarea actualizada 
        return await service.obtenerPorId(id);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    },

    // Buscar tareas
    buscar: async (usuarioId, termino) => {
      try {
        const tareas = await Tarea.findAll({
          where: {
            usuario_id: usuarioId,
            fecha_eliminacion: null,
            [Op.or]: [
              { titulo: { [Op.like]: `%${termino}%` } },
              { descripcion: { [Op.like]: `%${termino}%` } }
            ]
          },
          order: [['fecha_creacion', 'DESC']]
        });

        return tareas;
      } catch (error) {
        throw error;
      }
    },

    //Obtener tareas por rango de fechas 
    obtenerPorRangoFechas: async (usuarioId, fechaInicio, fechaFin) => {
      try {
        const tareas = await Tarea.findAll({
          where: {
            usuario_id: usuarioId,
            fecha_eliminacion: null,
            fecha_vencimiento: {
              [Op.between]: [fechaInicio, fechaFin]
            }
          },
          include: [includeEtiquetas],
          order: [['fecha_vencimiento', 'ASC']]
        });

        return tareas;
      } catch (error) {
        throw error;
      }
    }

  };

  return service;
};