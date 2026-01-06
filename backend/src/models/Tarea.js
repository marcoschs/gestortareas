const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Tarea = sequelize.define(
    "tareas",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "id"
        },
        onDelete: "CASCADE"
      },
      titulo: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 200]
        }
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      estado: {
        type: DataTypes.ENUM("pendiente", "en_progreso", "completada"),
        defaultValue: "pendiente",
        allowNull: false
      },
      prioridad: {
        type: DataTypes.ENUM("baja", "media", "alta", "urgente"),
        defaultValue: "media",
        allowNull: false
      },
      fecha_vencimiento: {
        type: DataTypes.DATE,
        allowNull: true
      },
      fecha_recordatorio: {
        type: DataTypes.DATE,
        allowNull: true
      },
      fecha_completada: {
        type: DataTypes.DATE,
        allowNull: true
      },
      numero_orden: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      esta_archivada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      fecha_actualizacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      fecha_eliminacion: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      timestamps: true,
      createdAt: "fecha_creacion",
      updatedAt: "fecha_actualizacion",
      paranoid: true,
      deletedAt: "fecha_eliminacion",
      tableName: "tareas",
      indexes: [
        { fields: ["usuario_id"] },
        { fields: ["estado"] },
        { fields: ["prioridad"] },
        { fields: ["fecha_vencimiento"] },
        { fields: ["fecha_eliminacion"] }
      ]
    }
  );

  // Hook para establecer fecha de completada automáticamente
  Tarea.beforeUpdate(async (tarea) => {
    if (tarea.changed("estado") && tarea.estado === "completada" && !tarea.fecha_completada) {
      tarea.fecha_completada = new Date();
    }
  });

  // Método para verificar si está atrasada
  Tarea.prototype.estaAtrasada = function() {
    if (!this.fecha_vencimiento || this.estado === "completada") {
      return false;
    }
    return new Date() > new Date(this.fecha_vencimiento);
  };

  Tarea.associate = (models) => {
    // Relación con Usuario
    Tarea.belongsTo(models.usuarios, {
      foreignKey: 'usuario_id',
      as: 'usuario'
    });
  };

  return Tarea;
};