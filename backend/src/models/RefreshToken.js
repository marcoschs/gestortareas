const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RefreshToken = sequelize.define(
    "RefreshToken",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "id",
        },
      },
      token: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      fecha_expiracion: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "refresh_tokens",
      timestamps: false, 
      indexes: [
        {
          fields: ["token"],
          name: "idx_token",
        },
        {
          fields: ["usuario_id"],
          name: "idx_usuario_id",
        },
      ],
    }
  );

  return RefreshToken;
};