const sequelize = require("../config/database");
const Usuario = require("./Usuario")(sequelize);
const RefreshToken = require("./RefreshToken")(sequelize);
const Tarea = require("./Tarea")(sequelize);
const TokenRecuperacionContrasena = require("./TokenRecuperacionContrasena")(sequelize);

// Definir relaciones

// Usuario tiene muchos RefreshTokens
Usuario.hasMany(RefreshToken, { foreignKey: "usuario_id", as: "refreshTokens" });
RefreshToken.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });

// Usuario tiene muchas Tareas
Usuario.hasMany(Tarea, { foreignKey: "usuario_id", as: "tareas" });
Tarea.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });

// Usuario tiene muchos TokenRecuperacionContrasena
Usuario.hasMany(TokenRecuperacionContrasena, { foreignKey: "usuario_id", as: "tokensRecuperacion" });
TokenRecuperacionContrasena.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });

// Exportar modelos
const models = {
  Usuario,
  RefreshToken,
  Tarea,
  TokenRecuperacionContrasena,
  sequelize
};

// Función para sincronizar base de datos
async function syncDb() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a la base de datos establecida correctamente");
    
    // Sincronizar modelos (alter: true actualiza sin borrar datos)
    await sequelize.sync({ alter: false });
    console.log("Modelos sincronizados con la base de datos");
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    throw error;
  }
}

module.exports = { models, syncDb, sequelize };