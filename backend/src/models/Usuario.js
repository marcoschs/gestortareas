const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize) => {
  const Usuario = sequelize.define(
    "usuarios",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre_usuario: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 50]
        }
      },
      email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
          notEmpty: true
        }
      },
      contrasena: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      nombres: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      apellidos: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      esta_activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "fecha_creacion"
      },
      fecha_actualizacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "fecha_actualizacion"
      }
    },
    {
      timestamps: true,
      createdAt: "fecha_creacion",
      updatedAt: "fecha_actualizacion",
      paranoid: false,
      tableName: "usuarios",
      indexes: [
        { fields: ["email"] },
        { fields: ["nombre_usuario"] }
      ]
    }
  );

  // Hook para hashear contraseña antes de crear usuario
  Usuario.beforeCreate(async (usuario) => {
    if (usuario.contrasena) {
      const salt = await bcrypt.genSalt(10);
      usuario.contrasena = await bcrypt.hash(usuario.contrasena, salt);
    }
  });

  // Hook para hashear contraseña antes de actualizar usuario
  Usuario.beforeUpdate(async (usuario) => {
    if (usuario.contrasena && !usuario.contrasena.startsWith('$2a$') && !usuario.contrasena.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      usuario.contrasena = await bcrypt.hash(usuario.contrasena, salt);
    }
  });

  // Método de instancia para comparar contraseñas
  Usuario.prototype.compararContrasena = async function(contrasenaIngresada) {
    return await bcrypt.compare(contrasenaIngresada, this.contrasena);
  };

  // Método de instancia para obtener datos públicos del usuario
  Usuario.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.contrasena;
    return values;
  };

  return Usuario;
};