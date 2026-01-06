const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TokenRecuperacionContrasena = sequelize.define(
    "tokens_recuperacion_contrasena",
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
      token: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      fecha_expiracion: {
        type: DataTypes.DATE,
        allowNull: false
      },
      usado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      timestamps: false,
      tableName: "tokens_recuperacion_contrasena",
      indexes: [
        { fields: ["token"] },
        { fields: ["usuario_id"] },
        { fields: ["fecha_expiracion"] }
      ]
    }
  );

  // Método para verificar si el token está vencido
  TokenRecuperacionContrasena.prototype.estaVencido = function() {
    return new Date() > new Date(this.fecha_expiracion);
  };

  return TokenRecuperacionContrasena;
};